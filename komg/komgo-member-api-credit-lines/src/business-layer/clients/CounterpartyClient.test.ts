import logger from '@komgo/logging'
import mockAxios from 'axios'
import 'reflect-metadata'

import { CounterpartyClient } from './CounterpartyClient'

jest.mock('../../retry', () => ({
  ...require.requireActual('../../retry'),
  exponentialDelay: (delay: number) => {
    return (retryNum: number) => {
      return 0
    }
  }
}))

let client: CounterpartyClient
const mockedResult = {
  data: [
    {
      guid: '1111',
      komgoMnid: '2222',
      vaktMnid: '3333',
      x500Name: '44444',
      address: '555666',
      text: undefined
    }
  ]
}

describe('CounterpartyClient', () => {
  beforeAll(() => {
    client = new CounterpartyClient('http://test')
  })

  beforeEach(() => {
    mockAxios.post = jest.fn()
    mockAxios.create = jest.fn()
    mockAxios.get = jest.fn().mockImplementation(() => mockedResult)
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  describe('constructor', () => {
    it('builds a client with defaults', () => {
      expect(new CounterpartyClient('http://test')).toBeDefined()
    })

    it('builds a client with custom props', () => {
      const options = { otherParam: 'foo' }
      expect(new CounterpartyClient('http://test', options)).toBeDefined()
      expect(mockAxios.create).toBeCalledWith({ otherParam: 'foo' })
    })
  })

  describe('.getCounterparties add', () => {
    it('return counterparties', async () => {
      const params = JSON.stringify({})
      await client.getCounterparties()
      expect(mockAxios.get).toBeCalledWith(`http://test/v0/counterparties?query=${params}`)
    })

    it('log an error', async () => {
      mockAxios.get = jest.fn().mockImplementation(() => {
        throw new Error('some api error')
      })
      await expect(client.getCounterparties(['company-1'])).rejects.toMatchObject(
        new Error(`Failed to get counterparty data. some api error`)
      )
    })
  })
})
