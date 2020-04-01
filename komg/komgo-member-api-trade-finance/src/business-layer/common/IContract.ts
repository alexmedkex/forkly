import { Web3Wrapper } from '@komgo/blockchain-access'
import { ISignature } from './ISignature'

export interface IContractBase {
  instance(): typeof Web3Wrapper.web3Instance.eth.Contract
  getNonce(): Promise<number>
  getSignatureParameters(signature: string): ISignature
  at(address: string): typeof Web3Wrapper.web3Instance.eth.Contract
  getCurrentState(): Promise<string>
}

export interface IContract<ActionType> extends IContractBase {
  instance(): typeof Web3Wrapper.web3Instance.eth.Contract
  getEncodedDataFromSignatureFor(type: ActionType, signature, ...data: string[]): string
  getNonce(): Promise<number>
  getSignatureParameters(signature: string): ISignature
  getHashedMessageWithCallDataFor(type: ActionType, nonce: number, ...data: string[]): Promise<string>
  at(address: string): typeof Web3Wrapper.web3Instance.eth.Contract
  getCurrentState(): Promise<string>
  getEncodedABI(type: ActionType, v: string, r: string, s: string, ...data: string[]): Promise<string>
}
