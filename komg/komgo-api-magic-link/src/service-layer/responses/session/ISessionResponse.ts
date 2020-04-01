export interface ISessionResponse {
  sessionId: string
  staticId: string
  merkle?: string
  metadataHash?: string
  timestamp?: string
  activated?: boolean
}
