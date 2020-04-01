import 'jest'
import 'reflect-metadata'

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import VaultClient from './VaultClient'
import { IJWKObject } from '@komgo/jose'

// test consts
const someUrl = 'http://some-url:8200'
const roleId = 'roleId'
const secretId = 'secretId'
const someApiVersion = 'v0'

// responses
const rsaKey: string =
  'eyJhbGciOiJQQkVTMi1IUzUxMitBMjU2S1ciLCJwMnMiOiJfYWhfMW9MMThnV3VoWUZZSEc1S0NBIiwicDJjIjo4MTkyLCJjdHkiOiJqd2stc2V0K2pzb24iLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiNUtJRnFwVWVxOEVkb2w5ZHJpeW9hWXhNbUxZaFRSblRwQUFHRGlRdFFRNCJ9.-VGZKY9Xv0aPwYQO3EOOpXlvRTXNrlqNf-uPCE35oKjA3mAQdO4qJg.1emIAmaIHQWrFSic.ITP2sUrEzIDdVnlu6gpj8JJWl2vj7Bx0afCmZXRVwiez5sMon47dCTqcuLjES8GgvGlNGPySQdp_2aKdzTSMhDiw8pRPhHUG-LrPzjLRp6rMEuD-xUfwOW3kznzJGdc-roZtZV10bLvTsRxTi51j4zih8FmVoXAVvSoODtoYX2ZmTre3ftE7gAdL6TSae5s1ySjpHKeBtQ6xyWBzx2zFERhIB25AtBkbTv8hNkNGcmFp-CVaoyQmPohAlFhmGJTnUNUqCrzYwr8Ks1RmurA-pLu2BGfgwyhu_Z1fZTUpHai08d_PKjBnErOUymfCUK2IwxIejR68vz9TNoJ2enu4c-t9iYk0z_SWbP7kfAZ2REed0OICqgNZpfmgG43gR8yG8N3TV9j1sKGvXAH2lPQoPGRARMRLH5hqzTatp7BmeTHqSMGAsTbQIWlYTFVczjFG6YBX-liy6zKXcyoQ9XFOuLfIpRhwP439DN-vKHBX1meXGIamBUnxsEuAhmsu-3S-cqnbAwrqtW-yA5ncDtiqBZPoGMLxFJXrnovPPd2rt9MPwV4JaXcXeXGxQAe9Uqy9HrsD6lB4EU9yWZ1T-2QGoAcjZgqGuTyRtuHLXYG2jVvWK36Cub-bJbjC5PuWH68z7Jk3RRGvRVhWdU_7ptTJKhpexZwGAWjgywEzCm3YF8xdMr-g2cKYnXYGDSAJ5nIhH767bmb9t6CaRmDoVPsB-6R38aHXmK_EZNVgi_tgT6EFWshnjmcwc9dcpbteZDlTA8TXhFEBxaqRy6TlmOr0K8Zkb15xfNs6S9-muiv8xImkYhSsjtMIF_ZfEwOMTfY--wvhu0svrhf05_7rmQnHQrddg5Be-znBLY1PwfCgDMeBlzJvX3CW_klVzzuigZyQYa0iaElYnbPleOTRe4-yzvNUO-7IlGTETxuDhL2Xk5ot9wyKhWfzkPTT5QJHM6KV8M3unT7j0NO_RSfFDE4CurbCHPRC-v4Ai9JQ4JEO97OV7LHhJJ9WLpMGOA1hP_-MgHh9E4xOSXfeBZo_wFKKvb3ixdCpZVmw6-Q-VREvlJdJNE-6YekBC3FGOcNQACLpJYpuL2L-vJRTmRByA5ly-IrdTp6c7X72vLkuSTdg4FCo8RANE08wP7DtgQ54N4g5RWrMFaDDpjEB9rwLfj0Sb3aGHc1Lg1tBGjGTB4uW7HjzlxT_ImYvtrUTJvt5Hb8biUwEdSCcUhUuncsu6dF-FMCuMza5RoZ0D8NaiDOSV_SiFc62K31j8gkveOg8X1A2lOnkROBqbCiMUA3LmFETGOUSWO4NwSv60JOc3-qf83GVwvOd7V6GtYWVLlL7Fq7TsclSOd178IpeFp_2BYe9tb3LlvwUdXmR8Gq3PpXxxHcXedcd5gXI2JUalY1viI0KEno7umgGOyk0FeUdq1jPlDB84bSyhlJUdKcAsZMJ9ALKczfm33pn92Rps1Hiv0x0DY9l9vuXSBKQplpJQyYn30SdlIzLXfSaUn_xrlYzisx5WAl4Sa6S325h55E6fZ_3pfxtd6qCkXM1KYJPCtvQawjIUSO-GJmnw_9MED5aLb73vd1zWK43vFU71hHBWOdCCUVdZI7yOudczSL-1splSG4JvLW3DcvXVCbiMhIS6pMJr17HKAB56_7EftFPFNMfrlgLKB-m5U3gKNuQw1BB_cVlC-DLmOvC8xPHL3EhAZJNxIfAFCsju0ZXrstllgvsvMUf0vvtf6jrawZ2vFjrlhkvtwBmb416CpAUxmx8P5i9BApXHqgoqCNeo5CfKWmYMmu_QqYGL6E7V1B-A8f-qrOivtWUrPUHOjm_gbop5yjslvvbav6WMAc4T3_bByqlS7bBJcZCu_3vDGCjDk_ZxEdO1K_bzU7STvqA648uBe-uSBnrGujgklQdukZuL81g5eLwlPdOiLT-uBLp46AUlD9QQ8Zxr1N0aejPyEwdv7vjEdG5Nzc2YIHj3pQd8xKq077CmHuFWW7cq1pdk0OFpIf2huY9UaIZDLglGyPv7CeqKEaM9vtx8B0O_drM3jFmV9xY4lEnU7gugt2joDO1qpBYP9JiPagO6-AOwr8j16W8kWBEvHVtO4BAJLPBTNTAoaiELEoqUH_GM5zbDVsIKlrntuIeoPVfIpH98JUkIOjgS0HWOCcpoyEzCTTThr2tRrExRQyL2fP7U5DLSkSQAqOIB_7pAUsBQGrwKgWK3j_4_Pc.-GmWyodBV10q63uRuUJeKg'
