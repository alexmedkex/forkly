export enum MessageType {
  ShareCreditLine = 'KOMGO.CreditLines.Share',
  RevokeCreditLine = 'KOMGO.CreditLines.Revoke',
  CreditLineRequest = 'KOMGO.CreditLines.Request',
  CreditLineRequestDeclined = 'KOMGO.CreditLines.RequestDeclined'
}
export type MessageTypeValues =
  | MessageType.ShareCreditLine
  | MessageType.RevokeCreditLine
  | MessageType.CreditLineRequest
  | MessageType.CreditLineRequestDeclined
