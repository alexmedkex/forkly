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
export default class ShareDepositLoanEventProcessor extends DepositLoanEventProcessorBase {
  public readonly messageType = MessageType.ShareCreditLine

  constructor(
    @inject(TYPES.DisclosedDepositLoanDataAgent)
    disclosedDepositLoanDataAgent: IDisclosedDepositLoanDataAgent,
    @inject(TYPES.CreditLineValidationService) validationService: ICreditLineValidationService,
    @inject(TYPES.NotificationClient) notificationClient: NotificationClient,
    // @inject(TYPES.DepositLoanRequestService) private readonly DepositLoanRequestService: IDepositLoanRequestService,
    @inject(TYPES.DepositLoanNotificationFactory) notificationFactory: DepositLoanNotificationFactory,
    @inject(TYPES.DepositLoanValidationService)
    protected readonly depositLoanValidationService: IDepositLoanValidationService
  ) {
    super(
      disclosedDepositLoanDataAgent,
      validationService,
      notificationClient,
      notificationFactory,
      depositLoanValidationService,
      'ShareDepositLoanEventProcessor'
    )
  }

  protected prepareDisclosedDepositLoanData(messageData: ISharedDepositLoanMessage): Partial<IDisclosedDepositLoan> {
    const { appetite, pricing } = messageData.payload.data || ({} as any)

    return {
      appetite,
      pricing
    }
  }

  protected getNotification(
    data: IDisclosedDepositLoan,
    ownerCompanyName: string,
    existing: IDisclosedDepositLoan
  ): Promise<INotificationCreateRequest> {
    const type =
      !existing || (!existing.appetite && data.appetite)
        ? NotificationOperation.Disclosed
        : NotificationOperation.UpdateDisclosed

    return Promise.resolve(this.notificationFactory.getNotification(type, data, ownerCompanyName))
  }
}
