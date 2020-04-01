import { Web3Wrapper } from '@komgo/blockchain-access'
import { MessagingFactory } from '@komgo/messaging-library'
import SmartContractInfo from "@komgo/smart-contracts"
import * as AsyncPolling from "async-polling"
import 'reflect-metadata'
import * as Web3EthAbi from 'web3-eth-abi'
import { TYPES } from '../src/inversify/types'
import { IntegrationEnvironment } from './utils/IntegrationEnvironment'
import MQMessageClient from './utils/MQMessageClient'
import { setupEns } from './utils/setup-ens'
import { getAccounts } from './utils/web3Provider'
const Web3 = require('web3')

const messageClient = new MQMessageClient()
let polling

const integrationEnvironment = new IntegrationEnvironment()
const timeout = 90000
jest.setTimeout(timeout)

integrationEnvironment.setupEnvironmentVars('companyId')

import { EventsProcessor } from '../src/business-layer/cache/EventsProcessor';
import { IEventsProcessor } from '../src/business-layer/cache/IEventsProcessor';
import { IMemberDAO } from '../src/data-layer/dao/IMemberDAO'
import { IEventDataAgent } from '../src/data-layer/data-agents/cache/IEventDataAgent'
import { IRegistryCacheDataAgent } from '../src/data-layer/data-agents/cache/IRegistryCacheDataAgent'
import { IRegistryEventProcessedDataAgent } from '../src/data-layer/data-agents/IRegistryEventProcessedDataAgent'
import ContractArtifacts from '../src/data-layer/smart-contracts/ContractArtifacts';
import { IContractArtifacts } from '../src/data-layer/smart-contracts/IContractArtifacts';
import { iocContainer } from '../src/inversify/ioc'
import { CacheEventService } from '../src/service-layer/events/CacheEventService';
import IService from '../src/service-layer/events/IService'
import IPollingServiceFactory from '../src/service-layer/IPollingServiceFactory';
import { sleep } from './utils/utils'

const events = buildEventsMappingForMessage([
  { abi: SmartContractInfo.KomgoMetaResolver.ABI },
  { abi: SmartContractInfo.ENSRegistry.ABI },
  { abi: SmartContractInfo.KomgoResolver.ABI }
])

let komgoMetaResolverAddress
let komgoResolverAddress
let ensRegistryAddress
const exampleTxHash = '0x71a931f92508a8e2d32a350302230b25ac4a8e5c85bd6f4f1a4f5881482a0897'

const mongo = iocContainer.get<IMemberDAO>(TYPES.MemberDAO)
let blocknumber = 2
const node = new Web3Wrapper().web3Instance.utils.soliditySha3('meta.komgo', 'company1')

