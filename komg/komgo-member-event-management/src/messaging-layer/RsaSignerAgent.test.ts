import 'reflect-metadata'

import * as moxios from 'moxios'
import { createMockInstance } from 'jest-create-mock-instance'

import RsaSignerAgent from './RsaSignerAgent'
import { IJSONPublicKey } from './types'
import { RequestIdHandler } from '../util/RequestIdHandler'

const BASE_URL = 'http://host:1234'
const MAX_CONTENT_LENGTH = 1000000
const REQUEST_TIMEOUT = 1000000

let mockRequestIdHandler: jest.Mocked<RequestIdHandler>

describe('RSA Signer agent', () => {
  let agent: RsaSignerAgent

  const payload = 'data'
  const publicKey: IJSONPublicKey = {
    e: 'e',
    kid: 'kid',
    kty: 'kty',
    n: 'n'
  }

  const encryptedResponse = { jwe: 'jwe encrypted' }

  beforeEach(() => {
    moxios.install()
    mockRequestIdHandler = createMockInstance(RequestIdHandler)
    agent = new RsaSignerAgent(BASE_URL, MAX_CONTENT_LENGTH, REQUEST_TIMEOUT, mockRequestIdHandler)
  })

  afterEach(function() {
    moxios.uninstall()
  })

  it('should encrypt message', async done => {
    moxios.stubRequest(`${BASE_URL}/v0/rsa-signer/encrypt`, {
      status: 200,
      response: encryptedResponse
    })

    const resultPromise = agent.encrypt(payload, publicKey)

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual(encryptedResponse)
      done()
    })
  })

  it('should decrypt message', async done => {
    moxios.stubRequest(`${BASE_URL}/v0/rsa-signer/decrypt`, {
      status: 200,
      response: payload
    })

    const resultPromise = agent.decrypt({ message: payload })

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual(payload)
      done()
    })
  })

  it('should sign message', async done => {
    moxios.stubRequest(`${BASE_URL}/v0/rsa-signer/sign`, {
      status: 200,
      response: payload
    })

    const resultPromise = agent.sign({ data: payload })

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual(payload)
      done()
    })
  })

  it('should verify message', async done => {
    moxios.stubRequest(`${BASE_URL}/v0/rsa-signer/verify`, {
      status: 200,
      response: payload
    })

    const resultPromise = agent.verify(payload, publicKey)

    moxios.wait(async () => {
      const result = await resultPromise
      expect(result).toEqual(payload)
      done()
    })
  })
})
