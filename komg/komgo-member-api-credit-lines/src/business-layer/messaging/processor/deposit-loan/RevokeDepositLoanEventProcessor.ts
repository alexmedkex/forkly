import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { IDisclosedDepositLoan } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { IDepositLoanValidationService } from '../../../../business-layer/deposit-loan/DepositLoanValidationService'
import { IDisclosedDepositLoanDataAgent } from '../../../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { TYPES } from '../../../../inversify/types'
import { ICreditLineValidationService } from '../../../CreditLineValidationService'
import { DepositLoanNotificationFactory } from '../../../notifications/DepositLoanNotificationFactory'
import { NotificationOperation } from '../../../notifications/NotificationOperation'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { ISharedDepositLoanMessage } from '../../messages/IShareDepositLoanMessage'
import { MessageType } from '../../MessageTypes'

import DepositLoanEventProcessorBase from './DepositLoanEventProcessorBase'

@injectable()
export default class RevokeDepositLoanEventProcessor extends DepositLoanEventProcessorBase {
  public readonly messageType = MessageType.RevokeCreditLine

  constructor(
    @inject(TYPES.DisclosedDepositLoanDataAgent)
    disclosedDepositLoanDataAgent: IDisclosedDepositLoanDataAgent,
    @inject(TYPES.CreditLineValidationService) validationService: ICreditLineValidationService,
    @inject(TYPES.NotificationClient) notificationClient: NotificationClient,
    @inject(TYPES.DepositLoanNotificationFactory)
    protected readonly notificationFactory: DepositLoanNotificationFactory,
    @inject(TYPES.DepositLoanValidationService)
    protected readonly depositLoanValidationService: IDepositLoanValidationService
  ) {
    super(
      disclosedDepositLoanDataAgent,
      validationService,
      notificationClient,
      notificationFactory,
      depositLoanValidationService,
      'RevokeDepositLoanEventProcessor'
    )
  }

  protected prepareDisclosedDepositLoanData(messageData: ISharedDepositLoanMessage): Partial<IDisclosedDepositLoan> {
    return {
      appetite: undefined
    }
  }

  protected getNotification(
    data: IDisclosedDepositLoan,
    ownerCompanyName: string,
    existing: IDisclosedDepositLoan
  ): Promise<INotificationCreateRequest> {
    return Promise.resolve(
      this.notificationFactory.getNotification(NotificationOperation.RevokeDisclosed, data, ownerCompanyName)
    )
  }
}
