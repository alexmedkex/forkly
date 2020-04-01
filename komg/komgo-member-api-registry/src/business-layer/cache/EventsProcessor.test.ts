import { IWeb3Instance, Web3Wrapper } from '@komgo/blockchain-access'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import { IRegistryCacheDataAgent } from '../../data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { IRegistryEventProcessedDataAgent } from '../../data-layer/data-agents/IRegistryEventProcessedDataAgent'
import { IContractArtifacts } from '../../data-layer/smart-contracts/IContractArtifacts'

import { EventsProcessor } from './EventsProcessor'
import { IEventsProcessor } from './IEventsProcessor'

const web3: IWeb3Instance = {
  eth: {
    clearSubscriptions: jest.fn(),
    getAccounts: jest.fn(),
    getBlockNumber: jest.fn(),
    getPastLogs: jest.fn(),
    sendTransaction: jest.fn(),
    subscribe: jest.fn(),
    Contract: jest.fn()
  }
}

const registryCacheDataAgent: IRegistryCacheDataAgent = {
  clearCache: jest.fn(),
  saveSingleEvent: jest.fn(),
  getMembers: jest.fn()
}

const registryEventProcessedDataAgent: IRegistryEventProcessedDataAgent = {
  createOrUpdate: jest.fn(),
  getLastEventProcessed: jest.fn()
}

