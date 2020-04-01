import { IContractInfo } from './IContractInfo'

export interface ILightContract extends IContractInfo {
  abi: object[]
  bytecode: string
  createEventSigHash: string
}
