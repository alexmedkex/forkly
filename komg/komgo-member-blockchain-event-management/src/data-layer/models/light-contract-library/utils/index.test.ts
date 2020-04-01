import SmartContractsInfo from '@komgo/smart-contracts'
import { createMockInstance } from 'jest-create-mock-instance'
import Web3 from 'web3'
import { keccak256 } from 'web3-utils'

import TestContract from '../../../../../test/contracts/TestContract.json'
import { extractCompiledBytecode } from '../../../../util/extractCompiledBytecode'

import {
  createLightContractLibrary,
  getEncodedCreationEventSignature,
  getEncodedCastEventSignature,
  findEventABIByName,
  CONTRACT_CAST_EVENT_NAME
} from '.'
import { LightContractLibraryConfigError } from './LightContractLibraryConfigError'

const ENCODED_CAST_SIGNATURE = 'contractCastSigHash'
const ENCODED_CREATION_SIGNATURE = 'contractCreationSigHash'

const nbContracts = Object.entries(SmartContractsInfo).length
const mockEncodeEventSignature = jest.fn()

describe('LightContractLibrary utils', () => {
  let mockWeb3: any

  beforeEach(() => {
    mockWeb3 = createMockInstance(Web3)
    mockWeb3.eth = {
      abi: {
        encodeEventSignature: mockEncodeEventSignature
      }
    }

    mockEncodeEventSignature.mockReturnValue(ENCODED_CREATION_SIGNATURE)
  })

  describe('createLightContractLibrary', () => {
    it('Creates the light contract library successfully', () => {
      // First one is the contract cast encoded signature
      mockEncodeEventSignature.mockReturnValueOnce(ENCODED_CAST_SIGNATURE)

      const lightContractLibrary = createLightContractLibrary(mockWeb3)

      const LCBytecode = extractCompiledBytecode(SmartContractsInfo.LC.ByteCode)
      const LCBytecodeHash = keccak256(LCBytecode)

      const LCContractInfo = lightContractLibrary.byBytecodeHash[LCBytecodeHash]
      expect(LCContractInfo).toBeDefined()
      expect(LCContractInfo.abi).toEqual(SmartContractsInfo.LC.ABI)
      expect(LCContractInfo.activated).toEqual(SmartContractsInfo.LC.Active)
      expect(LCContractInfo.bytecode).toEqual(LCBytecode)
      expect(LCContractInfo.createEventSigHash).toEqual(ENCODED_CREATION_SIGNATURE)
      expect(LCContractInfo.name).toEqual('LC')
      expect(LCContractInfo.version).toEqual(Object.entries(SmartContractsInfo.LC.versions).length - 1)
      expect(lightContractLibrary.castEventSigHash).toEqual(ENCODED_CAST_SIGNATURE)
    })
  })

  describe('getEncodedCreationEventSignature', () => {
    it('Computes the encoded event signature of a contract creation event successfully', () => {
      const creationEventSigHash = getEncodedCreationEventSignature('Contract', TestContract.abi, mockWeb3)
      expect(creationEventSigHash).toEqual(ENCODED_CREATION_SIGNATURE)
    })

    it('Throws an error if the contract creation event is not found in the ABI', () => {
      try {
        getEncodedCreationEventSignature('NonExistentContract', [], mockWeb3)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(LightContractLibraryConfigError)
      }
    })
  })

  describe('getEncodedCastEventSignature', () => {
    it('Computes the encoded event signature of a contract cast event successfully', () => {
      mockEncodeEventSignature.mockReturnValueOnce(ENCODED_CAST_SIGNATURE)

      const abi = SmartContractsInfo.ICastEventEmitterABI
      const castEventSigHash = getEncodedCastEventSignature(abi, mockWeb3)

      expect(castEventSigHash).toEqual(ENCODED_CAST_SIGNATURE)
    })

    it('Throws an error if the contract cast event is not found in the ABI', () => {
      try {
        getEncodedCastEventSignature([], mockWeb3)
        fail('Expected failure')
      } catch (error) {
        expect(error).toBeInstanceOf(LightContractLibraryConfigError)
      }
    })
  })

  describe('findEventABIByName', () => {
    it('Finds the ABI of an event successfully', () => {
      const eventABI = findEventABIByName(CONTRACT_CAST_EVENT_NAME, SmartContractsInfo.ICastEventEmitterABI)
      expect(eventABI).toBeDefined()
    })

    it('Returns undefined if the event is not found in the ABI', () => {
      const eventABI = findEventABIByName('nonExistingEvent', SmartContractsInfo.ICastEventEmitterABI)
      expect(eventABI).toBeUndefined()
    })
  })
})