describe('Blockchain events', () => {
  let serverModule
  let contracts

  beforeAll(async () => {
    await integrationEnvironment.setupContainers()

    const accounts = await getAccounts()
    const defaultAccount = accounts.slice(0, 1)
    contracts = await setupEns(defaultAccount)

    komgoMetaResolverAddress = contracts.komgoMetaResolver.address
    komgoResolverAddress = contracts.komgoResolver.address
    ensRegistryAddress = contracts.ensRegistry.address

    rebind(contracts.ensRegistry.address)

    const agent = iocContainer.get<IEventDataAgent>(TYPES.NewOwnerDataAgent)
    const service = iocContainer.get<IService>(TYPES.CacheEventService)
    const eventAgent = iocContainer.get<IRegistryEventProcessedDataAgent>(TYPES.RegistryEventProcessedDataAgent)
    const web3Wrapper =  iocContainer.get<Web3Wrapper>(TYPES.Web3Wrapper)
    iocContainer
      .rebind(TYPES.ContractArtifacts)
      .toConstantValue(
        new ContractArtifacts(
          contracts.ensRegistry.address,
          'komgoresolver.contract.komgo',
          'komgoregistrar.contract.komgo',
          'komgometaresolver.contract.komgo',
          web3Wrapper
        )
      )

    // this will run the run-server script which starts the api-trade-finance node express server
    serverModule = await import('../src/run-server')

    await agent.saveEvent({
      node: 'meta.komgo',
      label: 'company1',
      owner: 'owner'
    })
    await service.start()
    await sleep(1000) // Wait for consumers to be registered
    await eventAgent.createOrUpdate(1, 1, 1)
  })

  afterAll(async () => {
    const stopFunction = serverModule.default
    await stopFunction.call()
    await integrationEnvironment.tearDownContainers()
  })

  beforeEach(async () => {
    await messageClient.beforeEach()
  })

  afterEach(() => {
    polling.stop()
    blocknumber++
  })

  describe('KomgoMetaResolver events', () => {
    describe('setTextChanged', () => {
      it('should update staticId field in the local database', async done => {
        const fieldName = 'staticId'
        const value = '123456'
        const expectedResult = { [fieldName]: value }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update x500Name field in the local database', async done => {
        const fieldName = 'x500Name'
        const value = `{
            "CN": "Equinor ASA",
            "O": "Equinor ASA",
            "C": "NO",
            "L": "Stavanger",
            "STREET": "Forusbeen 50",
            "PC": "4035"
          }`
        const expectedResult = {
          [fieldName]: JSON.parse(value)
        }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update hasSWIFTKey field in the local database', async done => {
        const fieldName = 'hasSWIFTKey'
        const value = 'false'
        const expectedResult = { [fieldName]: false }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update isFinancialInstitution field in the local database', async done => {
        const fieldName = 'isFinancialInstitution'
        const value = 'false'
        const expectedResult = { [fieldName]: false }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update isMember field in the local database', async done => {
        const fieldName = 'isMember'
        const value = 'false'
        const expectedResult = { [fieldName]: false }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update komgoProducts field in the local database', async done => {
        const fieldName = 'komgoProducts'
        const value = `[
            {
                "productName": "Kyc",
                "productId": "KYC"
            },
            {
                "productName": "Letter Of Credit",
                "productId": "LC"
            },
            {
                "productName": "Receivables Discounting",
                "productId": "RD"
            }
          ]`
        const expectedResult = {
          [fieldName]: JSON.parse(value)
        }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update vaktStaticId field in the local database', async done => {
        const fieldName = 'vaktStaticId'
        const value = '63092'
        const expectedResult = { [fieldName]: value }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update komgoMnid field in the local database', async done => {
        const fieldName = 'komgoMnid'
        const value = 'EQUINOR_ASA_63093'
        const expectedResult = { [fieldName]: value }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })

      it('should update vaktMnid field in the local database', async done => {
        const fieldName = 'vaktMnid'
        const value = 'EQUINOR_ASA_63092'
        const expectedResult = { [fieldName]: value }

        publishTextChangedMessageAndExpect(fieldName, value, expectedResult, done)
      })
    })

    describe('ReverseNodeChanged', () => {
      it('should update node field in the local database', async done => {
        const reverseNode = '0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2'
        const expectedResult = {
          reverseNode
        }

        publishMessageAndExpect(
          'ReverseNodeChanged',
          ['bytes32', 'bytes32'],
          [node, reverseNode],
          expectedResult,
          komgoMetaResolverAddress,
          done
        )
      })
    })

    describe('EthPubKey events', () => {
      const xPublicKey = '0x74d429b653748a5674d429b653748a5674d429b653748a5674d429b653748a56'
      const yPublicKey = '0x33531b26808b6d1533531b26808b6d1533531b26808b6d1533531b26808b6d15'
      const address = '0x74d429b653748a56cb33531b26808b6d153670fe'
      const termDate = 123
      const current = true
      const revoked = false

      describe('EthPubKeyAdded', () => {
        it('should update ethPubKeys field in the local database', async done => {
          const expectedResult = {
            ethPubKeys: [
              {
                key: xPublicKey + yPublicKey.replace('0x', ''),
                termDate,
                address: Web3.utils.toChecksumAddress(address),
                current,
                revoked
              }
            ]
          }

          publishMessageAndExpect(
            'EthPubKeyAdded',
            ['bytes32', 'bytes32', 'bytes32', 'address', 'uint'],
            [node, xPublicKey, yPublicKey, address, termDate],
            expectedResult,
            komgoMetaResolverAddress,
            done
          )
        })
      })

      describe('EthPubKeyRevoked', () => {
        it('should set ethpubkey to revoked in the local database', async done => {
          const index = 0

          const expectedResult = {
            ethPubKeys: [
              {
                key: xPublicKey + yPublicKey.replace('0x', ''),
                termDate,
                address: Web3.utils.toChecksumAddress(address),
                current,
                revoked: true
              }
            ]
          }

          publishMessageAndExpect(
            'EthPubKeyRevoked',
            ['bytes32', 'uint'],
            [node, index],
            expectedResult,
            komgoMetaResolverAddress,
            done
          )
        })
      })
    })

    describe('KomgoMessagingPubKey events', () => {
      const key = '0x74d429b653748a5674d429b653748a5674d429b653748a5674d429b653748a56'
      const termDate = 123
      const current = true
      const revoked = false

      describe('KomgoMessagingPubKeyAdded', () => {
        it('should update komgoMessagingPubKeys in the local database', async done => {
          const expectedResult = {
            komgoMessagingPubKeys: [
              {
                key,
                termDate,
                current,
                revoked
              }
            ]
          }

          publishMessageAndExpect(
            'KomgoMessagingPubKeyAdded',
            ['bytes32', 'string', 'uint'],
            [node, key, termDate],
            expectedResult,
            komgoMetaResolverAddress,
            done
          )
        })
      })

      describe('KomgoMessagingPubKeyRevoked', () => {
        it('should set komgoMessagingPubKey to revoked in the local database', async done => {
          const index = 0
          const expectedResult = {
            komgoMessagingPubKeys: [
              {
                key,
                termDate,
                current,
                revoked: true
              }
            ]
          }
          publishMessageAndExpect(
            'KomgoMessagingPubKeyRevoked',
            ['bytes32', 'uint'],
            [node, index],
            expectedResult,
            komgoMetaResolverAddress,
            done
          )
        })
      })
    })

    describe('VaktMessagingPubKey events', () => {
      const key = '0x74d429b653748a5674d429b653748a5674d429b653748a5674d429b653748a56'
      const termDate = 123
      const current = true
      const revoked = false

      describe('VaktMessagingPubKeyAdded', () => {
        it('should update vaktMessagingPubKeys in the local database', async done => {
          const expectedResult = {
            vaktMessagingPubKeys: [
              {
                key,
                termDate,
                current,
                revoked
              }
            ]
          }

          publishMessageAndExpect(
            'VaktMessagingPubKeyAdded',
            ['bytes32', 'string', 'uint'],
            [node, key, termDate],
            expectedResult,
            komgoMetaResolverAddress,
            done
          )
        })
      })

      describe('VaktMessagingPubKeyRevoked', () => {
        it('should set vaktMessagingPubKey to revoked in the local database', async done => {
          const index = 0
          const expectedResult = {
            vaktMessagingPubKeys: [
              {
                key,
                termDate,
                current,
                revoked: true
              }
            ]
          }
          publishMessageAndExpect(
            'VaktMessagingPubKeyRevoked',
            ['bytes32', 'uint'],
            [node, index],
            expectedResult,
            komgoMetaResolverAddress,
            done
          )
        })
      })
    })
  })

  describe('ENSRegistry events', () => {
    describe('NewOwner', () => {
      it('should update owner field in the local database', async done => {
        const label = 'company1'
        const owner = '0x74d429b653748a56cb33531b26808b6d153670fe'
        const expectedResult = {
          owner: Web3.utils.toChecksumAddress(owner)
        }

        publishMessageAndExpect(
          'NewOwner',
          ['bytes32', 'bytes32', 'address'],
          [Web3.utils.fromAscii('meta.komgo'), Web3.utils.fromAscii(label), owner],
          expectedResult,
          ensRegistryAddress,
          done
        )
      })
    })

    describe('Transfer', () => {
      it('should update owner field in the local database', async done => {
        const owner = '0x74d429b653748a56cb33531b26808b6d153670fd'
        const expectedResult = {
          owner: Web3.utils.toChecksumAddress(owner)
        }

        publishMessageAndExpect(
          'Transfer',
          ['bytes32', 'address'],
          ['0x2fbf159040ff4d65cfd047b248e5263f3f75a65ef25d258b0c148bced94adbaa', owner],
          expectedResult,
          ensRegistryAddress,
          done
        )
      })
    })

    describe('NewResolver', () => {
      it('should update resolver field in the local database', async done => {
        const resolver = '0xac5ba877d56907fdcb96d01c92ee074fc13dc667'
        const expectedResult = {
          resolver: Web3.utils.toChecksumAddress(resolver)
        }

        publishMessageAndExpect(
          'NewResolver',
          ['bytes32', 'address'],
          ['0x2fbf159040ff4d65cfd047b248e5263f3f75a65ef25d258b0c148bced94adbaa', resolver],
          expectedResult,
          ensRegistryAddress,
          done
        )
      })
    })
  })

  describe('KomgoResolver events', () => {
    describe('AddrChanged', () => {
      it('should update address field in the local database', async done => {
        const address = '0x74d429b653748a56cb33531b26808b6d153670fc'
        const expectedResult = {
          address: Web3.utils.toChecksumAddress(address)
        }

        publishMessageAndExpect(
          'AddrChanged',
          ['bytes32', 'address'],
          [node, address],
          expectedResult,
          komgoResolverAddress,
          done
        )
      })
    })
    /*
    describe('ABIChanged', () => {
      it('should update abi field in the local database', async done => {
        const contentType = 1
        const data = '{}'
        const expectedResult = {
          abi: data
        }

        publishMessageAndExpect('ABIChanged',
          ['bytes32', 'uint256', 'bytes'],
          [node, contentType, Web3.utils.fromAscii(data)],
          expectedResult,
          komgoResolverAddress,
          done
        )
      })
    })
*/
  })
})

