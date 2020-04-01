import { IRFPMessage, IRFPRequestPayload, IRFPResponsePayload } from '@komgo/messaging-types'
import { ActionType } from '@komgo/types'
import 'reflect-metadata'

import {
  buildFakeReplyRFPMessage,
  buildFakeReplyActionPayload,
  buildFakeRequestRFPMessage,
  buildFakeRequestActionPayload
} from './faker'
import InternalMessageFactory from './InternalMessageFactory'

describe('InternalMessageFactory', () => {
  let internalMessageFactory: InternalMessageFactory

  beforeEach(() => {
    internalMessageFactory = new InternalMessageFactory()
  })

  it('should create AMQP Internal Request message with same rfpId', async () => {
    const rfpMsg = buildFakeRequestRFPMessage(buildFakeRequestActionPayload(true))

    const message: IRFPMessage<IRFPRequestPayload<any>> = internalMessageFactory.createRequest(
      rfpMsg.data,
      rfpMsg.context
    )

    expect(message.context).toEqual(rfpMsg.context)
    expect(message.data.rfpId).toEqual(rfpMsg.data.rfp.rfpId)
    expect(message.data.senderStaticID).toEqual(rfpMsg.data.rfp.senderStaticID)
    expect(message.data.productRequest).toEqual(rfpMsg.data.productRequest)
    expect(message.data.documentIds).toEqual(rfpMsg.data.documentIds)
  })

  it('should create AMQP Internal Response message with same rfpId', async () => {
    const rfpMsg = buildFakeReplyRFPMessage(buildFakeReplyActionPayload(true), ActionType.Reject)

    const message: IRFPMessage<IRFPResponsePayload<any>> = internalMessageFactory.createReply(
      rfpMsg.data,
      rfpMsg.context
    )

    expect(message.context).toEqual(rfpMsg.context)
    expect(message.data.rfpId).toEqual(rfpMsg.data.rfp.rfpId)
    expect(message.data.senderStaticID).toEqual(rfpMsg.data.rfp.senderStaticID)
    expect(message.data.response).toEqual(rfpMsg.data.response)
  })
})
