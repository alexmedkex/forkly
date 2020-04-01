import * as ServerMock from 'mock-http-server'
import 'reflect-metadata'

const mockedJWS = {
  staticId: 'test-static-id',
  merkle: 'test-mercle',
  metadataHash: 'test-hash',
  timestamp: 'test date',
  docId: 'test doc id'
}

const mockDecode = jest.fn(data => JSON.parse(data))
jest.mock('jsonwebtoken', () => ({
  decode: mockDecode
}))

import JWSAgent from './JWSAgent'

const registryBaseUrl = 'http://localhost:9003'
const apiSignerUrl = 'http://localhost:9002'

describe('JWSAgent', () => {
  const serverRegistry = new ServerMock({ host: 'localhost', port: 9003 })
  const serverSigner = new ServerMock({ host: 'localhost', port: 9002 })
  let jwsAgent: JWSAgent

  beforeEach(function(done) {
    serverRegistry.start(done)
    serverSigner.start(done)
    jwsAgent = new JWSAgent(registryBaseUrl, apiSignerUrl)
    reply(
      serverRegistry,
      'GET',
      '/v0/registry/cache',
      200,
      JSON.stringify([{ komgoMessagingPubKeys: [{ key: '{}' }] }])
    )
    reply(serverSigner, 'POST', '/v0/rsa-signer/verify', 200, '')
  })

  afterEach(function(done) {
    serverRegistry.stop(done)
    serverSigner.stop(done)
  })

  it('decode and verify', async () => {
    const result = await jwsAgent.decodeAndVerify(JSON.stringify(mockedJWS))
    expect(mockDecode).toHaveBeenCalled()
    expect(result).toEqual(mockedJWS)
  })

  function reply(server, method, path, status, body) {
    server.on({
      method,
      path,
      reply: {
        status,
        headers: { 'content-type': 'application/json' },
        body
      }
    })
  }
})
