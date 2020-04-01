import { ILetterOfCredit, IDataLetterOfCredit, LetterOfCreditTaskType, CompanyRoles, ITimer } from '@komgo/types'
import { TYPES } from '../../inversify'
import { injectable, inject } from 'inversify'
import { ITimerService } from './TimerService'
import { ILetterOfCreditDataAgent } from '../../data-layer/data-agents'
import { TRADE_FINANCE_ACTION, TRADE_FINANCE_PRODUCT_ID } from '../tasks/permissions'
import { NotificationLevel } from '@komgo/notification-publisher'
import { getLogger } from '@komgo/logging'
import { ILetterOfCreditPartyActionProcessorHelper } from '../letter-of-credit/processors/ILetterOfCreditPartyActionProcessorHelper'
import { ILetterOfCreditNotificationManager } from '../letter-of-credit/notifications/ILetterOfCreditNotificationManager'

export interface ILetterOfCreditTimerService {
  populateTimerData(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<ITimer>
  issuanceTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<void>
  deactivateTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<void>
}

const permissionsPerResponsability = {
  [CompanyRoles.Applicant]: TRADE_FINANCE_ACTION.ManageLCRequest,
  [CompanyRoles.IssuingBank]: TRADE_FINANCE_ACTION.ReviewLCApplication,
  [CompanyRoles.AdvisingBank]: TRADE_FINANCE_ACTION.ReviewIssuedLC,
  [CompanyRoles.Beneficiary]: TRADE_FINANCE_ACTION.ReviewIssuedLC
}

const actionsPerResponsability = {
  [CompanyRoles.Applicant]: LetterOfCreditTaskType.ReviewRequested,
  [CompanyRoles.IssuingBank]: LetterOfCreditTaskType.ReviewRequested,
  [CompanyRoles.AdvisingBank]: LetterOfCreditTaskType.ReviewIssued,
  [CompanyRoles.Beneficiary]: LetterOfCreditTaskType.ReviewIssued
}

@injectable()
export class LetterOfCreditTimerService implements ILetterOfCreditTimerService {
  private logger = getLogger('LetterOfCreditTimerService')

  constructor(
    @inject(TYPES.LetterOfCreditDataAgent) private dataAgent: ILetterOfCreditDataAgent,
    @inject(TYPES.TimerService) private readonly timerService: ITimerService,
    @inject(TYPES.LetterOfCreditPartyActionProcessorHelper)
    private readonly letterOfCreditActionProcessorHelper: ILetterOfCreditPartyActionProcessorHelper,
    @inject(TYPES.LetterOfCreditNotificationManager)
    private readonly notificationManager: ILetterOfCreditNotificationManager
  ) {}

  async populateTimerData(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>): Promise<ITimer> {
    if (
      !letterOfCredit.templateInstance ||
      !letterOfCredit.templateInstance.data ||
      !letterOfCredit.templateInstance.data.issueDueDate ||
      !letterOfCredit.templateInstance.data.issueDueDate.staticId
    ) {
      return null
    }

    const timerData = await this.timerService.fetchTimer(letterOfCredit.templateInstance.data.issueDueDate.staticId)
    return {
      ...letterOfCredit.templateInstance.data.issueDueDate,
      ...timerData
    }
  }

  async issuanceTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    if (letterOfCredit.templateInstance.data.issueDueDate) {
      this.logger.info('Issuing timer for letter of credit', {
        letterOfCredit: letterOfCredit.staticId
      })

      const timer = await this.timerService.createTimer(
        letterOfCredit.templateInstance.data.issueDueDate,
        [
          {
            notification: this.createHalfwayNotification(letterOfCredit),
            factor: 2
          },
          {
            notification: this.getTimerExpiredNotification(letterOfCredit),
            factor: 1
          }
        ],
        this.buildTimerContext(letterOfCredit)
      )

      if (timer) {
        letterOfCredit.templateInstance.data.issueDueDate.staticId = timer.staticId
        await this.dataAgent.update({ staticId: letterOfCredit.staticId }, letterOfCredit)
      }
    }
  }

  async deactivateTimer(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    if (
      letterOfCredit.templateInstance.data.issueDueDate &&
      letterOfCredit.templateInstance.data.issueDueDate.staticId
    ) {
      this.logger.info('Deactivating timer for letter of credit', {
        letterOfCredit: letterOfCredit.staticId
      })
      await this.timerService.deactivateTimer(letterOfCredit.templateInstance.data.issueDueDate.staticId)
    }
  }

  createHalfwayNotification(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    const partyRole = this.letterOfCreditActionProcessorHelper.getPartyRole(letterOfCredit)
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    const { applicant } = letterOfCredit.templateInstance.data
    const applicantName = applicant.x500Name.CN

    const message = `${lcType} [${
      letterOfCredit.reference
    }] issuance requested by ${applicantName} has reached its halfway`
    const level = partyRole === CompanyRoles.Applicant ? NotificationLevel.info : NotificationLevel.danger

    return this.notificationManager.buildNotification(
      letterOfCredit,
      message,
      {},
      actionsPerResponsability[partyRole],
      permissionsPerResponsability[partyRole],
      level
    )
  }

  getTimerExpiredNotification(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    const partyRole = this.letterOfCreditActionProcessorHelper.getPartyRole(letterOfCredit)
    const lcType = this.letterOfCreditActionProcessorHelper.getLetterOfCreditType(letterOfCredit)
    const message = `${lcType} [${letterOfCredit.reference}] timer has expired`

    return this.notificationManager.buildNotification(
      letterOfCredit,
      message,
      {},
      actionsPerResponsability[partyRole],
      permissionsPerResponsability[partyRole],
      NotificationLevel.info
    )
  }

  private buildTimerContext(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    return {
      staticId: letterOfCredit.staticId,
      productId: TRADE_FINANCE_PRODUCT_ID,
      subProductId: 'letterOfCredit'
    }
  }
}
