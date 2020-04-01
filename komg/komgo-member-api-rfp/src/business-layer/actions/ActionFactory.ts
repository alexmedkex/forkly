import { ActionType, ActionStatus, IActionBase } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { VALUES } from '../../inversify/values'

@injectable()
export class ActionFactory {
  constructor(@inject(VALUES.CompanyStaticId) private readonly companyStaticId: string) {}

  public createRequestActionBase(rfpId: string, recipientId: string): IActionBase {
    return {
      rfpId,
      recipientStaticID: recipientId,
      senderStaticID: this.companyStaticId,
      type: ActionType.Request,
      status: ActionStatus.Created
    }
  }

  public createActionBase(rfpId: string, actionType: ActionType, recipientId: string, data: any): IActionBase {
    return {
      rfpId,
      recipientStaticID: recipientId,
      senderStaticID: this.companyStaticId,
      type: actionType,
      status: ActionStatus.Created,
      data
    }
  }
}