function publishTextChangedMessageAndExpect(fieldName: string, value: string, expectedResult: object, done: Function) {
  const eventObject = buildEventObject(
    ['bytes32', 'string', 'string'],
    [node, fieldName, value],
    'TextChanged',
    komgoMetaResolverAddress
  )
  messageClient.publish(`BLK.${events.TextChanged}`, eventObject)

  waitAndExpectDatabaseState(expectedResult, done)
}

function publishMessageAndExpect(
  eventName: string,
  paramTypes: string[],
  paramValues: any[],
  expectedResult: object,
  contractAddress,
  done: Function
) {
  const eventObject = buildEventObject(paramTypes, paramValues, eventName, contractAddress)
  messageClient.publish(`BLK.${events[eventName]}`, eventObject)

  waitAndExpectDatabaseState(expectedResult, done)
}

function buildEventObject(paramTypes: string[], paramValues: any[], eventName: string, contractAddress: string) {
  const encodedEventParams = Web3EthAbi.encodeParameters(paramTypes, paramValues)
  return {
    data: encodedEventParams,
    topics: [events[eventName]],
    blockNumber: blocknumber,
    transactionHash: exampleTxHash,
    contractAddress
  }
}

function waitAndExpectDatabaseState(expectedResult: object, done: Function) {
  let expectedFormatted
  try {
    expectedFormatted = JSON.stringify(expectedResult[Object.keys(expectedResult)[0]])
  } catch (e) {
    expectedFormatted = expectedResult[Object.keys(expectedResult)[0]].toString()
  }
  polling = createMongoPolling(expectedResult)
  polling.on('result', result => {
    if (result != undefined) {
      result = convertToString(result)
      expect(result).toEqual(expectedFormatted)
      done()
    }
  })
  polling.run()
}

