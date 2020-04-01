import { injectable, inject } from 'inversify'

import { getLogger } from '@komgo/logging'
import {
  ILetterOfCredit,
  LetterOfCreditStatus,
  CompanyRoles,
  LetterOfCreditTaskType,
  IDataLetterOfCredit
} from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'

import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { TYPES, CONFIG } from '../../../inversify'
import { ErrorNames } from '../../../exceptions'

import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'

import { ILetterOfCreditTaskManager } from '../tasks/ILetterOfCreditTaskManager'
import { ILetterOfCreditMessagingService } from '../messaging/ILetterOfCreditMessagingService'
import { ILetterOfCreditNotificationManager } from '../notifications/ILetterOfCreditNotificationManager'
import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'

import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

@injectable()
export class LetterOfCreditPartyActionProcessorOnRequested implements ILetterOfCreditPartyActionProcessor {
  private readonly logger = getLogger('LetterOfCreditPartyActionProcessorOnRequested')

  private readonly taskManager: ILetterOfCreditTaskManager
  private readonly notificationManager: ILetterOfCreditNotificationManager
  private readonly companyRegistryService: ICompanyRegistryService
  private readonly messagingService: ILetterOfCreditMessagingService
  private readonly companyStaticId: string
  private readonly kapsuleBaseUrl: string
  private readonly letterOfCreditActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper
  private readonly timerService: ILetterOfCreditTimerService
  private actions: Map<CompanyRoles, (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void>>

  constructor(
    @inject(TYPES.CompanyRegistryService) companyRegistryService: ICompanyRegistryService,
    @inject(CONFIG.CompanyStaticId) companyStaticId: string,
    @inject(TYPES.LetterOfCreditTaskManager) taskManager: ILetterOfCreditTaskManager,
    @inject(TYPES.LetterOfCreditNotificationManager) notificationManager: ILetterOfCreditNotificationManager,
    @inject(TYPES.LetterOfCreditMessagingService) messagingService: ILetterOfCreditMessagingService,
    @inject(TYPES.LetterOfCreditPartyActionProcessorHelper)
    letterOfCreditActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper,
    @inject(TYPES.LetterOfCreditTimerService) timerService: ILetterOfCreditTimerService,
    @inject(CONFIG.KapsuleUrl) kapsuleBaseUrl: string
  ) {
    this.companyRegistryService = companyRegistryService
    this.companyStaticId = companyStaticId
    this.taskManager = taskManager
    this.notificationManager = notificationManager
    this.messagingService = messagingService
    this.kapsuleBaseUrl = kapsuleBaseUrl
    this.letterOfCreditActionProcessorHelper = letterOfCreditActionProcessorHelper
    this.timerService = timerService
    this.setupActions()
  }

  async executePartyActions(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    try {
      if (letterOfCredit.status !== LetterOfCreditStatus.Requested) {
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

  private async executeIssuingBankAction(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    await this.createTaskToReviewLetterOfCredit(letterOfCredit)

    await this.createTimer(letterOfCredit)
  }

  private async createTaskToReviewLetterOfCredit(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    this.logger.info('Company is issuing bank, creating task', {
      staticId: letterOfCredit.staticId,
      companyId: this.companyStaticId
    })
    const { applicant } = letterOfCredit.templateInstance.data
    const applicantName = applicant.x500Name.CN
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    await this.taskManager.createTask(
      letterOfCredit,
      `${lcType} [${letterOfCredit.reference}] has been requested by ${applicantName}`,
      LetterOfCreditTaskType.ReviewRequested,
      TRADE_FINANCE_ACTION.ReviewLCApplication,
      {
        subject: `${lcType} Requested`,
        emailTaskTitle: `Review ${lcType} Request`,
        emailTaskLink: `${this.kapsuleBaseUrl}/tasks`
      }
    )
  }

  private async createNotificationToReviewLetterOfCredit(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    this.logger.info('Company is beneficiary, creating notification', {
      staticId: letterOfCredit.staticId,
      companyId: this.companyStaticId
    })
    const { applicant } = letterOfCredit.templateInstance.data
    const applicantName = applicant.x500Name.CN
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    await this.notificationManager.createNotification(
      letterOfCredit,
      `${lcType} [${letterOfCredit.reference}] has been requested by ${applicantName}`,
      {},
      LetterOfCreditTaskType.ReviewRequested,
      TRADE_FINANCE_ACTION.ReviewLCApplication
    )
  }

  private async executeApplicantAction(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    await this.sendMessageToCounterParties(letterOfCredit)

    await this.createTimer(letterOfCredit)
  }

  private async sendMessageToCounterParties(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    const recipients: string[] = []
    const { beneficiary, issuingBank } = letterOfCredit.templateInstance.data
    const hasBeneficiaryBank = letterOfCredit.templateInstance.data.beneficiaryBank ? true : false

    if (hasBeneficiaryBank) {
      const { beneficiaryBank } = letterOfCredit.templateInstance.data
      recipients.push(beneficiaryBank.staticId)
    }
    recipients.push(beneficiary.staticId)
    recipients.push(issuingBank.staticId)

    const companies = await this.companyRegistryService.getMembers(recipients)
    const membersStaticIds: string[] = companies.filter(company => company.isMember).map(company => company.staticId)

    await Promise.all(membersStaticIds.map(async member => this.messagingService.sendMessageTo(member, letterOfCredit)))
  }

  private async createTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    if (letterOfCredit.templateInstance.data.issueDueDate) {
      this.logger.info('Issue due date exist, creating timer', {
        staticId: letterOfCredit.staticId
      })

      await this.timerService.issuanceTimer(letterOfCredit)
    }
  }

  private setupActions() {
    this.actions = new Map<CompanyRoles, (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void>>()
    this.actions.set(CompanyRoles.Applicant, this.executeApplicantAction.bind(this))
    this.actions.set(CompanyRoles.Beneficiary, this.createNotificationToReviewLetterOfCredit.bind(this))
    this.actions.set(CompanyRoles.IssuingBank, this.executeIssuingBankAction.bind(this))
  }
}
