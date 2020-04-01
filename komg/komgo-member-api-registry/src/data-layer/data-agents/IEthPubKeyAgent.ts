import { EthPubKey } from '../models/EthPubKey'
import { NewEthPubKey } from '../models/NewEthPubKey'
import { TransactionData } from '../models/TransactionData'

export interface IEthPubKeyAgent {
  getAddEthPubKeyTxData(node: string, ethPubKey: NewEthPubKey): Promise<TransactionData>
  getRevokeEthPubKeyTxData(node: string, ethPubKeyIndex: number): Promise<TransactionData>
  getEthPubKey(node: string, ethPubKeyIndex: number): Promise<EthPubKey>
}
