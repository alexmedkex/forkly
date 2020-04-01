export enum LCMessageType {
  LCRequested = 'KOMGO.LC.LCRequested',
  LCRequestRejected = 'KOMGO.LC.LCRequestRejected',
  LCIssued = 'KOMGO.LC.LCIssued',
  LCIssuedRejected = 'KOMGO.LC.IssuedLCRejected',
  LCAmendmentRequested = 'KOMGO.LC.LCAmendmentRequested',
  LCAmendmentRejected = 'KOMGO.LC.LCAmendmentRejected',
  LCAmendmentApproved = 'KOMGO.LC.LCAmendmentApproved',
  LCExpired = 'KOMGO.LC.LCExpired',
  LCPaymentConfirmed = 'KOMGO.LC.LCPaymentConfirmed'
}

export interface IHeadersType {
  recipientStaticId: string
}

export interface ILCPayload {
  version: number
  vaktId: string
}

export interface ILCMessageType {
  messageType: string
}
export interface ILCRequestedPayload extends ILCMessageType {}

export interface ILCRequestRejectedPayload extends ILCMessageType {
  reason: string
}

export interface ILCIssuedPayload extends ILCMessageType {
  lcId: string
}

export interface ILCIssuedRejectedPayload extends ILCMessageType {
  reason: string
  lcId: string
}

export interface ILCAmendmentRequestedPayload extends ILCMessageType {
  lcId: string
}

export interface ILCAmendmentRejectedPayload extends ILCMessageType {
  lcId: string
}

export interface ILCAmendmentApprovedPayload extends ILCMessageType {
  lcId: string
  lcAmendmentId
}

export interface ILCExpiredPayload extends ILCMessageType {
  lcId: string
}

export interface ILCPaymentConfirmedPayload extends ILCMessageType {
  parcelId: string
  lcId: string
}

export interface IVaktMessage<T> {
  headers: IHeadersType
  payload: T & ILCPayload
}

export type ILCRequestedMessage = IVaktMessage<ILCRequestedPayload>

export type ILCRequestRejectedMessage = IVaktMessage<ILCRequestRejectedPayload>

export type ILCIssuedMessage = IVaktMessage<ILCIssuedPayload>

export type ILCIssuedRejectedMessage = IVaktMessage<ILCIssuedRejectedPayload>

export type ILCAmendmentRequestedMessage = IVaktMessage<ILCAmendmentRequestedPayload>

export type ILCAmendmentRejectedMessage = IVaktMessage<ILCAmendmentRejectedPayload>

export type ILCAmendmentApprovedMessage = IVaktMessage<ILCAmendmentApprovedPayload>

export type ILCExpiredMessage = IVaktMessage<ILCExpiredPayload>

export type ILCPaymentConfirmedMessage = IVaktMessage<ILCPaymentConfirmedPayload>

export type ILCPayloadType =
  | ILCRequestedPayload
  | ILCRequestRejectedPayload
  | ILCIssuedPayload
  | ILCIssuedRejectedPayload
  | ILCAmendmentRequestedPayload
  | ILCAmendmentRejectedPayload
  | ILCAmendmentApprovedPayload
  | ILCExpiredPayload
  | ILCPaymentConfirmedPayload

export enum DocumentMessageType {
  KomgoTradeDocument = 'KOMGO.TradeDocument',
  KomgoDiscardDocument = 'KOMGO.DiscardTradeDocument',
  VaktDocument = 'VAKT.Document'
}

export enum TradeMessageType {
  TradeUpdated = 'INTERNAL.TRADE.Updated',
  CargoUpdated = 'INTERNAL.CARGO.Updated'
}
