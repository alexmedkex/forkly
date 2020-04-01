import 'jest'
import * as fs from 'fs'
import 'reflect-metadata'

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn()
}))

import KeyInitializer from './KeyInitializer'

describe('KeyInitializer', () => {
  let keyInitializer
  let companyKeyProvider
  let ethKeyManager

  beforeEach(() => {
    process.env.ETH_KEYSTORE_PASSPHRASE = 'ETH_KEYSTORE_PASSPHRASE'
    companyKeyProvider = {
      initialize: jest.fn(),
      getETHKey: jest.fn(async () => 'ethPublicKey')
    }
    ethKeyManager = {
      createNewKeyAndSave: jest.fn()
    }

    keyInitializer = new KeyInitializer(companyKeyProvider, ethKeyManager)
  })

  afterAll(() => {
    jest.resetModules()
  })

  describe('import()', () => {
    it('calls ethKeyManager.createNewKeyAndSave()', async () => {
      await keyInitializer.import()

      expect(ethKeyManager.createNewKeyAndSave).toHaveBeenCalledWith('ETH_KEYSTORE_PASSPHRASE')
    })

    it('calls ethKeyManager.createNewKeyAndSave() with importedEthPrivKey', async () => {
      await keyInitializer.import('importedEthPrivKey')

      expect(ethKeyManager.createNewKeyAndSave).toHaveBeenCalledWith('ETH_KEYSTORE_PASSPHRASE', 'importedEthPrivKey')
    })
  })

  describe('writePublicKeysToFile()', () => {
    it('writes public keys to a file', async () => {
      const expectedJson = {
        ethPubKey: 'ethPublicKey'
      }
      await keyInitializer.writePublicKeysToFile('publicKeys.json')

      expect(fs.writeFileSync).toHaveBeenCalledWith('publicKeys.json', JSON.stringify(expectedJson, null, 2))
    })
  })
})
