import { IRFPMessage, IRFPRequestPayload, IRFPResponsePayload } from '@komgo/messaging-types'
import { injectable } from 'inversify'

import { INTERNAL_MESSAGE_VERSION } from './constants'
import { IRequestPayload, IResponsePayload } from './types'

@injectable()
export default class InternalMessageFactory {
  /**
   * Create internal message
   */
  public createRequest(payload: IRequestPayload, context: string): IRFPMessage<IRFPRequestPayload<any>> {
    const data: IRFPRequestPayload<any> = {
      rfpId: payload.rfp.rfpId,
      senderStaticID: payload.rfp.senderStaticID,
      productRequest: payload.productRequest,
      documentIds: payload.documentIds
    }

    const message: IRFPMessage<IRFPRequestPayload<any>> = {
      version: INTERNAL_MESSAGE_VERSION,
      context,
      data
    }
    return message
  }

  public createReply(payload: IResponsePayload, context: string): IRFPMessage<IRFPResponsePayload<any>> {
    const data: IRFPResponsePayload<any> = {
      rfpId: payload.rfp.rfpId,
      senderStaticID: payload.rfp.senderStaticID,
      response: payload.response
    }

    const message: IRFPMessage<IRFPResponsePayload<any>> = {
      version: INTERNAL_MESSAGE_VERSION,
      context,
      data
    }
    return message
  }
}
