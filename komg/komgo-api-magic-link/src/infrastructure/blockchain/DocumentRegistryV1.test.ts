import 'reflect-metadata'
const BigNumber = require('bignumber.js')

const reverseNodeAddress = 'reverse_node_address'
const mockHash = jest.fn(() => 'hashedstring')
const mockGetStorageAt = jest.fn(() => reverseNodeAddress)
const mockGetDocumentHashAndOwner = jest.fn(() => [null, null, 'test_hash', new BigNumber(100)])

const truffleContact = {
  getDocumentHashAndOwner: mockGetDocumentHashAndOwner
}
const smcProvider = {
  contractAddress: '0x0',
  getTruffleContract: jest.fn().mockResolvedValue(truffleContact)
}
jest.mock('eth-ens-namehash', () => ({ hash: mockHash }))

import { DocumentRegistryV1 } from './DocumentRegistryV1'

describe('DocumentRegistryV1', () => {
  const web3Instance = {
    eth: {
      getStorageAt: mockGetStorageAt,
      net: { getId: () => 'id' }
    },
    currentProvider: {}
  }
  let docRegistry: DocumentRegistryV1

  beforeEach(() => {
    docRegistry = new DocumentRegistryV1(smcProvider, 'document.registry.domain', web3Instance)
  })

  it('should return company id', async () => {
    const companyId = await docRegistry.getCompanyId('docId')
    expect(companyId).toBe(reverseNodeAddress)
  })

  it('should call getTruffleContract once', async () => {
    await docRegistry.getCompanyId('docId')
    await docRegistry.getCompanyId('docId')
    expect(smcProvider.getTruffleContract).toHaveBeenCalledTimes(1)
  })

  it('should return null instead of company id', async () => {
    mockGetStorageAt.mockImplementation(() => `0x${new Array(65).join('0')}`)
    const companyId = await docRegistry.getCompanyId('docId')
    expect(companyId).toBe(null)
  })

  it('should return hash and timestamp', async () => {
    const result = await docRegistry.getHashAndTimestamp('docId')
    expect(result).toEqual(['test_hash', '100000'])

    await docRegistry.getHashAndTimestamp('docId')
  })
})
