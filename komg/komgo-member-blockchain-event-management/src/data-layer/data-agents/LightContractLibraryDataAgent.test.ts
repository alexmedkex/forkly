import 'reflect-metadata'

import LightContractLibraryMock, { TEST_CONTRACT_NAME } from '../../../test/LightContractLibraryMock'

import { IContractLibraryDataAgent } from './IContractLibraryDataAgent'
import { LightContractLibraryDataAgent } from './LightContractLibraryDataAgent'

const CAST_EVENT_SIG_HASH = LightContractLibraryMock.castEventSigHash
const TEST_CONTRACT_DEFAULT_VERSION = LightContractLibraryMock.byName[TEST_CONTRACT_NAME].defaultVersion
const TEST_CONTRACT_BYTECODE_HASH =
  LightContractLibraryMock.byName[TEST_CONTRACT_NAME].versions[TEST_CONTRACT_DEFAULT_VERSION]

const INVALID_VERSION_NUMBER = 666

describe('LightContractLibraryDataAgent', () => {
  let agent: IContractLibraryDataAgent

  beforeEach(() => {
    agent = new LightContractLibraryDataAgent(LightContractLibraryMock)
  })

  describe('getBytecode', () => {
    let expectedBytecode: string
    beforeAll(() => {
      expectedBytecode = LightContractLibraryMock.byBytecodeHash[TEST_CONTRACT_BYTECODE_HASH].bytecode
    })

    it('should retrieve activated version bytecode successfully', async () => {
      const bytecode = await agent.getBytecode(TEST_CONTRACT_NAME)
      expect(bytecode).toEqual(expectedBytecode)
    })

    it('should retrieve bytecode of specific contract version successfully', async () => {
      const bytecode = await agent.getBytecode(TEST_CONTRACT_NAME, TEST_CONTRACT_DEFAULT_VERSION)
      expect(bytecode).toEqual(expectedBytecode)
    })

    it('should fail to retrieve contract if the name is invalid', async () => {
      await expect(agent.getBytecode('InexistentContract')).rejects.toThrowError()
    })

    it('should fail to retrieve contract if the version is invalid', async () => {
      await expect(agent.getBytecode(TEST_CONTRACT_NAME, INVALID_VERSION_NUMBER)).rejects.toThrowError()
    })
  })

  describe('getABI', () => {
    let expectedABI: object[]
    beforeAll(() => {
      expectedABI = LightContractLibraryMock.byBytecodeHash[TEST_CONTRACT_BYTECODE_HASH].abi
    })

    it('should retrieve activated version abi successfully', async () => {
      const abi = await agent.getABI(TEST_CONTRACT_NAME)
      expect(abi).toEqual(expectedABI)
    })

    it('should retrieve abi of specific contract version successfully', async () => {
      const abi = await agent.getABI(TEST_CONTRACT_NAME, TEST_CONTRACT_DEFAULT_VERSION)
      expect(abi).toEqual(expectedABI)
    })

    it('should fail to retrieve contract if the name is invalid', async () => {
      await expect(agent.getABI('InexistentContract')).rejects.toThrowError()
    })

    it('should fail to retrieve contract if the version is invalid', async () => {
      await expect(agent.getABI(TEST_CONTRACT_NAME, INVALID_VERSION_NUMBER)).rejects.toThrowError()
    })
  })

  describe('getCreateEventSigHash', () => {
    let expectedCreateEventHash: string
    beforeAll(() => {
      expectedCreateEventHash = LightContractLibraryMock.byBytecodeHash[TEST_CONTRACT_BYTECODE_HASH].createEventSigHash
    })

    it('should retrieve the create event hash of the activated version successfully', async () => {
      const hash = await agent.getCreateEventSigHash(TEST_CONTRACT_NAME)
      expect(hash).toEqual(expectedCreateEventHash)
    })

    it('should retrieve the create event hash of a specific contract version successfully', async () => {
      const hash = await agent.getCreateEventSigHash(TEST_CONTRACT_NAME, TEST_CONTRACT_DEFAULT_VERSION)
      expect(hash).toEqual(expectedCreateEventHash)
    })

    it('should fail to retrieve contract if the name is invalid', async () => {
      await expect(agent.getCreateEventSigHash('InexistentContract')).rejects.toThrowError()
    })

    it('should fail to retrieve contract if the version is invalid', async () => {
      await expect(agent.getCreateEventSigHash(TEST_CONTRACT_NAME, INVALID_VERSION_NUMBER)).rejects.toThrowError()
    })
  })

  describe('getContractInfo', () => {
    it('should retrieve the contract info successfully', async () => {
      const contractInfo = await agent.getContractInfo(TEST_CONTRACT_BYTECODE_HASH)
      expect(contractInfo).toEqual({
        name: TEST_CONTRACT_NAME,
        version: 0,
        activated: true
      })
    })

    it('should fail to retrieve contract info if the bytecode hash is invalid', async () => {
      await expect(agent.getContractInfo('inexistentBytecodeHash')).rejects.toThrowError()
    })
  })

  describe('isExistingCreateEventSigHash', () => {
    it('should return true if the signature hash exists in the library', async () => {
      const createEventSigHash = LightContractLibraryMock.byBytecodeHash[TEST_CONTRACT_BYTECODE_HASH].createEventSigHash
      expect(await agent.isExistingCreateEventSigHash(createEventSigHash)).toEqual(true)
    })

    it('should return fase if the signature hash does not exist in the library', async () => {
      expect(await agent.isExistingCreateEventSigHash('nonexistent-create-event-sig-hash')).toEqual(false)
    })
  })

  describe('getCastEventSigHash', () => {
    it('should retrieve the cast event sig hash successfully', async () => {
      const castEventSigHash = await agent.getCastEventSigHash()
      expect(castEventSigHash).toEqual(CAST_EVENT_SIG_HASH)
    })
  })
})
