import { ErrorCode } from '@komgo/error-utilities'
import { productCA, productKYC } from '@komgo/products'
import { MongoError } from 'mongodb'

import { ErrorName } from '../../utils/ErrorName'

import CustomerProductManager from './CustomerProductManager'

jest.useFakeTimers()

const getPastEventsMock = jest.fn(() => [])
const mockLogEvent = {
  blockNumber: 1,
  transactionHash: 'hash',
  args: { products: '[]' }
}

describe('CustomerProductManager', () => {
  let customerProductManager

  beforeAll(() => {
    customerProductManager = new CustomerProductManager()
    customerProductManager.smartContract = {
      komgoMetaResolver: jest.fn().mockResolvedValue({
        setText: jest.fn().mockResolvedValue({ logs: [mockLogEvent] }),
        getPastEvents: getPastEventsMock,
        staticId: jest.fn(() => 'staticId')
      }),
      komgoOnboarder: jest.fn().mockResolvedValue({
        addTextEntries: jest.fn()
      })
    }
    customerProductManager.web3 = {
      web3Instance: {
        eth: {
          getAccounts: jest.fn(() => []),
          getBlockNumber: jest.fn(() => 1)
        },
        utils: { soliditySha3: jest.fn() }
      }
    }
    customerProductManager.customerDataAgent = {
      updateCustomer: jest.fn()
    }
    customerProductManager.lastProcessedBlockDataAgent = {
      setLastProcessedBlock: jest.fn(),
      getLastProcessedBlock: jest.fn(() => Promise.resolve({ lastProcessedBlock: 0 }))
    }
    customerProductManager.pullInterval = 1
    customerProductManager.logger = {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    }
  })

  it('should run setProducts and return undefined', async () => {
    const result = await customerProductManager.setProducts()
    expect(result).toEqual(undefined)
  })

  it('should call getBlockNumber on processEvents', async () => {
    await customerProductManager.processEvents()
    expect(customerProductManager.web3.web3Instance.eth.getBlockNumber).toHaveBeenCalledWith()
  })

  it('should log errors when getPastEvents call fails in processEvents', async () => {
    getPastEventsMock.mockRejectedValueOnce(new Error('oops'))
    await customerProductManager.processEvents()
    expect(customerProductManager.logger.error).toHaveBeenCalledWith(
      ErrorCode.BlockchainTransaction,
      ErrorName.GetPastEventsError,
      'oops',
      {
        stacktrace: expect.any(String),
        fromBlock: 1,
        komgoProductsChangedTopic: expect.any(Array)
      }
    )
  })

  it('should run processEvent and return undefined', async () => {
    const result = await customerProductManager.processEvent(mockLogEvent)
    expect(result).toEqual(undefined)
  })

  it('should run startEventListener and return undefined', async () => {
    const result = await customerProductManager.startEventListener()
    expect(result).toEqual(undefined)
  })

  it('should run stopEventListener and return undefined', async () => {
    const result = await customerProductManager.stopEventListener()
    expect(result).toEqual(undefined)
  })

  it('should update customer when there is a komgoProducts event in blockchain', async () => {
    const event = {
      blockNumber: 1234,
      args: {
        _key: 'komgoProducts',
        _node: '0x0000000000000',
        _value: JSON.stringify([productKYC, productCA])
      }
    }
    await customerProductManager.processEvent(event)
    expect(customerProductManager.customerDataAgent.updateCustomer).toHaveBeenCalledWith({
      blockHeight: event.blockNumber,
      memberNodeId: '0x0000000000000',
      memberStaticId: 'staticId',
      products: ['KYC', 'CA']
    })
  })

  it('should log a database error', async () => {
    const event = {
      blockNumber: 1234,
      transactionHash: '0x0000000000000',
      args: {
        _key: 'komgoProducts',
        _node: '0x0000000000000',
        _value: JSON.stringify([productKYC, productCA])
      }
    }
    customerProductManager.customerDataAgent.updateCustomer.mockRejectedValue(new MongoError('oops'))
    await customerProductManager.processEvent(event)
    expect(customerProductManager.logger.error).toHaveBeenCalledWith(
      ErrorCode.DatabaseInvalidData,
      ErrorName.EventPersistenceError,
      'oops',
      {
        stacktrace: expect.any(String),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        eventArgs: event.args
      }
    )
  })
})
