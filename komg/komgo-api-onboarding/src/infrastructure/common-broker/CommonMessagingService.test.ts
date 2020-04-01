import 'reflect-metadata'
import * as moxios from 'moxios'

import CommonMessagingService from './CommonMessagingService'

const BASE_URL = 'http://host:1234/'
const USERNAME = 'username'
const PASSWORD = 'pass'
const CONTENT_LENGTH = 1000
const REQUEST_TIMEOUT = 1000

const post = jest.fn()

describe('Common Messaging', () => {
  let service: CommonMessagingService

  beforeEach(() => {
    moxios.install()
    service = new CommonMessagingService(BASE_URL, USERNAME, PASSWORD, CONTENT_LENGTH, REQUEST_TIMEOUT)
  })

  afterEach(function() {
    moxios.uninstall()
  })

  it('should return vhosts', async done => {
    moxios.stubRequest(`${BASE_URL}/api/vhosts`, {
      status: 200,
      response: [{ name: '/' }]
    })
    const resultPromise = service.getVhosts()
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result[0].name).toBe('/')
      done()
    })
  })

  it('should create user', async done => {
    moxios.stubRequest(`${BASE_URL}/api/users/userId`, {
      status: 201,
      statusText: 'Created'
    })
    const resultPromise = service.assertUser('userId', 'password')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.status).toEqual(201)
      expect(result.statusText).toEqual('Created')
      done()
    })
  })

  it('should create exchange', async done => {
    moxios.stubRequest(`${BASE_URL}/api/exchanges/%2F/exchangeId`, {
      status: 201,
      statusText: 'Created'
    })
    const resultPromise = service.assertExchange('exchangeId', 'type')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.status).toEqual(201)
      expect(result.statusText).toEqual('Created')
      done()
    })
  })

  it('should create queue', async done => {
    moxios.stubRequest(`${BASE_URL}/api/queues/%2F/queuesId`, {
      status: 201,
      statusText: 'Created'
    })
    const resultPromise = service.assertQueue('queuesId')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.status).toEqual(201)
      expect(result.statusText).toEqual('Created')
      done()
    })
  })

  it('should create binding exchange to queue', async done => {
    moxios.stubRequest(`${BASE_URL}/api/bindings/%2F/e/fromExchange/q/toQueue`, {
      status: 201,
      statusText: 'Created'
    })
    const resultPromise = service.assertBinding('fromExchange', 'toQueue')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.status).toEqual(201)
      expect(result.statusText).toEqual('Created')
      done()
    })
  })

  it('should create policy', async done => {
    moxios.stubRequest(`${BASE_URL}/api/policies/%2F/policyName`, {
      status: 201,
      statusText: 'Created'
    })
    const resultPromise = service.assertPolicy('policyName')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.status).toEqual(201)
      expect(result.statusText).toEqual('Created')
      done()
    })
  })

  it('should create permission', async done => {
    moxios.stubRequest(`${BASE_URL}/api/permissions/%2F/userId`, {
      status: 201,
      statusText: 'Created'
    })
    const resultPromise = service.assertPermission('userId')
    moxios.wait(async () => {
      const result = await resultPromise
      expect(result.status).toEqual(201)
      expect(result.statusText).toEqual('Created')
      done()
    })
  })

  it('should configure Common MQ', async () => {
    service.axios = { put: jest.fn(), post }
    await service.configure('id', 'user', 'password')
    expect(post).toHaveBeenCalled()
  })
})
