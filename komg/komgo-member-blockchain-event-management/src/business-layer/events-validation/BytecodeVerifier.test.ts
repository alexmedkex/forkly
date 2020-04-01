import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { LightContractLibraryDataAgent, IContractLibraryDataAgent } from '../../data-layer/data-agents'
import { ContractNotFoundError } from '../../data-layer/data-agents/errors'
import { END_OF_BYTECODE, END_OF_BYTECODE_ABI_ENCODER_V2 } from '../../util/extractCompiledBytecode'
import { QuorumClient } from '../blockchain/QuorumClient'

import BytecodeVerifier from './BytecodeVerifier'

const TRANSACTION_HASH = '0xVarela'

const eth = {
  getTransaction: jest.fn(() => ({ input: '' }))
}
const utils = {
  keccak256: jest.fn(() => '')
}
const mockContractInfo = { name: 'Contract', version: 0, activated: false }

describe('BytecodeVerifier', () => {
  let bytecodeVerifier: BytecodeVerifier
  let contractLibraryDataAgentMock: jest.Mocked<IContractLibraryDataAgent>
  let quorumClientMock: jest.Mocked<QuorumClient>
  let web3Mock: any

  beforeEach(() => {
    contractLibraryDataAgentMock = createMockInstance(LightContractLibraryDataAgent)
    quorumClientMock = createMockInstance(QuorumClient)
    contractLibraryDataAgentMock.getContractInfo.mockResolvedValue(mockContractInfo)
    web3Mock = { eth, utils }

    bytecodeVerifier = new BytecodeVerifier(contractLibraryDataAgentMock, quorumClientMock, web3Mock)
  })

  it('should resolve to the activated status of the contract', async () => {
    contractLibraryDataAgentMock.getContractInfo.mockResolvedValueOnce({ ...mockContractInfo, activated: true })

    const verified = await bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)

    expect(verified).toEqual(true)
  })

  it('should reject if it fails to get transaction', async () => {
    web3Mock.eth.getTransaction.mockRejectedValueOnce(new Error())

    await expect(bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)).rejects.toThrow(Error)
  })

  it('should correctly extract compiled bytecode from init bytecode, separated by the swarm hash', async () => {
    // bytecode is appended with swarm hash, metadata and constructor arguments. The extractor removes them
    web3Mock.eth.getTransaction.mockResolvedValueOnce({ input: `0xTestBytecodeString${END_OF_BYTECODE}0xtraMetadata` })
    web3Mock.utils.keccak256.mockReturnValueOnce('testBytecodeHash')

    await bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)

    expect(web3Mock.utils.keccak256).toHaveBeenCalledWith('0xTestBytecodeString')
    expect(contractLibraryDataAgentMock.getContractInfo).toHaveBeenCalledWith('testBytecodeHash')
  })

  it('should correctly extract compiled bytecode from init bytecode with abi encoder v2', async () => {
    // bytecode is appended with swarm hash, metadata and constructor arguments. The extractor removes them
    web3Mock.eth.getTransaction.mockResolvedValueOnce({
      input: `0xTestBytecodeString2${END_OF_BYTECODE_ABI_ENCODER_V2}0xtraMetadata`
    })
    web3Mock.utils.keccak256.mockReturnValueOnce('testBytecodeHash2')

    await bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)

    expect(web3Mock.utils.keccak256).toHaveBeenCalledWith('0xTestBytecodeString2')
    expect(contractLibraryDataAgentMock.getContractInfo).toHaveBeenCalledWith('testBytecodeHash2')
  })

  it('should correctly get bytecode from private transaction using quorum', async () => {
    // bytecode is appended with swarm hash, metadata and constructor arguments. The extractor removes them
    const bytecode = '0x6080601234'
    web3Mock.eth.getTransaction.mockResolvedValueOnce({ input: `0xbytecode-hash`, v: '0x26' })
    quorumClientMock.getTransactionData.mockResolvedValueOnce(`${bytecode}${END_OF_BYTECODE}0xtraMetadata`)
    web3Mock.utils.keccak256.mockReturnValueOnce('testBytecodeHash')

    await bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)

    expect(web3Mock.utils.keccak256).toHaveBeenCalledWith(bytecode)
    expect(quorumClientMock.getTransactionData).toHaveBeenCalledWith('0xbytecode-hash')
    expect(contractLibraryDataAgentMock.getContractInfo).toHaveBeenCalledWith('testBytecodeHash')
  })

  it('should reject if getting contract info fails', async () => {
    contractLibraryDataAgentMock.getContractInfo.mockRejectedValueOnce(new Error())

    await expect(bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)).rejects.toThrow(Error)
  })

  it('should reject to same error thrown from data agent getContractInfo', async () => {
    contractLibraryDataAgentMock.getContractInfo.mockRejectedValueOnce(new ContractNotFoundError('msg'))

    await expect(bytecodeVerifier.verifyContractCreation(TRANSACTION_HASH)).rejects.toThrow(ContractNotFoundError)
  })
})
