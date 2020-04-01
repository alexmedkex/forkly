import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import 'jest'
import 'reflect-metadata'

import MagicLinkService, { ISessionResponse } from './MagicLinkService'

const apiSignerUrl = 'http://localhost:9002'
const magicLinkUrl = 'http://localhost:9001'
const HTTP_PROXY = 'https://fake-http-proxy:666'
const HTTPS_PROXY = 'https://fake-https-proxy:666'
const UNDEFINED_HTTP_PROXY = undefined
const UNDEFINED_HTTPS_PROXY = undefined

const axiosMock = new MockAdapter(axios)

function postReply(path, status, body, server: string = '') {
  axiosMock.onPost(`${server}${path}`).reply(status, JSON.stringify(body))
}

function patchReply(path, status, body, server: string = '') {
  axiosMock.onPatch(`${server}${path}`).reply(status, body)
}

function getReply(path, status, body, server: string = '') {
  axiosMock.onGet(`${server}${path}`).reply(status, body)
}

async function deactivateDocument(magicLinkService: MagicLinkService) {
  patchReply(`/v0/documents`, 200, 'ResponseBody')

  const signData = {
    staticId: 'staticId',
    jti: 'jti',
    hash: 'hash',
    deactivated: true
  }
  await magicLinkService.deactivateDocument(signData)

  expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ payload: JSON.stringify(signData) }))
  expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({ jws: 'test' }))
}

async function isDeactivated(magicLinkService: MagicLinkService) {
  getReply(`/v0/documents/hash?blockchainCheck=false`, 200, { deactivated: true })

  const result = await magicLinkService.isDeactivated('hash')

  expect(result).toEqual(true)
}

describe('MagicLinkService with proxy', () => {
  let magicLinkService: MagicLinkService

  beforeEach(function() {
    axiosMock.reset()
    magicLinkService = new MagicLinkService(magicLinkUrl, apiSignerUrl, HTTP_PROXY, HTTPS_PROXY)
    postReply('/v0/rsa-signer/sign', 200, { jws: 'test' }, apiSignerUrl)
  })

  it('deactivateDocument', async () => {
    await deactivateDocument(magicLinkService)
  })

  it('isDeactivated', async () => {
    await isDeactivated(magicLinkService)
  })
})

describe('MagicLinkService without proxy', () => {
  let magicLinkService: MagicLinkService

  beforeEach(function() {
    axiosMock.reset()
    magicLinkService = new MagicLinkService(magicLinkUrl, apiSignerUrl, UNDEFINED_HTTP_PROXY, UNDEFINED_HTTPS_PROXY)
    postReply('/v0/rsa-signer/sign', 200, { jws: 'test' }, apiSignerUrl)
  })

  it('deactivateDocument with no proxy', async () => {
    await deactivateDocument(magicLinkService)
  })
  it('isDeactivated with no proxy', async () => {
    await isDeactivated(magicLinkService)
  })
})
