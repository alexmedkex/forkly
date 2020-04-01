import 'reflect-metadata'

import { NewEthPubKey } from '../models/NewEthPubKey'
import { TransactionData } from '../models/TransactionData'
import { IContractArtifacts } from '../smart-contracts/IContractArtifacts'

import EthPubKeyAgent from './EthPubKeyAgent'
import { EthPubKey } from '../models/EthPubKey'
import { generateHttpException } from '../../service-layer/ErrorHandling'

const RESOLVER_ADDRESS = '0x000'
const RESOLVER_ADD_KEY_DATA = '0x001'
const RESOLVER_REVOKE_KEY_DATA = '0x002'
const CONTRACT_ADDRESS = '0x123456'
const genericError = new Error('Error: something went wrong')

const returnResolverFunction: MockInstance = jest.fn(async () => {
  return RESOLVER_ADDRESS
})

const returnAddKeyData: MockInstance = jest.fn(async () => {
  return RESOLVER_ADD_KEY_DATA
})

const returnRevokeKeyData: MockInstance = jest.fn(async () => {
  return RESOLVER_REVOKE_KEY_DATA
})

const returnDeployedEnsRegistry: MockInstance = jest.fn(async () => {
  return mockEnsRegistryInstance
})

const returnKomgoResolverAtAddress: MockInstance = jest.fn(async () => {
  return mockKomgoResolverInstance
})

const mockEnsRegistryInstance = {
  resolver: returnResolverFunction
}

const mockKomgoResolverInstance = {
  address: CONTRACT_ADDRESS,
  contract: {
    addEthereumPublicKey: {
      getData: returnAddKeyData
    },
    revokeEthereumPublicKey: {
      getData: returnRevokeKeyData
    }
  },
  currentEthereumPublicKey: jest.fn(() => ['123456', '123456', 123456, 123454, 0])
}

const mockContractArtifacts: IContractArtifacts = {
  ensRegistry: jest.fn(),
  resolverForNode: jest.fn().mockImplementation(() => mockKomgoResolverInstance)
}

describe('Getting payload data', () => {
  let ethPubKeyAgent
  let newEthPubKey

  beforeEach(() => {
    ethPubKeyAgent = new EthPubKeyAgent(mockContractArtifacts)
    newEthPubKey = new NewEthPubKey('low', 'high', 100)
  })

  it('should successfully add ethereum public key', async () => {
    const data = await ethPubKeyAgent.getAddEthPubKeyTxData('com.komgo', newEthPubKey)

    expect(data).toEqual(new TransactionData(CONTRACT_ADDRESS, RESOLVER_ADD_KEY_DATA))
  })

  it('should successfully revoke ethereum public key', async () => {
    const data = await ethPubKeyAgent.getRevokeEthPubKeyTxData('com.komgo', newEthPubKey)

    expect(data).toEqual(new TransactionData(CONTRACT_ADDRESS, RESOLVER_REVOKE_KEY_DATA))
  })

  it('should successfully provide a ethereum public key', async () => {
    const data = await ethPubKeyAgent.getEthPubKey('com.komgo', 1)
    expect(data).toEqual(new EthPubKey('123456', '123456', 123456, 123454, 0))
  })

  it('should fail to add ethereum public key if getData fails', async () => {
    returnAddKeyData.mockReturnValue(Promise.reject(genericError))

    const asyncData = ethPubKeyAgent.getAddEthPubKeyTxData('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toBeDefined()
  })

  it('should fail to add revoke key if getData fails', async () => {
    returnRevokeKeyData.mockReturnValue(Promise.reject(genericError))

    const asyncData = ethPubKeyAgent.getRevokeEthPubKeyTxData('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toBeDefined()
  })

  it('should fail if is unable to load deployed ENS Registry', async () => {
    returnDeployedEnsRegistry.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyAgent.getAddEthPubKeyTxData('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toBeDefined()
  })

  it('should fail if the Resolver address is invalid', async () => {
    returnKomgoResolverAtAddress.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyAgent.getAddEthPubKeyTxData('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toBeDefined()
  })

  it('should fail if the company ENS doesnt have a resolver', async () => {
    returnResolverFunction.mockImplementation(() => {
      throw genericError
    })

    const asyncData = ethPubKeyAgent.getAddEthPubKeyTxData('com.komgo', newEthPubKey)

    await expect(asyncData).rejects.toBeDefined()
  })
})