const ensRegistryAbi = [
  { inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'node', type: 'bytes32' },
      { indexed: false, name: 'label', type: 'bytes32' },
      { indexed: false, name: 'owner', type: 'address' }
    ],
    name: 'NewOwner',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: 'node', type: 'bytes32' }, { indexed: false, name: 'owner', type: 'address' }],
    name: 'Transfer',
    type: 'event'
  },
  {
    constant: false,
    inputs: [{ name: 'node', type: 'bytes32' }, { name: 'label', type: 'bytes32' }, { name: 'owner', type: 'address' }],
    name: 'setSubnodeOwner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
const komgoResolverAbi = [
  {
    anonymous: false,
    inputs: [{ indexed: false, name: 'node', type: 'bytes32' }, { indexed: false, name: 'resolver', type: 'address' }],
    name: 'NewResolver',
    type: 'event'
  }
]

const ensAddress = '0xAfDA406A236ec16d65ee2EB18c791Dfb48dd9a51'
const komgoResolverAddress = '0xAfDA406A236ec16d65ee2EB18c791Dfb48dd9a52'
const komgoMetaResolverAddress = '0xAfDA406A236ec16d65ee2EB18c791Dfb48dd9a53'
const invalidAddress = '0xffffffffff6ec16d65ee2EB18c791Dfb48dd9a5b'

const eventFromAnotherContract = [
  {
    logIndex: 0,
    transactionIndex: 0,
    transactionHash: '0x69d50bb145f52632764a166c4a05c4456f8c5d12782c3b9f55aacd9e0ef69c88',
    blockHash: '0xb7058d0347a49ef4f91a725cd11f467f30694a527c56e4e09ddd207a5e8cae15',
    blockNumber: 23,
    address: invalidAddress,
    data:
      '0x8e383953e605ed387836d080380ae5c7d0263d2cc08e9299204ffa67ced71b53000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000127175657565393939393939393939393939390000000000000000000000000000',
    topics: ['0x7c78c899dbe31827334bcfd19588bb1b1f811e644d24994bed1cf0afe28adf49'],
    type: 'mined',
    id: 'log_5f146d3b'
  }
]

const oneEvent = [
  {
    logIndex: 0,
    transactionIndex: 0,
    transactionHash: '0x69d50bb145f52632764a166c4a05c4456f8c5d12782c3b9f55aacd9e0ef69c88',
    blockHash: '0xb7058d0347a49ef4f91a725cd11f467f30694a527c56e4e09ddd207a5e8cae15',
    blockNumber: 23,
    address: ensAddress,
    data:
      '0x8e383953e605ed387836d080380ae5c7d0263d2cc08e9299204ffa67ced71b53000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000127175657565393939393939393939393939390000000000000000000000000000',
    topics: ['0x7c78c899dbe31827334bcfd19588bb1b1f811e644d24994bed1cf0afe28adf49'],
    type: 'mined',
    id: 'log_5f146d3b'
  }
]
const twoEvents = [
  {
    logIndex: 0,
    transactionIndex: 0,
    transactionHash: '0x69d50bb145f52632764a166c4a05c4456f8c5d12782c3b9f55aacd9e0ef69c88',
    blockHash: '0xb7058d0347a49ef4f91a725cd11f467f30694a527c56e4e09ddd207a5e8cae15',
    blockNumber: 23,
    address: ensAddress,
    data:
      '0x8e383953e605ed387836d080380ae5c7d0263d2cc08e9299204ffa67ced71b53000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000127175657565393939393939393939393939390000000000000000000000000000',
    topics: ['0x7c78c899dbe31827334bcfd19588bb1b1f811e644d24994bed1cf0afe28adf49'],
    type: 'mined',
    id: 'log_5f146d3b'
  },
  {
    logIndex: 0,
    transactionIndex: 0,
    transactionHash: '0x69d50bb145f52632764a166c4a05c4456f8c5d12782c3b9f55aacd9e0ef69c88',
    blockHash: '0xb7058d0347a49ef4f91a725cd11f467f30694a527c56e4e09ddd207a5e8cae15',
    blockNumber: 23,
    address: komgoMetaResolverAddress,
    data:
      '0x8e383953e605ed387836d080380ae5c7d0263d2cc08e9299204ffa67ced71b530000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001271756575653939393939393939393939393900000000000000000000000000ff',
    topics: ['0x7c78c899dbe31827334bcfd19588bb1b1f811e644d24994bed1cf0afe28adfff'],
    type: 'mined',
    id: 'log_5fffffff'
  }
]

const ensRegistryDeployed = { abi: ensRegistryAbi, address: ensAddress }
const komgoMetaResolverDeployed = { abi: komgoResolverAbi, address: komgoMetaResolverAddress }
const komgoResolverDeployed = { abi: komgoResolverAbi, address: komgoResolverAddress }

const artifactsMock: IContractArtifacts = {
  ensRegistry: () => ensRegistryDeployed,
  komgoMetaResolver: () => komgoMetaResolverDeployed,
  komgoResolver: () => komgoResolverDeployed,
  komgoRegistrar: jest.fn(),
  resolverForNode: jest.fn()
}

describe('Events processing', () => {
  let eventsProcessor: IEventsProcessor
  let web3WrapperMock: Web3Wrapper

  beforeEach(() => {
    web3WrapperMock = createMockInstance(Web3Wrapper)
    web3WrapperMock.web3Instance = web3
    eventsProcessor = new EventsProcessor(
      web3WrapperMock,
      artifactsMock,
      registryCacheDataAgent,
      registryEventProcessedDataAgent
    )
  })

  it('there are no events, we do not process', async () => {
    web3WrapperMock.web3Instance.eth.getPastLogs.mockImplementation(() => [])
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => oneEvent)
    await eventsProcessor.processEventsBatch(1, 10)
    expect(registryCacheDataAgent.saveSingleEvent).toHaveBeenCalledTimes(0)
  })

  it('there is one event, we process it', async () => {
    web3WrapperMock.web3Instance.eth.getPastLogs.mockImplementation(() => oneEvent)
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => oneEvent)
    await eventsProcessor.processEventsBatch(1, 10)
    expect(registryCacheDataAgent.saveSingleEvent).toHaveBeenCalledTimes(1)
  })

  it('there is one event, and collection is empty we process it', async () => {
    web3WrapperMock.web3Instance.eth.getPastLogs.mockImplementation(() => oneEvent)
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => undefined)
    await eventsProcessor.processEventsBatch(1, 10)
    expect(registryCacheDataAgent.saveSingleEvent).toHaveBeenCalledTimes(1)
  })

  it('there is one event coming from an unknown address, we ignore it', async () => {
    web3WrapperMock.web3Instance.eth.getPastLogs.mockImplementation(() => eventFromAnotherContract)
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => oneEvent)
    await eventsProcessor.processEventsBatch(1, 10)
    expect(registryCacheDataAgent.saveSingleEvent).toHaveBeenCalledTimes(0)
  })

  it('there are more events, we process them', async () => {
    web3WrapperMock.web3Instance.eth.getPastLogs.mockImplementation(() => twoEvents)
    registryEventProcessedDataAgent.getLastEventProcessed.mockImplementation(() => oneEvent)
    await eventsProcessor.processEventsBatch(1, 10)
    expect(registryCacheDataAgent.saveSingleEvent).toHaveBeenCalledTimes(2)
  })
})
