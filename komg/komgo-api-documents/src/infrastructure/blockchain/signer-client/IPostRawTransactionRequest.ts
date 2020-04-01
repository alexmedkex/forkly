export interface IPostRawTransactionRequest {
  id?: string
  to: string
  value: string
  data: string
  requestOrigin: string
}
