import { injectable, inject } from 'inversify'

import { VALUES } from '../../inversify/values'
import { ILightContract, ILightContractLibrary } from '../models/light-contract-library'

import { ContractNotFoundError } from './errors'
import { IContractLibraryDataAgent } from './IContractLibraryDataAgent'

@injectable()
export class LightContractLibraryDataAgent implements IContractLibraryDataAgent {
  constructor(@inject(VALUES.LightContractLibrary) private readonly contractLibrary: ILightContractLibrary) {}

  public async getBytecode(contractName: string, version?: number) {
    const contract = await this.getContractByName(contractName, version)
    return contract.bytecode
  }

  public async getABI(contractName: string, version?: number) {
    const contract = await this.getContractByName(contractName, version)
    return contract.abi
  }

  public async getCreateEventSigHash(contractName: string, version?: number) {
    const contract = await this.getContractByName(contractName, version)
    return contract.createEventSigHash
  }

  public async isExistingCreateEventSigHash(sigHash: string) {
    const contractCreationEventSigHashes = Object.values(this.contractLibrary.byBytecodeHash).map(contract => {
      return contract.createEventSigHash
    })

    return contractCreationEventSigHashes.some(hash => sigHash === hash)
  }

  public async getContractInfo(bytecodeHash: string) {
    if (!this.contractLibrary.byBytecodeHash[bytecodeHash]) {
      throw new ContractNotFoundError('Contract not found')
    }

    const contract = this.contractLibrary.byBytecodeHash[bytecodeHash]
    return {
      name: contract.name,
      version: contract.version,
      activated: contract.activated
    }
  }

  public async getCastEventSigHash() {
    return this.contractLibrary.castEventSigHash
  }

  private async getContractByName(contractName: string, version?: number): Promise<ILightContract> {
    if (!this.contractLibrary.byName[contractName]) {
      throw new ContractNotFoundError('Contract not found')
    }

    const isVersionDefined = version !== undefined

    if (isVersionDefined && !this.contractLibrary.byName[contractName].versions[version]) {
      throw new ContractNotFoundError('Inexistent contract version')
    }

    const useVersion = isVersionDefined ? version : this.contractLibrary.byName[contractName].defaultVersion
    const bytecodeHash = this.contractLibrary.byName[contractName].versions[useVersion]
    return this.contractLibrary.byBytecodeHash[bytecodeHash]
  }
}