function convertToString(value: any) {
  if (value === true || value === false) {
    return value.toString()
  } else {
    return JSON.stringify(value)
  }
}

function createMongoPolling(expected: object) {
  const startTime = Date.now()
  return new AsyncPolling(async end => {
    const members = await mongo.getMembers(JSON.stringify(expected))
    if (members[0]) {
      end(null, members[0][Object.keys(expected)[0]])
    } else if (Date.now() > startTime + timeout - timeout / 3) {
      throw new Error('Expected object not found in database.')
    }
    end()
  }, 500)
}

function buildEventsMappingForMessage(deployedContracts): any {
  const eventsAbi = loadAllEventsAbis(deployedContracts)
  const mapping = {}
  for (const ev of eventsAbi) {
    const sig = new Web3Wrapper().web3Instance.eth.abi.encodeEventSignature(ev)
    mapping[ev.name] = sig
  }
  return mapping
}

function loadAllEventsAbis(deployedContracts: any[]) {
  let contractEvents = []
  for (const contract of deployedContracts) {
    const eventsAbi = contract.abi.filter(ev => ev.type === 'event')
    contractEvents = contractEvents.concat(eventsAbi)
  }
  return contractEvents
}

function rebind(address: string) {
  iocContainer
    .rebind(TYPES.ContractArtifacts)
    .toConstantValue(
      new ContractArtifacts(
        address,
        iocContainer.get<string>('komgoresolver-domain'),
        iocContainer.get<string>('komgoregistrar-domain'),
        iocContainer.get<string>('komgometaresolver-domain'),
        iocContainer.get<Web3Wrapper>(TYPES.Web3Wrapper)
      )
    )
  iocContainer
    .rebind(TYPES.EventsProcessor)
    .toConstantValue(
      new EventsProcessor(
        iocContainer.get<Web3Wrapper>(TYPES.Web3Wrapper),
        iocContainer.get<IContractArtifacts>(TYPES.ContractArtifacts),
        iocContainer.get<IRegistryCacheDataAgent>(TYPES.RegistryCacheDataAgent),
        iocContainer.get<IRegistryEventProcessedDataAgent>(TYPES.RegistryEventProcessedDataAgent)
      )
    )
  iocContainer
    .rebind(TYPES.CacheEventService)
    .toConstantValue(
      new CacheEventService(
        iocContainer.get<MessagingFactory>(TYPES.MessagingFactory),
        iocContainer.get<string>('consumer-id'),
        iocContainer.get<string>('from-publisher-id'),
        iocContainer.get<number>('internal-mq-polling-interval-ms'),
        iocContainer.get<IEventsProcessor>(TYPES.EventsProcessor),
        iocContainer.get<IRegistryEventProcessedDataAgent>(TYPES.RegistryEventProcessedDataAgent),
        iocContainer.get<IPollingServiceFactory>(TYPES.PollingServiceFactory),
        iocContainer.get<Web3Wrapper>(TYPES.Web3Wrapper)
      )
    )
}
