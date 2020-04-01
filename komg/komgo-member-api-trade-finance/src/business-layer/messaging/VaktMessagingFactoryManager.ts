import {
  IVaktMessage,
  LCMessageType,
  ILCRequestedMessage,
  ILCRequestRejectedMessage,
  ILCRequestedPayload,
  ILCRequestRejectedPayload,
  ILCIssuedRejectedPayload,
  ILCIssuedPayload,
  ILCAmendmentRequestedPayload,
  ILCAmendmentRejectedPayload,
  ILCAmendmentApprovedPayload,
  ILCExpiredPayload,
  ILCPaymentConfirmedPayload,
  ILCPayloadType,
  IHeadersType
} from './messageTypes'

import { ILC } from '../../data-layer/models/ILC'
import { VaktMessageBuilder } from './VatkMessageBuilder'
import { injectable } from 'inversify'

export interface IVaktMessagingFactoryManager {
  getVaktMessage: (type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) => IVaktMessage<ILCPayloadType>
}

@injectable()
export class VaktMessagingFactoryManager implements IVaktMessagingFactoryManager {
  private strategies = new Map<
    LCMessageType,
    (type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) => IVaktMessage<ILCPayloadType>
  >()

  constructor() {
    this.setupStrategies()
  }

  getVaktMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return this.strategies.get(type)(type, lcData, messageOptions)
  }

  private setupStrategies() {
    this.strategies.set(LCMessageType.LCRequested, this.getLCRequestedMessage)
    this.strategies.set(LCMessageType.LCRequestRejected, this.getLCRequestRejectedMessage)
    this.strategies.set(LCMessageType.LCIssued, this.getLCIssuedMessage)
    this.strategies.set(LCMessageType.LCIssuedRejected, this.getIssuedLCRejectedMessage)
    this.strategies.set(LCMessageType.LCAmendmentRequested, this.getLCAmendmentRequestedMessage)
    this.strategies.set(LCMessageType.LCAmendmentRejected, this.getLCAmendmentRejectedMessage)
    this.strategies.set(LCMessageType.LCAmendmentApproved, this.getLCAmendmentApprovedMessage)
    this.strategies.set(LCMessageType.LCExpired, this.getLCExpiredMessage)
    this.strategies.set(LCMessageType.LCPaymentConfirmed, this.getLCPaymentConfirmedMessage)
  }

  private getLCRequestedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType): ILCRequestedMessage {
    return new VaktMessageBuilder<ILCRequestedPayload>(lcData, messageOptions).set({
      messageType: type
    })
  }

  private getLCRequestRejectedMessage(
    type: LCMessageType,
    lcData: ILC,
    messageOptions: IHeadersType
  ): ILCRequestRejectedMessage {
    return new VaktMessageBuilder<ILCRequestRejectedPayload>(lcData, messageOptions).set({
      messageType: type,
      reason: lcData.issuingBankComments || lcData.reason
    })
  }

  private getLCIssuedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCIssuedPayload>(lcData, messageOptions).set({
      messageType: type,
      lcId: lcData.reference
    })
  }

  private getIssuedLCRejectedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCIssuedRejectedPayload>(lcData, messageOptions).set({
      messageType: type,
      reason: lcData.advisingBankComments || lcData.beneficiaryComments || lcData.reason,
      lcId: lcData.reference
    })
  }

  private getLCAmendmentRequestedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCAmendmentRequestedPayload>(lcData, messageOptions).set({
      messageType: type,
      lcId: lcData.reference
    })
  }

  private getLCAmendmentRejectedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCAmendmentRejectedPayload>(lcData, messageOptions).set({
      messageType: type,
      lcId: lcData.reference
    })
  }

  private getLCAmendmentApprovedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCAmendmentApprovedPayload>(lcData, messageOptions).set({
      messageType: type,
      lcId: lcData.reference,
      lcAmendmentId: lcData.amendmentId
    })
  }

  private getLCExpiredMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCExpiredPayload>(lcData, messageOptions).set({
      messageType: type,
      lcId: lcData.reference
    })
  }

  private getLCPaymentConfirmedMessage(type: LCMessageType, lcData: ILC, messageOptions: IHeadersType) {
    return new VaktMessageBuilder<ILCPaymentConfirmedPayload>(lcData, messageOptions).set({
      messageType: type,
      parcelId: lcData.parcelId,
      lcId: lcData.reference
    })
  }
}
