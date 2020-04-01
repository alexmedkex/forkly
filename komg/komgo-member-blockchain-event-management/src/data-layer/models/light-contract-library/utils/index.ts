import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import SmartContractsInfo from '@komgo/smart-contracts'
import Web3 from 'web3'
import { keccak256 } from 'web3-utils'

import { ILightContractLibrary } from '..'
import { ErrorName } from '../../../../util/ErrorName'
import { extractCompiledBytecode } from '../../../../util/extractCompiledBytecode'

import { LightContractLibraryConfigError } from './LightContractLibraryConfigError'

export const CONTRACT_CAST_EVENT_NAME = 'CastEvent'

export const getEncodedCreationEventSignature = (contractName: string, abi: object[], web3Instance: Web3) => {
  // By convention, the name of the contract creation event is:
  const contractCreationEventName = `${contractName}Created`
  const contractCreationEventABI = findEventABIByName(contractCreationEventName, abi)

  if (contractCreationEventABI) {
    return web3Instance.eth.abi.encodeEventSignature(contractCreationEventABI)
  }

  logAndThrowError(
    ErrorName.LightContractLibraryConfigContractCreation,
    'Unable to find contract creation event name',
    abi
  )
}

export const getEncodedCastEventSignature = (abi: object[], web3Instance: Web3) => {
  const contractCastEventABI = findEventABIByName(CONTRACT_CAST_EVENT_NAME, abi)

  if (contractCastEventABI) {
    return web3Instance.eth.abi.encodeEventSignature(contractCastEventABI)
  }

  logAndThrowError(ErrorName.LightContractLibraryConfigContractCast, 'Unable to find contract cast event name', abi)
}

export const createLightContractLibrary = (web3: Web3): ILightContractLibrary => {
  const lightContractLibrary: ILightContractLibrary = {
    byName: {},
    byBytecodeHash: {},
    castEventSigHash: getEncodedCastEventSignature(SmartContractsInfo.ICastEventEmitterABI, web3)
  }

  const addContractInfo = (contractName: string, contractDetails: any, version: string) => {
    const abi = contractDetails.ABI
    const contractCreationEvent = getEncodedCreationEventSignature(contractName, abi, web3)
    const bytecode = extractCompiledBytecode(contractDetails.ByteCode)
    const bytecodeHash = keccak256(bytecode)

    lightContractLibrary.byName[contractName].versions[version] = bytecodeHash

    lightContractLibrary.byBytecodeHash[bytecodeHash] = {
      name: contractName,
      version: Number(version),
      abi,
      bytecode,
      createEventSigHash: contractCreationEvent,
      activated: contractDetails.Active
    }
  }

  for (const [contractName, contractInfo] of Object.entries(SmartContractsInfo)) {
    // Skip mock contracts
    if (!contractInfo.Private) {
      continue
    }
    if (contractName.includes('Mock') || contractName.includes(CONTRACT_CAST_EVENT_NAME)) {
      continue
    }

    lightContractLibrary.byName[contractName] = {
      defaultVersion: undefined,
      versions: {}
    }

    if (contractInfo.versions) {
      // Default version is the latest one by default, starting at 0
      lightContractLibrary.byName[contractName].defaultVersion = Object.keys(contractInfo.versions).length - 1

      for (const version of Object.keys(contractInfo.versions)) {
        addContractInfo(contractName, contractInfo.versions[version], version)
      }
    } else {
      lightContractLibrary.byName[contractName].defaultVersion = 0
      addContractInfo(contractName, contractInfo, '0')
    }
  }

  return lightContractLibrary
}

export const findEventABIByName = (eventName: string, abi: object[]): any => {
  return abi.find(
    (parametersDefinition: any) => parametersDefinition.type === 'event' && parametersDefinition.name === eventName
  )
}

const logAndThrowError = (errorName: ErrorName, errorMessage: string, abi: object[]) => {
  getLogger('LightcontractLibraryUtils').crit(ErrorCode.Configuration, errorName, errorMessage, {
    contractCastEventName: CONTRACT_CAST_EVENT_NAME,
    abi
  })
  throw new LightContractLibraryConfigError(errorMessage)
}
