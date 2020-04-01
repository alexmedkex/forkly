import SmartContract from './SmartContract'

jest.mock('truffle-contract', () => {
  return jest.fn().mockImplementation(() => mockedTruffle)
})

const documentHash = 'documentHash'

const mockedTruffleContract = {
  getDocumentHashAndOwner: jest.fn().mockResolvedValue(['', '', documentHash]),
  resolver: jest.fn().mockImplementation(() => resolverMock),
  addr: jest.fn().mockImplementation(() => '0x0')
}

const mockedTruffle = {
  deployed: jest.fn().mockResolvedValue(mockedTruffleContract),
  setProvider: jest.fn(),
  currentProvider: {
    sendAsync: ''
  }
}

const resolverMock = {
  deployed: jest.fn().mockImplementation(() => contractMock),
  setProvider: jest.fn(),
  addr: jest.fn(),
  currentProvider: {
    sendAsync: ''
  }
}

describe('SmartContract', () => {
  let smartContract
  beforeAll(() => {
    smartContract = new SmartContract()
    smartContract.web3 = {
      web3Instance: {
        eth: {
          net: {
            getId: jest.fn()
          }
        }
      }
    }
  })

  it('should run ensRegistry and return object with property getDocumentHashAndOwner', async () => {
    const result = await smartContract.ensRegistry()
    expect(result).toHaveProperty('getDocumentHashAndOwner')
  })

  it('should run komgoResolver and return object with property getDocumentHashAndOwner', async () => {
    const result = await smartContract.komgoResolver()
    expect(result).toHaveProperty('getDocumentHashAndOwner')
  })

  it('should run komgoMetaResolver and return object with property getDocumentHashAndOwner', async () => {
    const result = await smartContract.komgoMetaResolver()
    expect(result).toHaveProperty('getDocumentHashAndOwner')
  })

  it('should run instantiateContract and return object with property getDocumentHashAndOwner', async () => {
    const result = await smartContract.instantiateContract({ contractName: 'contractName' })
    expect(result).toHaveProperty('getDocumentHashAndOwner')
  })
})
