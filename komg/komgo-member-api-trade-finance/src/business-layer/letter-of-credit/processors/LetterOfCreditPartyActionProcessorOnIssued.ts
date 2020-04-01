import { injectable, inject } from 'inversify'

import { getLogger } from '@komgo/logging'
import {
  ILetterOfCredit,
  LetterOfCreditStatus,
  CompanyRoles,
  LetterOfCreditTaskType,
  IDataLetterOfCredit,
  LetterOfCreditType
} from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'

import { TYPES, CONFIG } from '../../../inversify'
import { ErrorNames } from '../../../exceptions'

import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'

import { ILetterOfCreditTaskManager } from '../tasks/ILetterOfCreditTaskManager'
import { ILetterOfCreditNotificationManager } from '../notifications/ILetterOfCreditNotificationManager'

import { ILetterOfCreditDocumentService } from '../services/ILetterOfCreditDocumentService'
import { DOCUMENT_TYPE } from '../../documents/documentTypes'

import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ILetterOfCreditMessagingService } from '../messaging'
import { ILetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

@injectable()
export class LetterOfCreditPartyActionProcessorOnIssued implements ILetterOfCreditPartyActionProcessor {
  private readonly logger = getLogger('LetterOfCreditPartyActionProcessorOnIssued')

  private readonly taskManager: ILetterOfCreditTaskManager
  private readonly notificationManager: ILetterOfCreditNotificationManager
  private readonly kapsuleBaseUrl: string
  private readonly letterOfCreditDocumentService: ILetterOfCreditDocumentService
  private readonly letterOfCreditActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper
  private readonly companyRegistryService: ICompanyRegistryService
  private readonly messagingService: ILetterOfCreditMessagingService
  private readonly timerService: ILetterOfCreditTimerService

  private actions: Map<CompanyRoles, (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void>>

  constructor(
    @inject(TYPES.LetterOfCreditTaskManager) taskManager: ILetterOfCreditTaskManager,
    @inject(TYPES.LetterOfCreditNotificationManager) notificationManager: ILetterOfCreditNotificationManager,
    @inject(TYPES.LetterOfCreditPartyActionProcessorHelper)
    letterOfCreditActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper,
    @inject(TYPES.LetterOfCreditDocumentService) letterOfCreditDocumentService: ILetterOfCreditDocumentService,
    @inject(CONFIG.KapsuleUrl) kapsuleBaseUrl: string,
    @inject(TYPES.CompanyRegistryService) companyRegistryService: ICompanyRegistryService,
    @inject(TYPES.LetterOfCreditMessagingService) messagingService: ILetterOfCreditMessagingService,
    @inject(TYPES.LetterOfCreditTimerService) timerService: ILetterOfCreditTimerService
  ) {
    this.companyRegistryService = companyRegistryService
    this.letterOfCreditDocumentService = letterOfCreditDocumentService
    this.taskManager = taskManager
    this.notificationManager = notificationManager
    this.kapsuleBaseUrl = kapsuleBaseUrl
    this.letterOfCreditActionProcessorHelper = letterOfCreditActionProcessorHelper
    this.messagingService = messagingService
    this.timerService = timerService

    this.setupActions()
  }

  async executePartyActions(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    try {
      if (letterOfCredit.status !== LetterOfCreditStatus.Issued) {
        throw new Error('The processor cannot handle the letter of credit in this state')
      }
      const currentPartyRole = this.letterOfCreditActionProcessorHelper.getPartyRole(letterOfCredit)
      const partyAction = this.letterOfCreditActionProcessorHelper.getPartyAction(
        letterOfCredit,
        currentPartyRole,
        this.actions
      )
      if (partyAction) {
        await partyAction(letterOfCredit)
      }
    } catch (error) {
      this.logger.error(
        ErrorCode.UnexpectedError,
        ErrorNames.PartyActionsProcessorFailed,
        `Letter of Credit Party Action Processor Failed`,
        { StaticId: letterOfCredit.staticId, error: error.message },
        new Error().stack
      )
      throw error
    }
  }

  private async executeAplicantAction(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    await this.createNotificationThatLetterOfCreditHasBeenIssued(letterOfCredit)
    await this.deactiveIssuanceTimer(letterOfCredit)
  }

  private async executeIssuingBankAction(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    await this.shareLetterOfCreditDocument(letterOfCredit)
    await this.deactiveIssuanceTimer(letterOfCredit)
  }

  private async createNotificationThatLetterOfCreditHasBeenIssued(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>
  ) {
    this.logger.info('Company is applicant, creating notification', {
      staticId: letterOfCredit.staticId
    })
    const { issuingBank } = letterOfCredit.templateInstance.data
    const issuingBankName = issuingBank.x500Name.CN
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    const notificationMessage = `Request for ${lcType} [${letterOfCredit.reference}] [${
      letterOfCredit.templateInstance.data.issuingBankReference
    }] issued by ${issuingBankName}`

    await this.notificationManager.createNotification(
      letterOfCredit,
      notificationMessage,
      {},
      LetterOfCreditTaskType.ReviewIssued,
      TRADE_FINANCE_ACTION.ReviewIssuedLC
    )
  }

  private async shareLetterOfCreditDocument(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    this.logger.info('Company is issuing bank, solving task', {
      staticId: letterOfCredit.staticId
    })

    await this.taskManager.resolveTask(letterOfCredit, LetterOfCreditTaskType.ReviewRequested, true)
    await this.sendIssuedLetterOfCreditToCounterParties(letterOfCredit)

    if (letterOfCredit.issuingDocumentHash && letterOfCredit.issuingDocumentHash !== '') {
      this.logger.info('Sharing document with applicant')
      const { applicant } = letterOfCredit.templateInstance.data
      await this.letterOfCreditDocumentService.shareDocument(letterOfCredit, DOCUMENT_TYPE.LC, [applicant.staticId])
    } else {
      this.logger.info('There is no document to share for this Letter Of Credit', {
        staticId: letterOfCredit.staticId
      })
    }
  }

  private async sendIssuedLetterOfCreditToCounterParties(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    const recipients: string[] = []
    const { beneficiary, applicant } = letterOfCredit.templateInstance.data
    const hasBeneficiaryBank = letterOfCredit.templateInstance.data.beneficiaryBank ? true : false

    if (hasBeneficiaryBank) {
      const { beneficiaryBank } = letterOfCredit.templateInstance.data
      recipients.push(beneficiaryBank.staticId)
    }
    recipients.push(beneficiary.staticId)
    recipients.push(applicant.staticId)

    const companies = await this.companyRegistryService.getMembers(recipients)
    const membersStaticIds: string[] = companies.filter(company => company.isMember).map(company => company.staticId)

    await Promise.all(membersStaticIds.map(async member => this.messagingService.sendMessageTo(member, letterOfCredit)))
  }

  private async createTaskForBeneficiaryToReviewLetterOfCredit(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    this.logger.info('Company is beneficiary, creating task', {
      staticId: letterOfCredit.staticId
    })
    const { issuingBank } = letterOfCredit.templateInstance.data
    const issuingBankName = issuingBank.x500Name.CN
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    const taskMessage = `Request for ${lcType} [${letterOfCredit.reference}] [${
      letterOfCredit.templateInstance.data.issuingBankReference
    }] issued by ${issuingBankName}`

    await this.taskManager.createTask(
      letterOfCredit,
      taskMessage,
      LetterOfCreditTaskType.ReviewIssued,
      TRADE_FINANCE_ACTION.ReviewIssuedLC,
      {
        subject: `${lcType} Issued`,
        emailTaskTitle: `Review ${lcType} Issued`,
        emailTaskLink: `${this.kapsuleBaseUrl}/tasks`
      }
    )
  }

  private async deactiveIssuanceTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    if (letterOfCredit.templateInstance.data.issueDueDate) {
      this.logger.info('Timer deactivation started on issuing process')
      await this.timerService.deactivateTimer(letterOfCredit)
    }
  }

  private setupActions() {
    this.actions = new Map<CompanyRoles, (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void>>()
    this.actions.set(CompanyRoles.Applicant, this.executeAplicantAction.bind(this))
    this.actions.set(CompanyRoles.Beneficiary, this.createTaskForBeneficiaryToReviewLetterOfCredit.bind(this))
    this.actions.set(CompanyRoles.IssuingBank, this.executeIssuingBankAction.bind(this))
  }
}
