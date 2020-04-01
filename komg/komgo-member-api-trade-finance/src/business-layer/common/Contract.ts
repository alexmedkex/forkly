import { IWeb3Instance } from '@komgo/blockchain-access'
import { toDecimal, hashMessageWithCallData } from './HashFunctions'
import { getLogger } from '@komgo/logging'
import { IContract } from './IContract'
import { injectable, unmanaged } from 'inversify'
import { generateBlockchainException } from '../../exceptions/utils'

const ethUtil = require('ethereumjs-util')

const DUMMY_V = '27'
const DUMMY_R = '0x111111'
const DUMMY_S = '0x222222'

@injectable()
export abstract class Contract<ActionType> implements IContract<ActionType> {
  protected contractReference: any
  protected functionEncoders = new Map<ActionType, (...values: string[]) => any>()
  private logger = getLogger('Contract')
  private contractAddress: string
  private readonly web3Instance: any

  constructor(@unmanaged() web3Instance: IWeb3Instance | any, @unmanaged() contractABI: any[]) {
    this.web3Instance = web3Instance
    this.contractReference = new web3Instance.eth.Contract(contractABI)
    this.setupFunctionEncoders()
  }

  instance() {
    return this.contractReference
  }

  async getCurrentState(): Promise<string> {
    try {
      this.logger.info(`Getting current state`)
      const currentState = await this.contractReference.methods.getCurrentStateId().call()
      return currentState
    } catch (error) {
      throw generateBlockchainException(error, this.logger, { contractAddress: this.contractAddress })
    }
  }

  at(contractAddress: string) {
    this.contractAddress = contractAddress
    this.contractReference.options.address = contractAddress
    return this.contractReference
  }

  abstract setupFunctionEncoders()

  async getNonce(): Promise<number> {
    try {
      this.logger.info(`Getting nonce`)
      const nonce = await this.contractReference.methods.nonce().call()
      return Number(nonce)
    } catch (error) {
      throw generateBlockchainException(error, this.logger, { contractAddress: this.contractAddress })
    }
  }

  async getHashedMessageWithCallDataFor(type: ActionType, nonce: number, ...data: string[]) {
    try {
      this.logger.info(`Getting call data to be signed (getHashedMessageWithCallDataFor)`)
      const functionCallData = this.getEncodedABI(type, DUMMY_V, DUMMY_R, DUMMY_S, ...data)
      if (!nonce) {
        nonce = await this.getNonce()
      }
      const result = hashMessageWithCallData(this.contractAddress, nonce, functionCallData)
      return result
    } catch (error) {
      throw generateBlockchainException(error, this.logger, { contractAddress: this.contractAddress })
    }
  }

  getEncodedDataFromSignatureFor(type: ActionType, signature, ...data: string[]) {
    const { v, r, s } = this.getSignatureParameters(signature)
    return this.getEncodedABI(type, v, r, s, ...data)
  }

  getEncodedABI(type: ActionType, v: string, r: string, s: string, ...data: string[]) {
    const handler = this.functionEncoders.get(type)
    if (!handler) {
      throw new Error(`Couldn't get a proper handler for ${type} in getEncodedABI`)
    }
    return handler(v, r, s, ...(data || [])).encodeABI()
  }

  getSignatureParameters(signature: string) {
    const result = ethUtil.fromRpcSig(signature)
    const v = toDecimal(result.v)
    const r = `0x${(result.r as Buffer).toString('hex')}`
    const s = `0x${(result.s as Buffer).toString('hex')}`

    return { v, r, s }
  }
}
