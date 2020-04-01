import { IRFPMessage, IRFPPayload, IRFPRequestPayload, IRFPResponsePayload } from '@komgo/messaging-types'
import { IReceivablesDiscounting, ITradeSnapshot, IQuote } from '@komgo/types'
import { v4 as uuid4 } from 'uuid'

import { PRODUCT_ID, SubProductId } from '../../constants'
import { buildFakeReply } from '../../data-layer/data-agents/utils/faker'
import { IReply } from '../../data-layer/models/replies/IReply'
import {
  UpdateType,
  IProductRequest,
  IProductResponse,
  IReceivableFinanceMessage,
  IUpdatePayload,
  IAddDiscountingPayload
} from '../types'

import { OUTBOUND_MESSAGE_VERSION } from './constants'
import { AddDiscountingRequestType } from './types/AddDiscountingRequestType'
import { buildUpdateMessageType, buildAddDiscountingMessageType } from './utils'

export function buildFakeReceivableFinanceMessage<T>(
  entry: T,
  updateType: UpdateType
): IReceivableFinanceMessage<IUpdatePayload<T>> {
  return {
    version: 1,
    context: {
      productId: 'tradeFinance',
      subProductId: 'rd',
      rdId: 'rdId'
    },
    messageType: buildUpdateMessageType(updateType),
    data: {
      senderStaticId: 'senderStaticId',
      updateType,
      entry
    }
  }
}

export const MOCK_UUID = 'cc24a24b-ada5-4332-9ee7-394da255df67'

export const buildFakeRFPMessage = <T extends IRFPPayload>(data: T): IRFPMessage<T> => ({
  version: 1,
  context: { productId: 'tradeFinance', subProductId: 'rd', rdId: 'rdId' },
  data
})

export const buildFakeAddDiscountingMessage = <T>(
  rdId: string,
  entry: T,
  addDiscountingType: AddDiscountingRequestType = AddDiscountingRequestType.Add,
  reply: IReply = buildFakeReply(),
  senderStaticId: string = 'sender-static-id',
  comment?: string
): IReceivableFinanceMessage<IAddDiscountingPayload<T>> => ({
  version: OUTBOUND_MESSAGE_VERSION,
  messageType: buildAddDiscountingMessageType(addDiscountingType),
  data: { entry, reply, senderStaticId, comment },
  context: {
    productId: PRODUCT_ID,
    subProductId: SubProductId.ReceivableDiscounting,
    rdId,
    addDiscountingType
  }
})

export const buildFakeRequestPayload = (
  rd: IReceivablesDiscounting,
  tradeSnaphost: ITradeSnapshot,
  uniqueIds: boolean = false,
  senderStaticID = 'sender-static-id'
): IRFPRequestPayload<IProductRequest> => {
  const now = new Date()
  return {
    rfpId: uniqueIds ? uuid4() : MOCK_UUID,
    senderStaticID,
    productRequest: { rd, trade: tradeSnaphost, createdAt: now, updatedAt: now },
    documentIds: ['document-id-1', 'document-id-2']
  }
}

export const buildFakeResponsePayload = (
  rfpReply: IReply,
  quote?: IQuote,
  uniqueIds: boolean = false,
  senderStaticID = 'sender-static-id'
): IRFPResponsePayload<IProductResponse> => ({
  rfpId: uniqueIds ? uuid4() : MOCK_UUID,
  senderStaticID,
  response: {
    rfpReply,
    quote
  }
})
