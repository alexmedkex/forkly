import 'reflect-metadata'

const contractMock = {
  contract: true,
  resolver: jest.fn().mockImplementation(() => resolverMock),
  ABI: jest.fn().mockImplementation(() => '[]'),
  addr: jest.fn().mockImplementation(() => '0x0')
}

const resolverMock = {
  deployed: jest.fn().mockImplementation(() => contractMock),
  setProvider: jest.fn(),
  currentProvider: {
    sendAsync: ''
  }
}

function BN(num) {}

const web3Mock = {
  eth: {
    net: {
      getId: jest.fn().mockImplementation(() => 1)
    },
    getAccounts: jest.fn().mockImplementation(() => ['0x0'])
  },
  utils: {
    toAscii: jest.fn().mockImplementation(() => '[]'),
    toBN: jest.fn().mockImplementation(() => 1),
    BN: BN
  }
}

jest.mock('truffle-contract', () => {
  return jest.fn().mockImplementation(() => resolverMock)
})

jest.mock('pako', () => {
  return { inflate: () => '' }
})

import ContractArtifacts from './ContractArtifacts'
import { Web3Wrapper } from '@komgo/blockchain-access'
import createMockInstance from 'jest-create-mock-instance'

describe('Smart contract artifacts', () => {
  let artifacts

  beforeEach(() => {
    const mockWeb3Wrapper = createMockInstance(Web3Wrapper)
    mockWeb3Wrapper.web3Instance = web3Mock
    artifacts = new ContractArtifacts(
      '0x123456',
      'komgoresolver.contract.komgo',
      'komgoregistrar.contract.komgo',
      'komgometaresolver.contract.komgo',
      mockWeb3Wrapper
    )
    artifacts.parseJsonFromFile = jest.fn().mockImplementation(() => {})
  })

  it('test ensRegistry', async () => {
    const ensContract = await artifacts.ensRegistry()
    expect(ensContract.contract).toBeTruthy()
  })

  it('test komgoResolver', async () => {
    await artifacts.ensRegistry()
    const resolverContract = await artifacts.komgoResolver()
    expect(resolverContract.contract).toBeTruthy()
  })

  it('test komgoRegistrar', async () => {
    await artifacts.ensRegistry()
    const registrarContract = await artifacts.komgoRegistrar()
    expect(registrarContract.contract).toBeTruthy()
  })

  it('test komgoMetaResolver', async () => {
    await artifacts.ensRegistry()
    const metaResolverContract = await artifacts.komgoMetaResolver()
    expect(metaResolverContract.contract).toBeTruthy()
  })

  it('test resolverForNode', async () => {
    await artifacts.ensRegistry()
    const resolver = await artifacts.resolverForNode()
    expect(resolver.contract).toBeTruthy()
  })
})
