import 'reflect-metadata'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import BlockchainSignerClient from './BlockchainSignerClient'
import { IEthKeyResponse } from './IEthKeyResponse'

const mockKeyResponse: IEthKeyResponse = {
  address: 'string',
  publicKeyCompressed: 'string',
  publicKey: 'string'
}
const serviceUrl = 'http://url'
describe('BlockchainSignerClient', () => {
  let blockchainSignerClient: BlockchainSignerClient
  let axiosMock: MockAdapter

  beforeEach(() => {
    axiosMock = new MockAdapter(axios)
    blockchainSignerClient = new BlockchainSignerClient(serviceUrl)
  })

  it('should return key', async () => {
    axiosMock.onGet(`${serviceUrl}/v0/key-manage/eth/public-key`).reply(200, mockKeyResponse)
    let resp = await blockchainSignerClient.getEthKey()
    expect(resp).toEqual(mockKeyResponse)
  })
})