const jwtKeyObject = {
  kty: 'RSA',
  kid: '6PYNpJ-N4Dujxsz4vLJ0meEy9OTsJHQxiCDZForQORk',
  keystore: rsaKey,
  length: 4096,
  use: '',
  alg: 'rsa'
}

const axiosMock = new MockAdapter(axios)
axiosMock.onPost(someUrl + someApiVersion + '/secret/data/rsa-key').reply(200)
axiosMock.onPost(someUrl + someApiVersion + '/auth/approle/login').reply(200, { auth: { client_token: 'token' } })
axiosMock.onGet(someUrl + someApiVersion + '/secret/data/rsa-key').reply(200, { data: { data: { key: rsaKey } } })

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

  it('storeRsaKey hits vaults endpoint successfully ', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock.onPost(someUrl + '/' + someApiVersion + '/secret/data/rsa-key').replyOnce(200)

    await vaultClient.storeRsaKey(jwtKeyObject)
    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(2)

    // login
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ role_id: roleId, secret_id: secretId }))

    // key posting
    expect(axiosMock.history.post[1].data).toBe(JSON.stringify({ data: { key: jwtKeyObject } }))
  })

  it('storeRsaKey fails to write secret ', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock.onPost(someUrl + '/' + someApiVersion + '/secret/data/rsa-key').networkErrorOnce(500)

    await expect(vaultClient.storeRsaKey(jwtKeyObject)).rejects.toBeDefined()

    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(2)

    // login
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ role_id: roleId, secret_id: secretId }))

    // key posting
    expect(axiosMock.history.post[1].data).toBe(JSON.stringify({ data: { key: jwtKeyObject } }))
  })

  it('readRsaKey hits vaults endpoint successfully and returns data', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock
      .onGet(someUrl + '/' + someApiVersion + '/secret/data/rsa-key')
      .replyOnce(200, { data: { data: { key: rsaKey } } })

    const data = await vaultClient.readRsaKey()

    expect(data).toEqual(rsaKey)

    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
    expect(axiosMock.history.get.length).toBe(1)

    // login
    expect(axiosMock.history.post[0].data).toBe(JSON.stringify({ role_id: roleId, secret_id: secretId }))
  })

  it('readRsaKey fails to returns data', async () => {
    axiosMock
      .onPost(someUrl + '/' + someApiVersion + '/auth/approle/login')
      .replyOnce(200, { auth: { client_token: 'token' } })
    axiosMock.onGet(someUrl + '/' + someApiVersion + '/secret/data/rsa-key').networkErrorOnce(500)

    await expect(vaultClient.readRsaKey()).rejects.toBeDefined()

    // expect post in mock to be called
    expect(axiosMock.history.post.length).toBe(1)
    expect(axiosMock.history.get.length).toBe(1)
  })
})
