import { IRFPRequestPayload, IRFPResponsePayload, IRFPMessage } from '@komgo/messaging-types'
import { ActionType } from '@komgo/types'
import { v4 as uuid4 } from 'uuid'

import { IRFPActionMessage, IRequestPayload, IResponsePayload } from './types'
import { buildMessageType } from './utils'

export const MOCK_UUID = 'cc24a24b-ada5-4332-9ee7-394da255df67'
export const MOCK_DATE = '2019-01-31'
export const MOCK_RECIPIENT_STATIC_ID = 'recipientStaticId'
export const MOCK_SENDER_STATIC_ID = 'senderStaticId'

export const buildFakeRequestRFPMessage = (data: IRequestPayload): IRFPActionMessage<IRequestPayload> => {
  return {
    version: 1,
    context: { productId: 'tradeFinance', subProductId: 'rd', rdId: 'rdId' },
    messageType: buildMessageType(ActionType.Request),
    data
  }
}

export const buildFakeRequestActionPayload = (uniqueIds: boolean = true): IRequestPayload => {
  return {
    rfp: {
      actionId: uniqueIds ? uuid4() : MOCK_UUID,
      rfpId: uniqueIds ? uuid4() : MOCK_UUID,
      recipientStaticID: MOCK_RECIPIENT_STATIC_ID,
      senderStaticID: MOCK_SENDER_STATIC_ID,
      sentAt: MOCK_DATE
    },
    productRequest: { data: 'data' },
    documentIds: ['document-id-1', 'document-id-2']
  }
}

export const buildFakeReplyRFPMessage = (
  data: IResponsePayload,
  actionType: ActionType
): IRFPActionMessage<IResponsePayload> => {
  return {
    version: 1,
    context: { productId: 'tradeFinance', subProductId: 'rd', rdId: 'rdId' },
    messageType: buildMessageType(actionType),
    data
  }
}

export const buildFakeReplyActionPayload = (uniqueIds: boolean = true): IResponsePayload => {
  return {
    rfp: {
      actionId: uniqueIds ? uuid4() : MOCK_UUID,
      rfpId: uniqueIds ? uuid4() : MOCK_UUID,
      recipientStaticID: MOCK_RECIPIENT_STATIC_ID,
      senderStaticID: MOCK_SENDER_STATIC_ID,
      sentAt: MOCK_DATE
    },
    response: { responseData: 'responseData' }
  }
}

export const buildFakeRequestInternalMessage = (
  data: IRFPRequestPayload<any>
): IRFPMessage<IRFPRequestPayload<any>> => {
  return {
    version: 1,
    context: { productId: 'tradeFinance', subProductId: 'rd', rdId: 'rdId' },
    data
  }
}

export const buildFakeRequestInternalPayload = (uniqueIds: boolean = true): IRFPRequestPayload<any> => {
  return {
    rfpId: uniqueIds ? uuid4() : MOCK_UUID,
    senderStaticID: MOCK_SENDER_STATIC_ID,
    productRequest: { data: 'data' },
    documentIds: ['document-id-1', 'document-id-2']
  }
}

export const buildFakeResponseInternalMessage = (
  data: IRFPResponsePayload<any>
): IRFPMessage<IRFPResponsePayload<any>> => {
  return {
    version: 1,
    context: { productId: 'tradeFinance', subProductId: 'rd', rdId: 'rdId' },
    data
  }
}

export const buildFakeResponseInternalPayload = (uniqueIds: boolean = true): IRFPResponsePayload<any> => {
  return {
    rfpId: uniqueIds ? uuid4() : MOCK_UUID,
    senderStaticID: MOCK_SENDER_STATIC_ID,
    response: { data: 'mockData' }
  }
}
