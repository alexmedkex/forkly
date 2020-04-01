import MockAdapter from 'axios-mock-adapter'
import { createMockInstance } from 'jest-create-mock-instance'
import 'reflect-metadata'

import RateLimiter from '../../util/RateLimiter'
import { RequestIdHandler } from '../../util/RequestIdHandler'
import { BlockchainConnectionError, QuorumRequestError } from '../errors'

import { QuorumClient, JSON_RPC_VERSION, ETH_GET_QUORUM_PAYLOAD } from './QuorumClient'

const QUORUM_URL = `https://web3user:password@kldo.test.io`
const HTTPS_PROXY = 'https://fake-https-proxy:666'
const HTTP_PROXY = 'https://fake-http-proxy:666'
const timeout = 1234

describe('QuorumClient', () => {
  let client: QuorumClient
  let mockRequestIdHandler: jest.Mocked<RequestIdHandler>
  let mockRateLimiter: jest.Mocked<RateLimiter>
  let axiosMock: MockAdapter

  beforeEach(() => {
    mockRequestIdHandler = createMockInstance(RequestIdHandler)
    mockRateLimiter = createMockInstance(RateLimiter)
    mockRateLimiter.wrap.mockImplementation(fn => fn)

    client = new QuorumClient(QUORUM_URL, 1000, mockRequestIdHandler, HTTP_PROXY, HTTPS_PROXY, timeout, mockRateLimiter)
    axiosMock = new MockAdapter(client.axios)
  })

  describe('constructor', () => {
    it('should configure axios successfully', async () => {
      expect(mockRequestIdHandler.addToAxios).toHaveBeenCalled()
      expect(mockRateLimiter.wrap).toHaveBeenCalledWith(client.axios.post)
      expect(client.axios.defaults.timeout).toBe(timeout)
    })

    it('should set proxy agents on axios', () => {
      expect(client.axios.defaults.httpsAgent.proxy.protocol).toContain('https')
      expect(client.axios.defaults.httpsAgent.proxy.host).toContain('fake-https-proxy')
      expect(client.axios.defaults.httpsAgent.proxy.port).toBe(666)

      expect(client.axios.defaults.httpAgent.proxy.protocol).toContain('http')
      expect(client.axios.defaults.httpAgent.proxy.host).toContain('fake-http-proxy')
      expect(client.axios.defaults.httpAgent.proxy.port).toBe(666)
    })

    it('should set default agent if no proxy specified for each protocol', () => {
      client = new QuorumClient(QUORUM_URL, 1000, mockRequestIdHandler, '', '', timeout, mockRateLimiter)

      expect(client.axios.defaults.httpAgent.proxy).not.toBeDefined()
      expect(client.axios.defaults.httpsAgent.proxy).not.toBeDefined()
    })
  })

  describe('getTransactionData', () => {
    beforeEach(() => {
      axiosMock.reset()
    })

    it('should post to quorum for transaction data successfully', async () => {
      const bytecode = '0x60806012345'
      const expectedQuery = {
        jsonrpc: JSON_RPC_VERSION,
        method: ETH_GET_QUORUM_PAYLOAD,
        params: ['0x0'],
        id: expect.any(Number)
      }
      mockAxiosPostSuccess('', { result: bytecode })

      const txData = await client.getTransactionData('0x0')

      expect(txData).toStrictEqual(bytecode)
      expect(axiosMock.history.post.length).toBe(1)
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(expectedQuery)
      expect(axiosMock.history.post[0].url).toBe(QUORUM_URL)
    })

    it('should throw an error if no data is returned', async () => {
      mockAxiosPostSuccess('', null)

      await expect(client.getTransactionData('0x0')).rejects.toThrowError(QuorumRequestError)
    })

    it('should throw an error if connecting to the blockchain fails', async () => {
      mockAxiosPostError('')

      await expect(client.getTransactionData('0x0')).rejects.toThrowError(BlockchainConnectionError)
    })

    function mockAxiosPostSuccess(url: string, response: any) {
      return axiosMock.onPost(url).replyOnce(200, response)
    }

    function mockAxiosPostError(url: string) {
      return axiosMock.onPost(url).replyOnce(400)
    }
  })
})
