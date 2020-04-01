import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import Web3 from 'web3'
import { Transaction } from 'web3-core'

import { IContractLibraryDataAgent } from '../../data-layer/data-agents'
import { TYPES } from '../../inversify/types'
import { extractCompiledBytecode } from '../../util/extractCompiledBytecode'
import { QuorumClient } from '../blockchain/QuorumClient'

@injectable()
export default class BytecodeVerifier {
  private readonly logger = getLogger('BytecodeVerifier')

  constructor(
    @inject(TYPES.ContractLibraryDataAgent) private readonly contractLibraryDataAgent: IContractLibraryDataAgent,
    @inject(TYPES.QuorumClient) private readonly quorumClient: QuorumClient,
    @inject(TYPES.Web3Instance) private readonly web3: Web3
  ) {}

  /**
   * Verifies that the bytecode of a deployed private contract corresponds to the bytecode
   * provided in the contract library
   *
   * @param txHash transaction hash
   *
   * @returns activated status
   */
  public async verifyContractCreation(txHash: string): Promise<boolean> {
    this.logger.info('Verifying contract bytecode', {
      txHash
    })

    const transaction = await this.web3.eth.getTransaction(txHash)
    const initBytecode = await this.getBytecodeFromTransaction(transaction)
    const bytecode = extractCompiledBytecode(initBytecode)
    const bytecodeHash = this.web3.utils.keccak256(bytecode)

    this.logger.info('Retrieving contract bytecode', { bytecodeHash })
    const contractInfo = await this.contractLibraryDataAgent.getContractInfo(bytecodeHash)

    return contractInfo.activated
  }

  /**
   * In a public transaction the tx.input is the deployed contract bytecode
   * In a private transaction the tx.input is the sha512 of the deployed contract bytecode
   * We can retrieve it via a request to Quorum
   */
  private async getBytecodeFromTransaction(tx: Transaction): Promise<string> {
    if (this.isPrivateTransaction(tx)) {
      this.logger.info('Fetching private transaction data from quorum', { reference: tx.input })
      return this.quorumClient.getTransactionData(tx.input)
    }
    return tx.input
  }

  /**
   * Checks that a transaction is private
   *
   * @param tx Transaction to check (casted to any because Quorum adds the r, s, v fields to the transaction)
   */
  private isPrivateTransaction(tx: any): boolean {
    return tx.v === '0x25' || tx.v === '0x26'
  }
}
