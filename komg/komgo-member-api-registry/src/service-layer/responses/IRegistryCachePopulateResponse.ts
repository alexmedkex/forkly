export default interface IRegistryCachePopulateResponse {
  startBlock: number
  endBlock: number
  lastBlockProcessed: number
  lastBlockchainBlock: number
  serviceStarted: boolean
}
