import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'reflect-metadata'

import { SmartContractProvider } from './SmartContractProvider'

const truffleContract = { contract: true }
jest.mock('truffle-contract', () => () => ({
  setProvider: jest.fn(),
  deployed: jest.fn(() => truffleContract),
  currentProvider: {}
}))
const web3Instance = {
  currentProvider: {
    send: jest.fn()
  },
  eth: {
    net: {
      getId: jest.fn(() => 'id')
    }
  }
}
const apiRegistryUrl = 'registryBaseUrl'
const nodeResponse = {
  address: '0xadd000',
  abi: JSON.stringify({ abi: 'abi' })
}
const documentsNode = '0x0000000000000000000000000000000000000000000000000000000000000000'
const axiosMock = new MockAdapter(axios)

describe('SmartContractProvider', () => {
  let smcProvider

  beforeEach(() => {
    smcProvider = new SmartContractProvider(apiRegistryUrl, web3Instance)
    getReply(
      apiRegistryUrl,
      `/v0/registry/cache?companyData=${encodeURIComponent(`{"node" : "${documentsNode}" }`)}`,
      200,
      [nodeResponse]
    )
  })

  it('should return truffleContract', async () => {
    const result = await smcProvider.getTruffleContract()
    expect(result).toEqual(truffleContract)
  })

  it('should call getId once', async () => {
    await smcProvider.getTruffleContract()
    await smcProvider.getTruffleContract()
    expect(web3Instance.eth.net.getId).toHaveBeenCalledTimes(1)
  })
})

function getReply(server, path, status, body) {
  axiosMock.onGet(`${server}${path}`).reply(status, JSON.stringify(body))
}
