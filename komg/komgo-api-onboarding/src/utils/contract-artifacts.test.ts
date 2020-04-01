import 'jest'
import 'reflect-metadata'

function BN(num) {}

jest.mock('pako', () => {
  return { inflate: () => '{}' }
})

import { ContractArtifacts } from './contract-artifacts'

const contractMock = {
  contract: true,
  resolver: jest.fn().mockImplementation(() => resolverMock),
  methods: {
    resolver: jest.fn(() => ({ call: jest.fn() })),
    ABI: jest.fn(() => ({ call: jest.fn(() => [, '0x7b7d']) })),
    addr: jest.fn(() => ({ call: jest.fn() }))
  },
  ABI: jest.fn().mockImplementation(() => '[]'),
  addr: jest.fn().mockImplementation(() => '0x0')
}

const resolverMock = {
  ...contractMock,
  call: jest.fn(),
  deployed: jest.fn().mockImplementation(() => contractMock),
  setProvider: jest.fn(),
  currentProvider: {
    sendAsync: ''
  }
}

const web3mock = {
  eth: {
    Contract: jest.fn(),
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

describe('ContractArtifacts', () => {
  let contractArtifacts
  beforeAll(() => {
    contractArtifacts = new ContractArtifacts('ensaddress', web3mock)
  })
  beforeEach(() => {
    web3mock.eth.Contract.mockImplementation(() => contractMock)
  })

  it('ensRegistry', async () => {
    const result = await contractArtifacts.ensRegistry()
    expect(result.ABI).toBeTruthy()
  })

  it('komgoResolver', async () => {
    web3mock.eth.Contract.mockReturnValue(resolverMock)
    const result = await contractArtifacts.komgoResolver()
    expect(result.ABI).toBeTruthy()
  })

  it('komgoRegistrar', async () => {
    const result = await contractArtifacts.komgoRegistrar()
    expect(result.ABI).toBeTruthy()
  })

  it('resolverForNode', async () => {
    const result = await contractArtifacts.resolverForNode()
    expect(result.ABI).toBeTruthy()
  })

  it('resolverForNode if no ensContract', async () => {
    contractArtifacts.ensContract = undefined
    const result = await contractArtifacts.resolverForNode()
    expect(result.ABI).toBeTruthy()
  })

  it('komgoMetaResolver', async () => {
    const result = await contractArtifacts.komgoMetaResolver()
    expect(result.ABI).toBeTruthy()
  })

  it('komgoOnboarder', async () => {
    const result = await contractArtifacts.komgoOnboarder()
    expect(result.ABI).toBeTruthy()
  })

  it('findAddressAndAbi', async () => {
    contractArtifacts.ensContract = undefined
    const result = await contractArtifacts.findAddressAndAbi()
    expect(result).toBeTruthy()
  })
})
