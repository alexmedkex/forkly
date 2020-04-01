import 'reflect-metadata'
const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')

const mock = new MockAdapter(axios)

import SignerClient from './SignerClient'
import { MicroserviceConnectionException } from '../../exceptions'
let signerClient: SignerClient

describe('SignerClient', async () => {
  beforeEach(() => {
    mock.reset()
    signerClient = new SignerClient('http://test')
  })

  describe('postTransaction', async () => {
    it('should post a transaction to the Blockchain', async () => {
      mock
        .onPost()
        .reply(200, 'test')
        .onAny()
        .passThrough()

      const result = await signerClient.postTransaction('data')
      expect(result.data).toEqual('test')
    })

    it('should throw if axios call fails', async () => {
      mock.onPost().networkError()
      await expect(signerClient.postTransaction('data')).rejects.toBeInstanceOf(MicroserviceConnectionException)
    })

    describe('getKey', async () => {
      it('should return a key', async () => {
        mock
          .onGet()
          .reply(200, 'test')
          .onAny()
          .passThrough()

        const result = await signerClient.getKey()
        expect(result.data).toEqual('test')
      })

      it('should throw if axios call fails', async () => {
        mock.onGet().networkError()
        await expect(signerClient.getKey()).rejects.toBeInstanceOf(MicroserviceConnectionException)
      })

      describe('sign', async () => {
        it('should sign a transaction', async () => {
          mock
            .onPost()
            .reply(200, 'test')
            .onAny()
            .passThrough()

          const result = await signerClient.sign('data')
          expect(result.data).toEqual('test')
        })
        it('should throw if axios call fails', async () => {
          mock.onGet().networkError()
          await expect(signerClient.sign('data')).rejects.toBeInstanceOf(MicroserviceConnectionException)
        })
      })
    })
  })
})
