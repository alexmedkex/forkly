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
export default class RevokeEventProcessor extends CreditLineEventProcessorBase {
  public readonly messageType = MessageType.RevokeCreditLine

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
      'RevokeEventProcessor'
    )
  }

  protected prepareDisclosedCreditLineData(messageData: ISharedCreditLineMessage): Partial<IDisclosedCreditLine> {
    return {
      appetite: undefined
    }
  }
  protected getNotification(
    data: IDisclosedCreditLine,
    ownerCompanyName: string,
    counterpartyCompanyName: string,
    existing: IDisclosedCreditLine
  ): Promise<INotificationCreateRequest> {
    return Promise.resolve(
      this.notificationFactory.getNotification(
        getNotificationType(data.context, NotificationOperation.RevokeDisclosed),
        data,
        ownerCompanyName,
        counterpartyCompanyName
      )
    )
  }
}
