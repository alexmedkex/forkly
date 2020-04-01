import { VaktMessageBuilder, IVaktMessageBuilder } from './VatkMessageBuilder'
import { LCMessageType, ILCRequestedPayload, IHeadersType } from './messageTypes'
import { sampleLC } from './mock-data/mock-lc'

describe('VatkMessageBuilder', () => {
  let instance: IVaktMessageBuilder<ILCRequestedPayload>
  const options: IHeadersType = {
    recipientStaticId: '1'
  }

  beforeAll(() => {
    instance = new VaktMessageBuilder(sampleLC, options)
  })

  describe('Vakt message', () => {
    it('should return an vakt message object with headers and payload', () => {
      const result = instance.set({
        messageType: LCMessageType.LCRequested
      })

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCRequested,
        vaktId: sampleLC.tradeAndCargoSnapshot.trade.sourceId
      })
    })
  })
})
