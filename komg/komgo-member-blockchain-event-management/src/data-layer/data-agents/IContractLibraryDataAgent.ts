import { IContractInfo } from '../models/light-contract-library'

export interface IContractLibraryDataAgent {
  getBytecode(contractName: string, version?: number): Promise<string>
  getABI(contractName: string, version?: number): Promise<object[]>
  getCreateEventSigHash(contractName: string, version?: number): Promise<string>
  isExistingCreateEventSigHash(sigHash: string): Promise<boolean>
  getContractInfo(bytecodeHash: string): Promise<IContractInfo>
  getCastEventSigHash(): Promise<string>
}
