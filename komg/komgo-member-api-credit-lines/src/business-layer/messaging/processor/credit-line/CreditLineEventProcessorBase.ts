import { ErrorCode } from '@komgo/error-utilities'
import { getLogger, LogstashCapableLogger } from '@komgo/logging'
import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { injectable, inject, unmanaged } from 'inversify'

import { IDisclosedCreditLineDataAgent } from '../../../../data-layer/data-agents/IDisclosedCreditLineDataAgent'
import { IDisclosedCreditLine } from '../../../../data-layer/models/IDisclosedCreditLine'
import { TYPES } from '../../../../inversify/types'
import { ErrorName } from '../../../../utils/Constants'
import { ICreditLineRequestService } from '../../../CreditLineRequestService'
import { CreditLineValidationFactory } from '../../../CreditLineValidationFactory'
import { ICreditLineValidationService } from '../../../CreditLineValidationService'
import { CreditLineValidationType } from '../../../CreditLineValidationType'
import { FeatureType } from '../../../enums/feature'
import { InvalidPayloadProcessingError } from '../../../errors/InvalidPayloadProcessingError'
import { INotificationFactory } from '../../../notifications'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { ICreditLineBaseMessage } from '../../messages/ICreditLineMessage'
import { ISharedCreditLineMessage } from '../../messages/IShareCreditLineMessage'
import { MessageType } from '../../MessageTypes'
import { IEventProcessor } from '../IEventProcessor'

@injectable()
export default abstract class CreditLineEventProcessorBase implements IEventProcessor<ISharedCreditLineMessage> {
  public abstract readonly messageType: MessageType
  logger: LogstashCapableLogger

  constructor(
    @inject(TYPES.DisclosedCreditLineDataAgent)
    private readonly disclosedCreditLineDataAgent: IDisclosedCreditLineDataAgent,
    @inject(TYPES.CreditLineValidationService) private readonly validationService: ICreditLineValidationService,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationClient,
    @inject(TYPES.CreditLineRequestService) private readonly creditLineRequestService: ICreditLineRequestService,
    @inject(TYPES.NotificationFactory) protected readonly notificationFactory: INotificationFactory,
    @unmanaged() loggerName: string
  ) {
    this.logger = getLogger(loggerName)
  }

  shouldProcess(messageData: ICreditLineBaseMessage) {
    return (
      messageData.messageType === this.messageType &&
      [FeatureType.BankLine, FeatureType.RiskCover].includes(messageData.featureType)
    )
  }

  async processMessage(messageData: ISharedCreditLineMessage): Promise<boolean> {
    this.logger.info('Processing message', {
      messageType: messageData.messageType,
      counterpartyStaticId: messageData.payload.counterpartyStaticId,
      ownerStaticId: messageData.ownerStaticId
    })

    try {
      const creditLineOwner = await this.validationService.validateCreditLineOwner(messageData.ownerStaticId)

      const type = CreditLineValidationFactory.ValidationType(messageData.payload.context)
      const creditLineCounterparty = await this.validationService.validateCreditLineCounterparty(
        messageData.payload.counterpartyStaticId,
        type !== CreditLineValidationType.ValidateRiskCover
      )

      const data = this.prepareDisclosedCreditLineDataBase(messageData)

      const existing = await this.disclosedCreditLineDataAgent.findOne({
        context: data.context,
        counterpartyStaticId: data.counterpartyStaticId,
        ownerStaticId: data.ownerStaticId
      })

      if (existing) {
        this.logger.info('Found existing disclosed credit line', { staticId: existing.ownerStaticId })
      } else {
        this.logger.info('Processing new disclosed credit line', {
          counterpartyStaticId: messageData.payload.counterpartyStaticId,
          ownerStaticId: messageData.ownerStaticId
        })
      }

      data.staticId = existing
        ? await this.updateDisclosedCreditLineData(data, existing)
        : await this.createDisclosedCreditLine(data)

      await this.creditLineRequestService.closePendingSentRequest(
        data.ownerStaticId,
        data.counterpartyStaticId,
        data.context,
        this.messageType === MessageType.ShareCreditLine
      )

      await this.sendNotification(data, creditLineOwner.x500Name.O, creditLineCounterparty.x500Name.O, existing)

      return true
    } catch (err) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.MessageProcessFailed, {
        messageType: messageData.messageType,
        counterpartyStaticId: messageData.payload.counterpartyStaticId,
        ownerStaticId: messageData.ownerStaticId,
        err: err.message,
        errorObject: err
      })
      throw err
    }
  }

  protected prepareDisclosedCreditLineDataBase(messageData: ISharedCreditLineMessage): IDisclosedCreditLine {
    let data: IDisclosedCreditLine = {
      staticId: undefined,
      ownerStaticId: messageData.ownerStaticId,
      counterpartyStaticId: messageData.payload.counterpartyStaticId,
      context: messageData.payload.context,
      appetite: undefined,
      currency: undefined,
      availability: undefined,
      availabilityAmount: undefined,
      creditLimit: undefined,
      updatedAt: undefined,
      createdAt: undefined,
      data: undefined
    }

    const additionalData = this.prepareDisclosedCreditLineData(messageData)

    if (additionalData) {
      data = { ...data, ...additionalData }
    }

    return data
  }

  protected abstract prepareDisclosedCreditLineData(
    messageData: ISharedCreditLineMessage
  ): Partial<IDisclosedCreditLine>
  protected abstract async getNotification(
    data: IDisclosedCreditLine,
    ownerCompanyName: string,
    counterpartyCompanyName: string,
    existing: IDisclosedCreditLine
  ): Promise<INotificationCreateRequest>

  protected async sendNotification(
    data: IDisclosedCreditLine,
    ownerCompanyName: string,
    counterpartyCompanyName: string,
    existing: IDisclosedCreditLine
  ) {
    const message = await this.getNotification(data, ownerCompanyName, counterpartyCompanyName, existing)

    this.logger.info('Sending notification', { dislosedCreditLineStaticId: data })
    await this.notificationClient.sendNotification(message)
  }

  private async createDisclosedCreditLine(data: IDisclosedCreditLine) {
    const staticId = await this.disclosedCreditLineDataAgent.create(data)
    return staticId
  }

  private async updateDisclosedCreditLineData(data: IDisclosedCreditLine, existing: IDisclosedCreditLine) {
    data.staticId = existing.staticId
    await this.disclosedCreditLineDataAgent.update(data)

    return data.staticId
  }
}
