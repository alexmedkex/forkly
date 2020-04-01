import 'jest'
import * as fs from 'fs'
import 'reflect-metadata'

const mockWriteFileSync = jest.fn()

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: mockWriteFileSync
}))

import KeyInitializer from './KeyInitializer'

describe('KeyInitializer', () => {
  let keyInitializer
  let companyKeyProvider
  let rsaKeyManager

  beforeEach(() => {
    process.env.RSA_KEYSTORE_PASSPHRASE = 'RSA_KEYSTORE_PASSPHRASE'
    companyKeyProvider = {
      initialize: jest.fn(),
      getRSAKey: jest.fn(async () => 'rsaPublicKey')
    }
    rsaKeyManager = {
      createNewKeyAndSave: jest.fn()
    }

    keyInitializer = new KeyInitializer(companyKeyProvider, rsaKeyManager)
  })

  describe('import()', () => {
    it('calls rsaKeyManager.createNewKeyAndSave()', async () => {
      await keyInitializer.import()

      expect(rsaKeyManager.createNewKeyAndSave).toHaveBeenCalledWith('RSA_KEYSTORE_PASSPHRASE')
    })
    it('calls rsaKeyManager.createNewKeyAndSave() with importedRsaPrivKey', async () => {
      await keyInitializer.import('importedRsaPrivKey')

      expect(rsaKeyManager.createNewKeyAndSave).toHaveBeenCalledWith('RSA_KEYSTORE_PASSPHRASE', 'importedRsaPrivKey')
    })
  })

  describe('writePublicKeysToFile()', () => {
    it('writes public keys to a file', async () => {
      const expectedJson = {
        komgoMessagingPubKey: 'rsaPublicKey'
      }
      await keyInitializer.writePublicKeysToFile('publicKeys.json')

      expect(mockWriteFileSync).toHaveBeenCalledWith('publicKeys.json', JSON.stringify(expectedJson, null, 2))
    })
  })
})
