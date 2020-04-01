import 'reflect-metadata'

jest.mock('../../retry', () => ({
  ...require.requireActual('../../retry'),
  exponentialDelay: (delay: number) => {
    return (retryNum: number) => {
      return 0
    }
  }
}))

import mockAxios from 'axios'

import { CounterpartyClient } from './CounterpartyClient'
import logger from '@komgo/logging'

let client: CounterpartyClient

describe('CounterpartyClient', () => {
  beforeAll(() => {
    client = new CounterpartyClient()
  })

  beforeEach(() => {
    mockAxios.post = jest.fn()
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('s defined', () => {
    expect(new CounterpartyClient()).toBeDefined()
  })

  describe('constructor', () => {
    it('builds a client with defaults', () => {
      expect(new CounterpartyClient()).toBeDefined()
    })

    it('builds a client with custom props', () => {
      const options = { baseURL: 'http://foo', otherParam: 'foo' }
      expect(new CounterpartyClient(options)).toBeDefined()
      expect(mockAxios.create).toBeCalledWith(options)
    })
  })

  describe('auto add', () => {
    it('auto add', async () => {
      await client.autoAdd(['company-1'])
      expect(mockAxios.post).toBeCalledWith(`/v0/counterparties/add/auto`, { companyIds: ['company-1'] })
    })

    it('log an error', async () => {
      mockAxios.post = jest.fn().mockImplementation(() => {
        throw new Error('some api error')
      })
      await client.autoAdd(['company-1'])
    })
  })
})
