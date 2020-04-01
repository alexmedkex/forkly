import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'
import { Log } from 'web3/types'

import { ContractAddressDataAgent, LightContractLibraryDataAgent } from '../../data-layer/data-agents'
import { ContractNotFoundError } from '../../data-layer/data-agents/errors'
import { ContractAddressStatus } from '../../data-layer/models/contract-address'

import BytecodeVerifier from './BytecodeVerifier'
import ContractCastVerifier from './ContractCastVerifier'
import EventValidator from './EventValidator'

const mockLog: Log = {
  address: '0x36eFb40A6a5bA83461682066FD81fE85a01E5491',
  data: '',
  topics: [''],
  logIndex: 0,
  transactionHash: '0x35f8622742fb09b0c8ff1743a36c627fc04783596c2bb95c567260eb93028135',
  transactionIndex: 0,
  blockHash: '0x1fE85a01E549135f8622742fb09b0c8ff1743a36c627fc04783596c2bb95c565',
  blockNumber: 0
}

describe('EventValidator', () => {
  let validator: EventValidator
  let contractAddressDataAgentMock: jest.Mocked<ContractAddressDataAgent>
  let contractLibraryDataAgentMock: jest.Mocked<LightContractLibraryDataAgent>
  let contractCastVerifierMock: jest.Mocked<ContractCastVerifier>
  let bytecodeVerifierMock: jest.Mocked<BytecodeVerifier>

  beforeEach(() => {
    contractAddressDataAgentMock = createMockInstance(ContractAddressDataAgent)
    contractLibraryDataAgentMock = createMockInstance(LightContractLibraryDataAgent)
    contractCastVerifierMock = createMockInstance(ContractCastVerifier)
    bytecodeVerifierMock = createMockInstance(BytecodeVerifier)

    validator = new EventValidator(
      contractAddressDataAgentMock,
      contractLibraryDataAgentMock,
      contractCastVerifierMock,
      bytecodeVerifierMock
    )
  })

  describe('contract is already blacklisted', () => {
    it('should return false if the status of the address is blacklisted', async () => {
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(ContractAddressStatus.Blacklisted)

      const isValid = await validator.validate({ ...mockLog, address: 'test-address' })

      expect(contractAddressDataAgentMock.getStatus).toHaveBeenCalledWith('test-address')
      expect(isValid).toEqual(false)
    })

    it('should reject if database is not available', async () => {
      contractAddressDataAgentMock.getStatus.mockRejectedValueOnce(new Error())

      await expect(validator.validate(mockLog)).rejects.toThrow(Error)
    })
  })

  describe('contract is already whitelisted', () => {
    const CAST_EVENT_SIG_HASH = 'test-cast-event-hash'

    beforeEach(() => {
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(ContractAddressStatus.Whitelisted)
    })

    it('should return true if valid contract cast event', async () => {
      contractLibraryDataAgentMock.getCastEventSigHash.mockResolvedValueOnce(CAST_EVENT_SIG_HASH)
      contractCastVerifierMock.verify.mockResolvedValueOnce(true)

      const isValid = await validator.validate({ ...mockLog, topics: [CAST_EVENT_SIG_HASH, ...mockLog.topics] })

      expect(contractLibraryDataAgentMock.getCastEventSigHash).toHaveBeenCalledTimes(1)
      expect(isValid).toEqual(true)
    })

    it('should succeed if event is not contract cast', async () => {
      contractLibraryDataAgentMock.getCastEventSigHash.mockResolvedValueOnce(CAST_EVENT_SIG_HASH)

      const isValid = await validator.validate({ ...mockLog, topics: ['not-cast-hash', ...mockLog.topics] })

      expect(contractLibraryDataAgentMock.getCastEventSigHash).toHaveBeenCalledTimes(1)
      expect(isValid).toEqual(true)
    })

    it('should reject if cast event hash cannot be retrieved from database', async () => {
      contractLibraryDataAgentMock.getCastEventSigHash.mockRejectedValueOnce(new Error())

      await expect(validator.validate(mockLog)).rejects.toThrow(Error)
    })

    it('should return false if contract cast verifier returns false', async () => {
      contractLibraryDataAgentMock.getCastEventSigHash.mockResolvedValueOnce(CAST_EVENT_SIG_HASH)
      contractCastVerifierMock.verify.mockResolvedValueOnce(false)

      const isValid = await validator.validate({ ...mockLog, topics: [CAST_EVENT_SIG_HASH, ...mockLog.topics] })

      expect(contractLibraryDataAgentMock.getCastEventSigHash).toHaveBeenCalledTimes(1)
      expect(contractCastVerifierMock.verify).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.blacklist).toHaveBeenCalledTimes(1)
      expect(isValid).toEqual(false)
    })
  })

  describe('contract is unknown', () => {
    beforeEach(() => {
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(null) // unknown contract address
    })

    it('should succeed but not whitelist contract if event is valid contract cast but not contract creation', async () => {
      contractLibraryDataAgentMock.getCastEventSigHash.mockResolvedValueOnce('test-cast-hash-2')
      contractCastVerifierMock.verify.mockResolvedValueOnce(true)

      const isValid = await validator.validate({
        ...mockLog,
        topics: ['test-cast-hash-2', ...mockLog.topics]
      })

      expect(contractLibraryDataAgentMock.getCastEventSigHash).toHaveBeenCalledTimes(1)
      expect(contractLibraryDataAgentMock.isExistingCreateEventSigHash).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.whitelist).not.toHaveBeenCalled()
      expect(isValid).toEqual(true)
    })

    it('should blacklist address if event is neither valid contract cast nor contract creation', async () => {
      contractLibraryDataAgentMock.getCastEventSigHash.mockResolvedValueOnce('')
      contractLibraryDataAgentMock.isExistingCreateEventSigHash.mockResolvedValueOnce(false)

      const isValid = await validator.validate({
        ...mockLog,
        topics: ['test-cast-hash-3'],
        address: 'test-address',
        transactionHash: 'test-transaction-hash'
      })

      expect(contractLibraryDataAgentMock.getCastEventSigHash).toHaveBeenCalledTimes(1)
      expect(contractLibraryDataAgentMock.isExistingCreateEventSigHash).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.blacklist).toHaveBeenCalledWith('test-address', 'test-transaction-hash')
      expect(isValid).toEqual(false)
    })
  })

  describe('contract is unknown and is contract creation', () => {
    beforeEach(() => {
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(null) // unknown contract address
      contractLibraryDataAgentMock.getCastEventSigHash.mockResolvedValueOnce('non-matching-cast-event-hash')
      contractLibraryDataAgentMock.isExistingCreateEventSigHash.mockResolvedValueOnce(true)
    })

    it('should whitelist address with valid bytecode', async () => {
      bytecodeVerifierMock.verifyContractCreation.mockResolvedValueOnce(true)

      const isValid = await validator.validate({
        ...mockLog,
        address: 'test-address-1',
        transactionHash: 'test-transaction-hash-1'
      })

      expect(bytecodeVerifierMock.verifyContractCreation).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.whitelist).toHaveBeenCalledWith('test-address-1', 'test-transaction-hash-1')
      expect(isValid).toEqual(true)
    })

    it('should blacklist address with bytecode for inactivated contract', async () => {
      bytecodeVerifierMock.verifyContractCreation.mockResolvedValueOnce(false)

      const isValid = await validator.validate({
        ...mockLog,
        address: 'test-address-2',
        transactionHash: 'test-transaction-hash-2'
      })

      expect(bytecodeVerifierMock.verifyContractCreation).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.blacklist).toHaveBeenCalledWith('test-address-2', 'test-transaction-hash-2')
      expect(isValid).toEqual(false)
    })

    it('should throw if verifiying contract bytecode fails', async () => {
      bytecodeVerifierMock.verifyContractCreation.mockRejectedValueOnce(new Error())

      await expect(validator.validate(mockLog)).rejects.toThrow(Error)
    })

    it('should blacklist if the contract is not found', async () => {
      bytecodeVerifierMock.verifyContractCreation.mockRejectedValueOnce(new ContractNotFoundError('msg'))

      const isValid = await validator.validate({
        ...mockLog,
        address: 'test-address-4',
        transactionHash: 'test-transaction-hash-4'
      })

      expect(bytecodeVerifierMock.verifyContractCreation).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.blacklist).toHaveBeenCalledWith('test-address-4', 'test-transaction-hash-4')
      expect(isValid).toEqual(false)
    })
  })
})
