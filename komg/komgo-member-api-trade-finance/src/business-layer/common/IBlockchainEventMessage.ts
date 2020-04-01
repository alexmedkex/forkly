export default interface IBlockchainEventMessage {
  contractAddress: string
  data: string
  blockNumber: number
  transactionHash: string
  transactionIndex: number
  logIndex: number
}
