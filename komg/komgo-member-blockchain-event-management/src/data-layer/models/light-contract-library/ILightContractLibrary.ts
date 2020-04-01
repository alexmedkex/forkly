import { ILightContract } from './ILightContract'

export interface ILightContractLibrary {
  byName: {
    [contractName: string]: {
      defaultVersion: number
      versions: {
        [version: string]: string
      }
    }
  }
  byBytecodeHash: {
    [bytecodeHash: string]: ILightContract
  }
  castEventSigHash: string
}
