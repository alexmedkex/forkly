import { injectable, inject } from 'inversify'

import { PRODUCT_ID, SubProductId } from '../../constants'
import { IReply } from '../../data-layer/models/replies/IReply'
import { VALUES } from '../../inversify'
import { IReceivableFinanceMessage, UpdateType, IUpdatePayload, IAddDiscountingPayload } from '../types'

import { OUTBOUND_MESSAGE_VERSION } from './constants'
import { AddDiscountingRequestType } from './types/AddDiscountingRequestType'
import { buildUpdateMessageType, buildAddDiscountingMessageType } from './utils'

@injectable()
export class OutboundMessageFactory {
  constructor(@inject(VALUES.CompanyStaticId) private readonly companyStaticId: string) {}

  public createRDUpdateMessage<T>(
    rdId: string,
    entry: T,
    updateType: UpdateType
  ): IReceivableFinanceMessage<IUpdatePayload<T>> {
    const context = {
      productId: PRODUCT_ID,
      subProductId: SubProductId.ReceivableDiscounting,
      rdId,
      updateType
    }
    return {
      version: OUTBOUND_MESSAGE_VERSION,
      context,
      messageType: buildUpdateMessageType(updateType),
      data: { entry, senderStaticId: this.companyStaticId, updateType }
    }
  }

  public createAddDiscountingMessage<T>(
    rdId: string,
    entry: T,
    addDiscountingType: AddDiscountingRequestType,
    reply: IReply,
    comment?: string
  ): IReceivableFinanceMessage<IAddDiscountingPayload<T>> {
    const context = {
      productId: PRODUCT_ID,
      subProductId: SubProductId.ReceivableDiscounting,
      rdId,
      addDiscountingType
    }
    return {
      version: OUTBOUND_MESSAGE_VERSION,
      context,
      messageType: buildAddDiscountingMessageType(addDiscountingType),
      data: { entry, reply, senderStaticId: this.companyStaticId, comment }
    }
  }
}
