import 'jest'
import 'reflect-metadata'

import IPrivateKey from '../../business-layer/key-management/models/IPrivateKey'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import VaultClient from './VaultClient'

// test consts
const someUrl = 'http://some-url:8200'
const roleId = 'roleId'
const secretId = 'secretId'
const someApiVersion = 'v0'

// responses
const kvEthKeyStore: IPrivateKey = {
  address: '0xsomeAddress',
  crypto: {
    cipher: 'someCipher',
    ciphertext: 'someCipherText',
    cipherparams: {
      iv: 'ivString'
    },
    kdf: 'kdfString',
    kdfparams: {
      dklen: 0x1,
      n: 0x2,
      p: 0x3,
      r: 0x4,
      salt: 'salt'
    },
    mac: 'macString'
  },
  id: 'a',
  version: 2
}

const axiosMock = new MockAdapter(axios)
axiosMock.onPost(someUrl + '/' + someApiVersion + '/secret/data/eth-key').reply(200)
axiosMock.onPost(someUrl + '/' + someApiVersion + '/auth/approle/login').reply(200, { auth: { client_token: 'token' } })
axiosMock.onGet(someUrl + '/' + someApiVersion + '/secret/data/eth-key').reply(200, { data: { data: kvEthKeyStore } })

describe('VaultClient', () => {
  let vaultClient: VaultClient

  beforeEach(() => {
    axiosMock.reset()
    vaultClient = new VaultClient(someUrl, roleId, secretId, someApiVersion)
  })

  it('isAvailable returns true if url, role and secret are set correctly', () => {
    expect(vaultClient.isAvailable()).toBeTruthy()
  })

  it('isAvailable returns false if any params are missing', () => {
    vaultClient = new VaultClient(someUrl, undefined, undefined, someApiVersion)
    expect(vaultClient.isAvailable()).toBeFalsy()
  })

  it('attempt to get authentication token sucessfully', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })

    expect(await vaultClient.loginWithAuthToken()).toBe(true)
    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
  })

  it('network error attempting to get authentication token', async () => {
    axiosMock.onPost(someUrl + '/' + someApiVersion + '/auth/approle/login').networkErrorOnce(404)

    expect(await vaultClient.loginWithAuthToken()).toBe(false)
    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
  })

  it('invalid response attempting to get authentication token', async () => {
    axiosMock.onPost(someUrl + '/' + someApiVersion + '/auth/approle/login').replyOnce(200, undefined)

    expect(await vaultClient.loginWithAuthToken()).toBe(false)
    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
  })

  it('Already authenticated, dont retry', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })

    expect(await vaultClient.loginWithAuthToken()).toBe(true)
    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)

    axiosMock.reset()
    // RETRY
    expect(await vaultClient.loginWithAuthToken()).toBe(true)
    expect(axiosMock.history.post.length).toBe(0) //no need to call again
  })

  it('storeEthKey hits vaults endpoint successfully ', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock.onPost(someUrl + '/' + someApiVersion + '/secret/data/eth-key').replyOnce(200)

    await vaultClient.storeEthKey(kvEthKeyStore)
    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(2)

    // login
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ role_id: roleId, secret_id: secretId }))

    // key posting
    expect(axiosMock.history.post[1].data).toBe(JSON.stringify({ data: { key: kvEthKeyStore } }))
  })

  it('storeEthKey fails to write secret ', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock.onPost(someUrl + '/' + someApiVersion + '/secret/data/eth-key').networkErrorOnce(500)

    await expect(vaultClient.storeEthKey(kvEthKeyStore)).rejects.toBeDefined()

    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(2)

    // login
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ role_id: roleId, secret_id: secretId }))

    // key posting
    expect(axiosMock.history.post[1].data).toBe(JSON.stringify({ data: { key: kvEthKeyStore } }))
  })

  it('readEthKey hits vaults endpoint successfully and returns data', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock
      .onGet(someUrl + '/' + someApiVersion + '/secret/data/eth-key')
      .replyOnce(200, { data: { data: { key: kvEthKeyStore } } })

    const data = await vaultClient.readEthKey()

    expect(data).toEqual(kvEthKeyStore)

    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
    expect(axiosMock.history.get.length).toBe(1)

    // login
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ role_id: roleId, secret_id: secretId }))
  })

  it('readEthKey fails to returns data', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock.onGet(someUrl + '/' + someApiVersion + '/secret/data/eth-key').networkErrorOnce(500)

    await expect(vaultClient.readEthKey()).rejects.toBeDefined()

    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
    expect(axiosMock.history.get.length).toBe(1)
  })
})
