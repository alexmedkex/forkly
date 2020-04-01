import 'reflect-metadata'
import { VaktMessagingFactoryManager, IVaktMessagingFactoryManager } from './VaktMessagingFactoryManager'
import { LCMessageType, IHeadersType } from './messageTypes'
import { sampleLC } from './mock-data/mock-lc'

describe('VaktMessagingFactoryManager', () => {
  let instance: IVaktMessagingFactoryManager
  const options: IHeadersType = {
    recipientStaticId: '1'
  }

  beforeAll(() => {
    instance = new VaktMessagingFactoryManager()
  })

  describe('Vakt message', () => {
    it('should return a vakt message given a lc message type', () => {
      const result = instance.getVaktMessage(LCMessageType.LCIssued, sampleLC, options)

      expect(result).toBeDefined()
    })
  })

  describe('LCRequested message', () => {
    it('should return a vakt LCRequested message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCRequested, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCRequested,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId
      })
    })
  })

  describe('LCRequestRejected message', () => {
    it('should return a vakt LCRequestRejected message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCRequestRejected, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCRequestRejected,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        reason: sampleLC.issuingBankComments
      })
    })
  })

  describe('LCIssued message', () => {
    it('should return a vakt LCIssued message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCIssued, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCIssued,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        lcId: sampleLC.reference
      })
    })
  })

  describe('LCIssuedRejected message', () => {
    it('should return a vakt IssuedLCRejected message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCIssuedRejected, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCIssuedRejected,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        reason: sampleLC.advisingBankComments,
        lcId: sampleLC.reference
      })
    })
  })

  describe('LCAmendmentRequested message', () => {
    it('should return a vakt LCAmendmentRequested message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCAmendmentRequested, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCAmendmentRequested,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        lcId: sampleLC.reference
      })
    })
  })

  describe('LCAmendmentRejected message', () => {
    it('should return a vakt LCAmendmentRejected message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCAmendmentRejected, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCAmendmentRejected,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        lcId: sampleLC.reference
      })
    })
  })

  describe('LCAmendmentApproved message', () => {
    it('should return a vakt LCAmendmentApproved message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCAmendmentApproved, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCAmendmentApproved,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        lcId: sampleLC.reference,
        lcAmendmentId: sampleLC.amendmentId
      })
    })
  })

  describe('LCExpired message', () => {
    it('should return a vakt LCExpired message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCExpired, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCExpired,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        lcId: sampleLC.reference
      })
    })
  })

  describe('LCPaymentConfirmed message', () => {
    it('should return a vakt LCPaymentConfirmed message', () => {
      const result = instance.getVaktMessage(LCMessageType.LCPaymentConfirmed, sampleLC, options)

      expect(result.headers).toMatchObject({
        recipientStaticId: options.recipientStaticId
      })
      expect(result.payload).toMatchObject({
        version: 1,
        messageType: LCMessageType.LCPaymentConfirmed,
        vaktId: sampleLC.tradeAndCargoSnapshot.sourceId,
        lcId: sampleLC.reference,
        parcelId: sampleLC.parcelId
      })
    })
  })
})
