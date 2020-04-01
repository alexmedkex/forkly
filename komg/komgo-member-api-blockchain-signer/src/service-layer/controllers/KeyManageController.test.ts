import 'jest'
import 'reflect-metadata'

import { KeyManageController } from './KeyManageController'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import { ETHKeyManager } from '../../business-layer/key-management/ETHKeyManager'
import createMockInstance from 'jest-create-mock-instance'

describe('KeyManageController', () => {
  let keyProvider
  let ethKeyManager

  let controller: KeyManageController

  beforeEach(() => {
    keyProvider = createMockInstance(CompanyKeyProvider)
    ethKeyManager = createMockInstance(ETHKeyManager)

    controller = new KeyManageController(keyProvider, ethKeyManager)
  })

  describe('Generate ETH key', () => {
    it('generates key and load it', async () => {
      ethKeyManager.createNewKeyAndSave.mockImplementation(() => ({}))
      await controller.createEthKey({ passphrase: 'passphrase', key: '0x...' })
      expect(ethKeyManager.createNewKeyAndSave).toHaveBeenCalledWith('passphrase', '0x...')
      expect(keyProvider.reloadETHKey).toHaveBeenCalled()
    })

    it('fails to generate key', async () => {
      ethKeyManager.createNewKeyAndSave.mockImplementation(() => ({}))
      keyProvider.reloadETHKey.mockImplementation(() => {
        throw new Error('failed')
      })
      expect(controller.createEthKey({ passphrase: 'passphrase', key: '0x...' })).rejects.toMatch('failed')
    })

    it('raises error if no key', async () => {
      keyProvider.getETHKey.mockImplementation(() => null)
      await expect(controller.getETHPublicKey()).rejects.toMatchObject({ message: 'ETH key missing' })
      expect(keyProvider.getETHKey).toHaveBeenCalled()
    })

    it('returns key', async () => {
      keyProvider.getETHKey.mockImplementation(() => ({}))
      await expect(controller.getETHPublicKey()).toBeDefined()
      expect(keyProvider.getETHKey).toHaveBeenCalled()
    })

    it('should not overwrite keys if they already exist', async () => {
      keyProvider.getETHKey.mockImplementation(async () => ({}))
      ethKeyManager.createNewKeyAndSave.mockImplementation(() => ({}))

      await controller.createEthKey()

      expect(keyProvider.reloadETHKey).not.toHaveBeenCalled()
    })
  })
})
