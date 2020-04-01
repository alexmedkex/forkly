export interface ISignerClient {
  postTransaction(tx: any)
  getKey()
  sign(data: any)
}
