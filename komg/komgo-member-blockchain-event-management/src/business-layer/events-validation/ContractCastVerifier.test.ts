import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { ContractAddressDataAgent } from '../../data-layer/data-agents'
import { ContractAddressStatus } from '../../data-layer/models/contract-address'
import { ContractCastVerifierError } from '../errors'

import ContractCastVerifier from './ContractCastVerifier'

const mockWeb3 = {
  eth: {
    abi: { decodeLog: jest.fn() }
  }
}
const mockDecodedLog = {
  at: '0xatAddress'
}
const mockLog = {
  data: '0xdata',
  topics: ['0xtopic0', '0xtopic1']
}

describe('ContractCastVerifier', () => {
  let contractCastVerifier: ContractCastVerifier
  let contractAddressDataAgentMock: jest.Mocked<ContractAddressDataAgent>

  beforeEach(() => {
    contractAddressDataAgentMock = createMockInstance(ContractAddressDataAgent)

    contractCastVerifier = new ContractCastVerifier(contractAddressDataAgentMock, mockWeb3 as any)
  })

  describe('verify', () => {
    it('should verify a contract cast event successfully', async () => {
      mockWeb3.eth.abi.decodeLog.mockReturnValueOnce(mockDecodedLog)
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(ContractAddressStatus.Whitelisted)

      const result = await contractCastVerifier.verify(mockLog as any)

      expect(mockWeb3.eth.abi.decodeLog).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.getStatus).toHaveBeenCalledTimes(1)
      expect(result).toBe(true)
    })

    it('should throw if the contract address data agent retuns blacklisted', async () => {
      mockWeb3.eth.abi.decodeLog.mockReturnValueOnce(mockDecodedLog)
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(ContractAddressStatus.Blacklisted)

      const result = await contractCastVerifier.verify(mockLog as any)

      expect(mockWeb3.eth.abi.decodeLog).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.getStatus).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    it('should throw if the contract address data agent retuns null', async () => {
      mockWeb3.eth.abi.decodeLog.mockReturnValueOnce(mockDecodedLog)
      contractAddressDataAgentMock.getStatus.mockResolvedValueOnce(null)

      const result = await contractCastVerifier.verify(mockLog as any)

      expect(mockWeb3.eth.abi.decodeLog).toHaveBeenCalledTimes(1)
      expect(contractAddressDataAgentMock.getStatus).toHaveBeenCalledTimes(1)
      expect(result).toBe(false)
    })

    it('should throw an error if log decoding fails', async () => {
      mockWeb3.eth.abi.decodeLog.mockImplementationOnce(() => {
        throw new Error()
      })

      await expect(contractCastVerifier.verify(mockLog as any)).rejects.toThrow()
    })

    it('should throw a ContractCastVerifierError if log does not contain an "at" field', async () => {
      mockWeb3.eth.abi.decodeLog.mockReturnValueOnce({})

      await expect(contractCastVerifier.verify(mockLog as any)).rejects.toThrowError(ContractCastVerifierError)
    })

    it('should throw if the contract address data agent fails', async () => {
      mockWeb3.eth.abi.decodeLog.mockReturnValueOnce(mockDecodedLog)
      contractAddressDataAgentMock.getStatus.mockRejectedValueOnce(new Error())

      await expect(contractCastVerifier.verify(mockLog as any)).rejects.toThrow()
    })
  })
})
