import 'reflect-metadata'

import { IJWKObject } from '@komgo/jose'

import CompanyKeyProvider from './CompanyKeyProvider'

describe('CompanyKeyProvider', () => {
  let provider: CompanyKeyProvider
  let rsaEnvPassphraseSnaphost

  let rsaKey: IJWKObject = {
    keystore: '',
    length: 1,
    kty: '2',
    kid: '3',
    use: '4',
    alg: '4',
    toJSON: jest.fn(() => ({
      kty: '1',
      kid: '2',
      e: '3',
      n: '4'
    }))
  }

  const passphrase = 'test-passphrase'

  let rsaKeyManager = {
    getActiveKeyData: jest.fn(() => rsaKey),
    generateNewKey: null
  }

  const executeOnAllManagers = fn => {
    ;[rsaKeyManager].forEach(fn)
  }

  beforeEach(() => {
    provider = new CompanyKeyProvider(rsaKeyManager)
    rsaEnvPassphraseSnaphost = process.env.RSA_KEYSTORE_PASSPHRASE
    process.env.RSA_KEYSTORE_PASSPHRASE = 'passphrase'

    rsaKeyManager.getActiveKeyData.mockImplementation(() => rsaKey)
  })

  it('if no key data, return no keys', async () => {
    executeOnAllManagers(m => m.getActiveKeyData.mockImplementation(() => null))

    expect(await provider.getRSAKey()).toBeNull()
    executeOnAllManagers(m => expect(m.getActiveKeyData).toHaveBeenCalled())
  })

  it('load keys', async () => {
    expect(await provider.getRSAKey()).toEqual(rsaKey)
    expect(await provider.getRSAKey('public')).toEqual(rsaKey.toJSON())

    executeOnAllManagers(m => expect(m.getActiveKeyData).toHaveBeenCalled())
  })

  it('reload keys', async () => {
    await provider.reloadRSAKey(passphrase)

    executeOnAllManagers(m => expect(m.getActiveKeyData).toHaveBeenCalled())

    expect(await provider.getRSAKey()).toEqual(rsaKey)
    expect(await provider.getRSAKey('public')).toEqual(rsaKey.toJSON())
  })

  afterEach(() => {
    process.env.ETH_KEYSTORE_PASSPHRASE = rsaEnvPassphraseSnaphost
  })
})
