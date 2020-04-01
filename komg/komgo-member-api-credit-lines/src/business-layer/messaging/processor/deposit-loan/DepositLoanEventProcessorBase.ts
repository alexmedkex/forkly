import { ErrorCode } from '@komgo/error-utilities'
import { getLogger, LogstashCapableLogger } from '@komgo/logging'
import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { IDisclosedDepositLoan, ISaveDepositLoanRequest } from '@komgo/types'
import { injectable, inject, unmanaged } from 'inversify'

import { IDepositLoanValidationService } from '../../../../business-layer/deposit-loan/DepositLoanValidationService'
import { IDisclosedDepositLoanDataAgent } from '../../../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { TYPES } from '../../../../inversify/types'
import { ErrorName } from '../../../../utils/Constants'
import { ICreditLineValidationService } from '../../../CreditLineValidationService'
import { FeatureType } from '../../../enums/feature'
import { DepositLoanNotificationFactory } from '../../../notifications/DepositLoanNotificationFactory'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { ICreditLineBaseMessage } from '../../messages/ICreditLineMessage'
import { ISharedDepositLoanMessage } from '../../messages/IShareDepositLoanMessage'
import { MessageType } from '../../MessageTypes'
import { IEventProcessor } from '../IEventProcessor'

@injectable()
export default abstract class DepositLoanEventProcessorBase implements IEventProcessor<ISharedDepositLoanMessage> {
  public abstract readonly messageType: MessageType
  logger: LogstashCapableLogger

  constructor(
    @inject(TYPES.DisclosedDepositLoanDataAgent)
    private readonly disclosedDepositLoanDataAgent: IDisclosedDepositLoanDataAgent,
    @inject(TYPES.CreditLineValidationService) private readonly validationService: ICreditLineValidationService,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    // @inject(TYPES.DepositLoanRequestService) private readonly DepositLoanRequestService: IDepositLoanRequestService,
    @inject(TYPES.NotificationFactory) protected readonly notificationFactory: DepositLoanNotificationFactory,
    @inject(TYPES.DepositLoanValidationService)
    protected readonly depositLoanValidationService: IDepositLoanValidationService,
    @unmanaged() loggerName: string
  ) {
    this.logger = getLogger(loggerName)
  }

  shouldProcess(messageData: ICreditLineBaseMessage) {
    return (
      messageData.messageType === this.messageType &&
      [FeatureType.Deposit, FeatureType.Loan].includes(messageData.featureType)
    )
  }

  async processMessage(messageData: ISharedDepositLoanMessage): Promise<boolean> {
    this.logger.info('Processing message', {
      messageType: messageData.messageType,
      ownerStaticId: messageData.ownerStaticId
    })

    try {
      this.depositLoanValidationService.validateDepositLoanRequest(messageData.payload)

      const depositLoanOwner = await this.validationService.validateCreditLineOwner(messageData.ownerStaticId)

      const data = this.prepareDisclosedDepositLoan(messageData)

      const existing = await this.disclosedDepositLoanDataAgent.findOne(data.type, {
        ownerStaticId: data.ownerStaticId,
        period: data.period,
        periodDuration: data.periodDuration,
        currency: data.currency
      })

      if (existing) {
        this.logger.info('Found existing disclosed deposit / loan', { staticId: existing.ownerStaticId })
      } else {
        this.logger.info('Processing new disclosed deposit / loan', {
          ownerStaticId: messageData.ownerStaticId
        })
      }

      data.staticId = existing
        ? await this.updateDisclosedDepositLoanData(data, existing)
        : await this.createDisclosedDepositLoan(data)

      // await this.DepositLoanRequestService.closePendingSentRequest(
      //   data.ownerStaticId,
      //   data.counterpartyStaticId,
      //   data.context,
      //   this.messageType === MessageType.ShareDepositLoan
      // )

      await this.sendNotification(data, depositLoanOwner.x500Name.O, existing)

      return true
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.MessageProcessFailed, {
        messageType: messageData.messageType,
        ownerStaticId: messageData.ownerStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  protected prepareDisclosedDepositLoan(messageData: ISharedDepositLoanMessage): IDisclosedDepositLoan {
    let data: IDisclosedDepositLoan = {
      staticId: undefined,
      ownerStaticId: messageData.ownerStaticId,
      type: messageData.payload.type,
      currency: messageData.payload.currency,
      period: messageData.payload.period,
      periodDuration: messageData.payload.periodDuration,
      appetite: undefined,
      pricing: undefined,
      createdAt: undefined,
      updatedAt: undefined
    }

    const additionalData = this.prepareDisclosedDepositLoanData(messageData)

    if (additionalData) {
      data = { ...data, ...additionalData }
    }

    return data
  }

  protected abstract prepareDisclosedDepositLoanData(
    messageData: ISharedDepositLoanMessage
  ): Partial<IDisclosedDepositLoan>
  protected abstract async getNotification(
    data: IDisclosedDepositLoan,
    ownerCompanyName: string,
    existing: IDisclosedDepositLoan
  ): Promise<INotificationCreateRequest>

  protected async sendNotification(
    data: IDisclosedDepositLoan,
    ownerCompanyName: string,
    existing: IDisclosedDepositLoan
  ) {
    const message = await this.getNotification(data, ownerCompanyName, existing)

    this.logger.info('Sending notification', { dislosedDepositLoanStaticId: data })
    await this.notificationClient.sendNotification(message)
  }

  private async createDisclosedDepositLoan(data: IDisclosedDepositLoan) {
    const staticId = await this.disclosedDepositLoanDataAgent.create(data)
    return staticId
  }

  private async updateDisclosedDepositLoanData(data: IDisclosedDepositLoan, existing: IDisclosedDepositLoan) {
    data.staticId = existing.staticId
    await this.disclosedDepositLoanDataAgent.update(data)

    return data.staticId
  }
}
