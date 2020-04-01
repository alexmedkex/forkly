import 'reflect-metadata'

import { KeyManageController } from './KeyManageController'

const ethKeyManager = {
  createNewKeyAndSave: jest.fn(),
  getActiveKeyData: jest.fn()
}

const rsaKeyManager = {
  getRSAKey: jest.fn(),
  createNewKeyAndSave: jest.fn(),
  getActiveKeyData: jest.fn(),
  createKey: jest.fn(),
  saveAndReturnKey: jest.fn()
}

const keyProvider = {
  initialize: null,
  getRSAKey: jest.fn(),
  reloadRSAKey: jest.fn()
}

describe('KeyManageController', () => {
  let controller: KeyManageController

  beforeEach(() => {
    controller = new KeyManageController(keyProvider, rsaKeyManager)
  })

  describe('Generate RSA key', () => {
    it('generates key and load it', async () => {
      rsaKeyManager.createKey.mockImplementation(() => ({}))
      rsaKeyManager.saveAndReturnKey.mockImplementation(() => ({}))
      await controller.createRSAKey({ passphrase: 'passphrase', key: {} })
      expect(rsaKeyManager.createKey).toHaveBeenCalledWith({})
      expect(rsaKeyManager.saveAndReturnKey).toHaveBeenCalledWith({}, 'passphrase')
      expect(keyProvider.reloadRSAKey).toHaveBeenCalled()
    })

    it('raises error if no key', async () => {
      keyProvider.getRSAKey.mockImplementation(() => null)
      await expect(controller.getRSAPublicKey()).rejects.toMatchObject({ message: 'RSA key missing' })
      expect(keyProvider.getRSAKey).toHaveBeenCalled()
    })

    it('returns key', async () => {
      keyProvider.getRSAKey.mockImplementation(() => ({}))
      await expect(controller.getRSAPublicKey()).toBeDefined()
      expect(keyProvider.getRSAKey).toHaveBeenCalled()
    })

    it('should not overwrite keys if they already exist', async () => {
      keyProvider.getRSAKey.mockImplementation(async () => ({}))
      rsaKeyManager.createNewKeyAndSave.mockImplementation(() => ({}))

      await controller.createRSAKey()

      expect(keyProvider.reloadRSAKey).not.toHaveBeenCalled()
    })
  })
})
