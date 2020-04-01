import 'reflect-metadata'

import { ContractAddressStatus, ContractAddress } from '../models/contract-address'

import { ContractAddressDataAgent } from './ContractAddressDataAgent'
import { DatabaseError } from './errors'
import { checksumAddress } from './utils'

const TEST_ADDRESS = '0xa0c2bae464ef41e9457a69d5e125be64d07fa905'
const CHECKSUM_TEST_ADDRESS = checksumAddress('0xa0c2bae464ef41e9457a69d5e125be64d07fa905')
const TEST_TX_HASH = '0x35f8622742fb09b0c8ff1743a36c627fc04783596c2bb95c567260eb93028135'

const updateOneMock = jest.fn()
const findOneMock = jest.fn()

describe('ContractAddressDataAgent', () => {
  let agent: ContractAddressDataAgent

  beforeAll(() => {
    ContractAddress.findOne = findOneMock
    ContractAddress.updateOne = updateOneMock
  })

  beforeEach(() => {
    agent = new ContractAddressDataAgent()
  })

  describe('blacklist', () => {
    it('should blacklist an old or new address', async () => {
      updateOneMock.mockReturnValueOnce({ exec: jest.fn() })

      await agent.blacklist(TEST_ADDRESS, TEST_TX_HASH)

      expect(ContractAddress.updateOne).toHaveBeenCalledTimes(1)
      expect(ContractAddress.updateOne).toHaveBeenCalledWith(
        { address: CHECKSUM_TEST_ADDRESS },
        {
          $set: {
            address: CHECKSUM_TEST_ADDRESS,
            txHash: TEST_TX_HASH,
            status: ContractAddressStatus.Blacklisted
          }
        },
        { upsert: true }
      )
    })

    it('should reject if blacklisting fails', async () => {
      updateOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error('msg')) })

      await expect(agent.blacklist(TEST_ADDRESS, TEST_TX_HASH)).rejects.toThrow(DatabaseError)
    })
  })

  describe('whitelist', () => {
    it('should whitelist an old or new address', async () => {
      updateOneMock.mockReturnValueOnce({ exec: jest.fn() })

      await agent.whitelist(TEST_ADDRESS, TEST_TX_HASH)

      expect(ContractAddress.updateOne).toHaveBeenCalledTimes(1)
      expect(ContractAddress.updateOne).toHaveBeenCalledWith(
        { address: CHECKSUM_TEST_ADDRESS },
        {
          $set: {
            address: CHECKSUM_TEST_ADDRESS,
            txHash: TEST_TX_HASH,
            status: ContractAddressStatus.Whitelisted
          }
        },
        { upsert: true }
      )
    })

    it('should reject if whitelisting fails', async () => {
      updateOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error('msg')) })

      await expect(agent.whitelist(TEST_ADDRESS, TEST_TX_HASH)).rejects.toThrow(DatabaseError)
    })
  })

  describe('getStatus', () => {
    it('should get the status of an address', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ status: ContractAddressStatus.Blacklisted })
      })

      const status: ContractAddressStatus = await agent.getStatus(TEST_ADDRESS)

      expect(ContractAddress.findOne).toHaveBeenCalledTimes(1)
      expect(ContractAddress.findOne).toHaveBeenCalledWith({ address: CHECKSUM_TEST_ADDRESS }, 'status')
      expect(status).toEqual(ContractAddressStatus.Blacklisted)
    })

    it('should return the return value of findOne if the address is not found', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      })

      const status = await agent.getStatus(TEST_ADDRESS)

      expect(ContractAddress.findOne).toHaveBeenCalledTimes(1)
      expect(ContractAddress.findOne).toHaveBeenCalledWith({ address: CHECKSUM_TEST_ADDRESS }, 'status')
      expect(status).toEqual(null)
    })

    it('should throw a DatabaseError if call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error('msg')) })

      await expect(agent.getStatus(TEST_ADDRESS)).rejects.toThrow(DatabaseError)
    })
  })

  describe('getTxHash', () => {
    it('should get the hash of transaction that cause the status of an address', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce({ txHash: 'testTxHash' })
      })

      const txHash = await agent.getTxHash(TEST_ADDRESS)

      expect(ContractAddress.findOne).toHaveBeenCalledTimes(1)
      expect(ContractAddress.findOne).toHaveBeenCalledWith({ address: CHECKSUM_TEST_ADDRESS }, 'txHash')
      expect(txHash).toEqual('testTxHash')
    })

    it('should return the return value of findOne if the address is not found', async () => {
      findOneMock.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null)
      })

      const txHash = await agent.getTxHash(TEST_ADDRESS)

      expect(ContractAddress.findOne).toHaveBeenCalledTimes(1)
      expect(ContractAddress.findOne).toHaveBeenCalledWith({ address: CHECKSUM_TEST_ADDRESS }, 'txHash')
      expect(txHash).toEqual(null)
    })

    it('should throw a DatabaseError if call to DB fails', async () => {
      findOneMock.mockReturnValueOnce({ exec: jest.fn().mockRejectedValueOnce(new Error('msg')) })

      await expect(agent.getTxHash(TEST_ADDRESS)).rejects.toThrow(DatabaseError)
    })
  })
})
