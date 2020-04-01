import { SignerApi } from '@komgo/api-blockchain-signer-client'
import { getLogger } from '@komgo/logging'
import { ObjectId } from 'bson'
import { sha3 } from 'ethereumjs-util'
import { injectable } from 'inversify'
import { merkleRoot } from 'merkle-tree-solidity'
import * as web3Utils from 'web3-utils'

import { API_DOCUMENTS_REQUEST_ORIGIN } from '../../business-layer/messaging/enums'

import { IPostRawTransactionRequest } from './signer-client/IPostRawTransactionRequest'

interface IDocumentRegistrationInfo {
  companyStaticId: string
  timestamp: number
}

// ==============================
// Transaction Manager
// ==============================
@injectable()
export class DocumentsTransactionManager {
  private readonly logger = getLogger('DocumentsTransactionManager')

  private readonly web3Instance
  private readonly signer: SignerApi

  // ===========
  // Contracts
  // ==========
  private readonly contractAddress: string
  private readonly abi: any[]
  private readonly web3Contract

  /**
   *
   * @param web3 - web3 Instance with already supplied provider
   * @param contractAddress
   * @param signer - Signer client that abstracts and interacts with our signer api
   */
  constructor(web3, contractAddress: string, abi: any[], signer: SignerApi) {
    this.web3Instance = web3
    this.contractAddress = contractAddress
    this.abi = abi
    this.web3Contract = new this.web3Instance.eth.Contract(this.abi, this.contractAddress)
    this.signer = signer
  }

  /**
   *
   * @param content - document content
   * @returns - promise that resolves into the sha3 hash of the document
   */
  public hash(content: string): Buffer {
    return sha3(content)
  }

  public merkle(hashes: Buffer[]): string {
    const merkle: string = merkleRoot(hashes).toString('ascii')
    return web3Utils.asciiToHex(merkle)
  }

  /**
   *
   * @param content
   */
  public async signDocument(content: string): Promise<string> {
    const response = await this.signer.sign({
      payload: content
    })

    return response.data
  }

  /**
   * @param docHashes - one or more hashes of the document to be submitted on-chain
   * @param txId - OjectId identifier so that we can link our docs to its posted tx
   * @returns - returns Promise with a transaction id in api-signer
   */
  public async submitDocHashes(docHashes: string[], txId?: ObjectId): Promise<string> {
    return this.register(docHashes, txId)
  }

  /**
   * Uses document registry smartcontract to look up document by has
   */
  public async findDocument(docHash: string): Promise<IDocumentRegistrationInfo | undefined> {
    try {
      const data = await this.web3Contract.methods.getRegistrationInfo(docHash).call()

      return {
        companyStaticId: data[0],
        timestamp: data[1] * 1000
      }
    } catch (e) {
      this.logger.info(`Document with hash ${docHash} not found in the document registry`, {
        msg: e.message
      })
    }
  }

  private async register(hashes: string[], txId?: ObjectId): Promise<string> {
    this.logger.info('Encoding register method ABI')
    const data = this.web3Contract.methods.register(hashes).encodeABI()

    const transactionObject: IPostRawTransactionRequest = {
      id: txId ? txId.toHexString() : undefined,
      to: this.contractAddress,
      value: '0x00',
      data,
      requestOrigin: API_DOCUMENTS_REQUEST_ORIGIN
    }

    this.logger.info('Transaction object created, calling the signer', transactionObject)

    const res = await this.signer.sendTx(transactionObject)
    return res.data
  }
}
