import 'reflect-metadata'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import SignerClient from './SignerClient'
import { IJSONPublicKey } from '@komgo/jose'

const mockKeyResponse: IJSONPublicKey = {
  address: 'string',
  publicKeyCompressed: 'string',
  publicKey: 'string'
}
const serviceUrl = 'http://url'
describe('SignerClient', () => {
  let signerClient: SignerClient
  let axiosMock: MockAdapter

  beforeEach(() => {
    axiosMock = new MockAdapter(axios)
    signerClient = new SignerClient(serviceUrl)
  })

  it('should return key', async () => {
    axiosMock.onGet(`${serviceUrl}/v0/key-manage/rsa/public-key`).reply(200, mockKeyResponse)
    let resp = await signerClient.getRSAKey()
    expect(resp).toEqual(mockKeyResponse)
  })
})
