import 'jest'
import 'reflect-metadata'

import CompanyKeyProvider from './CompanyKeyProvider'
import { IETHKeyData } from './models/IETHKeyData'
import createMockInstance from 'jest-create-mock-instance'
import { ETHKeyManager } from './ETHKeyManager'

describe('CompanyKeyProvider', () => {
  let provider: CompanyKeyProvider
  let ethEnvPassphraseSnaphost

  const ethKey: IETHKeyData = {
    address: 'a',
    privateKey: 'b',
    publicKey: 'c',
    publicKeyCompressed: 'cc'
  }

  const passphrase = 'test-passphrase'

  let ethKeyManager

  const executeOnAllManagers = fn => {
    ;[ethKeyManager].forEach(fn)
  }

  beforeEach(() => {
    ethKeyManager = createMockInstance(ETHKeyManager)
    provider = new CompanyKeyProvider(ethKeyManager)
    ethEnvPassphraseSnaphost = process.env.ETH_KEYSTORE_PASSPHRASE
    process.env.ETH_KEYSTORE_PASSPHRASE = 'passphrase'

    ethKeyManager.getActiveKeyData.mockImplementation(() => ethKey)
  })

  it('load keys', async () => {
    const key = await provider.getETHKey()
    expect(key).toEqual(ethKey)

    const publicKey = await provider.getETHKey('public')
    expect(publicKey.privateKey).toBeUndefined()

    executeOnAllManagers(m => expect(m.getActiveKeyData).toHaveBeenCalled())
  })

  it('reload keys', async () => {
    await provider.reloadETHKey(passphrase)
    executeOnAllManagers(m => expect(m.getActiveKeyData).toHaveBeenCalled())

    const key = await provider.getETHKey()
    expect(key).toEqual(ethKey)

    const publicKey = await provider.getETHKey('public')
    expect(publicKey.privateKey).toBeUndefined()
  })

  afterEach(() => {
    process.env.RSA_KEYSTORE_PASSPHRASE = ethEnvPassphraseSnaphost
  })
})
