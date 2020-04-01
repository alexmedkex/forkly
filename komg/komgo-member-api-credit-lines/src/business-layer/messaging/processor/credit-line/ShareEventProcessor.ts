import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { injectable, inject } from 'inversify'

import { IDisclosedCreditLineDataAgent } from '../../../../data-layer/data-agents/IDisclosedCreditLineDataAgent'
import { IDisclosedCreditLine } from '../../../../data-layer/models/IDisclosedCreditLine'
import { TYPES } from '../../../../inversify/types'
import { ICreditLineRequestService } from '../../../CreditLineRequestService'
import { ICreditLineValidationService } from '../../../CreditLineValidationService'
import { INotificationFactory } from '../../../notifications'
import { NotificationOperation } from '../../../notifications/NotificationOperation'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { getNotificationType } from '../../../utils/utils'
import { ISharedCreditLineMessage } from '../../messages/IShareCreditLineMessage'
import { MessageType } from '../../MessageTypes'

import CreditLineEventProcessorBase from './CreditLineEventProcessorBase'

@injectable()
export default class ShareEventProcessor extends CreditLineEventProcessorBase {
  public readonly messageType = MessageType.ShareCreditLine

  constructor(
    @inject(TYPES.DisclosedCreditLineDataAgent) disclosedCreditLineDataAgent: IDisclosedCreditLineDataAgent,
    @inject(TYPES.CreditLineValidationService) validationService: ICreditLineValidationService,
    @inject(TYPES.NotificationClient) notificationClient: NotificationClient,
    @inject(TYPES.CreditLineRequestService) creditLineRequestService: ICreditLineRequestService,
    @inject(TYPES.NotificationFactory) notificationFactory: INotificationFactory
  ) {
    super(
      disclosedCreditLineDataAgent,
      validationService,
      notificationClient,
      creditLineRequestService,
      notificationFactory,
      'ShareEventProcessor'
    )
  }

  protected prepareDisclosedCreditLineData(messageData: ISharedCreditLineMessage): Partial<IDisclosedCreditLine> {
    const { appetite, currency, availability, availabilityAmount, creditLimit, ...additionalData } =
      messageData.payload.data || ({} as any)

    return {
      appetite,
      currency,
      availability,
      availabilityAmount,
      creditLimit,
      data: additionalData
    }
  }

  protected getNotification(
    data: IDisclosedCreditLine,
    ownerCompanyName: string,
    counterpartyCompanyName: string,
    existing: IDisclosedCreditLine
  ): Promise<INotificationCreateRequest> {
    const msgBuilderType =
      !existing || (!existing.appetite && data.appetite)
        ? getNotificationType(data.context, NotificationOperation.Disclosed)
        : getNotificationType(data.context, NotificationOperation.UpdateDisclosed)

    return Promise.resolve(
      this.notificationFactory.getNotification(msgBuilderType, data, ownerCompanyName, counterpartyCompanyName)
    )
  }
}
