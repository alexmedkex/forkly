export enum MESSAGE_TYPE {
  ConnectRequest = 'KOMGO.Coverage.ConnectRequest',
  ApproveConnectRequest = 'KOMGO.Coverage.ApproveConnectRequest',
  RejectConnectRequest = 'KOMGO.Coverage.RejectConnectRequest'
}
export type MessageType =
  | 'KOMGO.Coverage.ConnectRequest'
  | 'KOMGO.Coverage.ApproveConnectRequest'
  | 'KOMGO.Coverage.RejectConnectRequest'
