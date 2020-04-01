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

import { TYPES } from '../../../inversify'
import { ErrorNames } from '../../../exceptions'

import { TRADE_FINANCE_ACTION } from '../../tasks/permissions'

import { ILetterOfCreditTaskManager } from '../tasks/ILetterOfCreditTaskManager'
import { ILetterOfCreditNotificationManager } from '../notifications/ILetterOfCreditNotificationManager'

import { ILetterOfCreditPartyActionProcessor } from './ILetterOfCreditPartyActionProcessor'
import { ILetterOfCreditPartyActionProcessorHelper } from './ILetterOfCreditPartyActionProcessorHelper'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ILetterOfCreditMessagingService } from '../messaging'
import { ILetterOfCreditTimerService } from '../../timers/LetterOfCreditTimerService'

@injectable()
export class LetterOfCreditPartyActionProcessorOnRequestRejected implements ILetterOfCreditPartyActionProcessor {
  private readonly logger = getLogger('LetterOfCreditPartyActionProcessorOnRequestRejected')

  private readonly taskManager: ILetterOfCreditTaskManager
  private readonly notificationManager: ILetterOfCreditNotificationManager
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
    @inject(TYPES.CompanyRegistryService) companyRegistryService: ICompanyRegistryService,
    @inject(TYPES.LetterOfCreditMessagingService) messagingService: ILetterOfCreditMessagingService,
    @inject(TYPES.LetterOfCreditTimerService) timerService: ILetterOfCreditTimerService
  ) {
    this.companyRegistryService = companyRegistryService
    this.messagingService = messagingService
    this.taskManager = taskManager
    this.notificationManager = notificationManager
    this.letterOfCreditActionProcessorHelper = letterOfCreditActionProcessorHelper
    this.timerService = timerService

    this.setupActions()
  }

  async executePartyActions(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    try {
      if (letterOfCredit.status !== LetterOfCreditStatus.RequestRejected) {
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
    await this.createNotificationForApplicantOrBeneficiary(letterOfCredit)
    await this.deactiveIssuanceTimer(letterOfCredit)
  }

  private async resolveTaskForIssuingBank(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    this.logger.info('Company is issuing bank, solving task', {
      staticId: letterOfCredit.staticId
    })

    await this.taskManager.resolveTask(letterOfCredit, LetterOfCreditTaskType.ReviewRequested, true)
  }

  private async processIssuingBankActions(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    await this.resolveTaskForIssuingBank(letterOfCredit)
    await this.sendLetterOfCreditDataToCounterParties(letterOfCredit)
    await this.deactiveIssuanceTimer(letterOfCredit)
  }

  private async sendLetterOfCreditDataToCounterParties(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
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

  private async createNotificationForApplicantOrBeneficiary(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    this.logger.info('Company is applicant or beneficiary, creating notification', {
      staticId: letterOfCredit.staticId
    })

    const issuingBankName = letterOfCredit.templateInstance.data.issuingBank.x500Name.CN
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    const notificationMessage = `Request for ${lcType} [${letterOfCredit.reference}] [${
      letterOfCredit.templateInstance.data.issuingBankReference
    }] rejected by ${issuingBankName}`

    await this.notificationManager.createNotification(
      letterOfCredit,
      notificationMessage,
      {},
      LetterOfCreditTaskType.ReviewIssued,
      TRADE_FINANCE_ACTION.ReviewIssuedLC
    )
  }

  private async deactiveIssuanceTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    if (letterOfCredit.templateInstance.data.issueDueDate) {
      this.logger.info('Timer deactivation started on request reject process')
      await this.timerService.deactivateTimer(letterOfCredit)
    }
  }

  private setupActions() {
    this.actions = new Map<CompanyRoles, (letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) => Promise<void>>()
    this.actions.set(CompanyRoles.Applicant, this.executeAplicantAction.bind(this))
    this.actions.set(CompanyRoles.Beneficiary, this.createNotificationForApplicantOrBeneficiary.bind(this))
    this.actions.set(CompanyRoles.IssuingBank, this.processIssuingBankActions.bind(this))
  }
}
