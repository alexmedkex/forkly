import 'jest'
import { Web3Wrapper } from '@komgo/blockchain-access'
import 'reflect-metadata'

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
const getLoggerMock = jest.fn(() => loggerMock)
jest.mock('@komgo/logging', () => ({
  getLogger: getLoggerMock
}))

// tslint:disable-next-line:no-implicit-dependencies
import 'jest'

import EthCrypto from 'eth-crypto'

import { ETHKeyManager } from './ETHKeyManager'
import KeyCreationError from './exceptions/KeyCreationError'

describe('ETHKeyManager', () => {
  const web3 = new Web3Wrapper().web3Instance
  let manager: ETHKeyManager
  let keyDataAdapterMock
  let vaultClientMock

  const mockPrivateKey = '0x55a5098791a3aebf1e44cc377cbb2203a878c906f4741aae6eadd0768d8538c8'
  const mockKey = {
    version: 3,
    address: '4927873a99f5d0ec855e7a9943b34c3a84f2ab83',
    crypto: {
      ciphertext: '0e6caa5d6007fb970f75378a1bc81bb4f39eb8ae791ffb750b622bc6093f938e',
      cipherparams: {
        iv: 'adc41e08975382b3312f97ca313a0bdf'
      },
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      kdfparams: {
        dklen: 32,
        salt: 'c892029f09150c14c331b85f76231c65e53fff8d6d2ac3ad57ae8165724261a3',
        n: 8192,
        r: 8,
        p: 1
      },
      mac: 'dccd7978d6445cad9f54d70769b8a8b7ba93b96c71eec2bcf27d58e7f821aa56'
    }
  }

  beforeEach(() => {
    keyDataAdapterMock = {
      getActiveKey: jest.fn(),
      addNewKey: jest.fn()
    }

    vaultClientMock = {
      isAvailable: jest.fn(),
      storeEthKey: jest.fn(),
      readEthKey: jest.fn()
    }

    loggerMock.info.mockClear()
    loggerMock.warn.mockClear()
    loggerMock.error.mockClear()

    process.env.ETH_KEYSTORE_PASSPHRASE = 'env.passphrase'
    manager = new ETHKeyManager(keyDataAdapterMock, web3, vaultClientMock)
  })

  // it('fails if no passphrase and key data', async () => {
  //   await expect(manager.createNewKeyAndSave(null, null)).rejects.toEqual(
  //     new Error('Missing passphrase in order to generate key')
  //   )
  // })

  it('fails if invalid private key', async () => {
    await expect(manager.createNewKeyAndSave(null, mockPrivateKey + '0')).rejects.toEqual(
      new KeyCreationError('Invalid key data')
    )
  })

  it('generates new key with new default passphrase', async () => {
    await manager.createNewKeyAndSave('passphase')
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
  }, 10000)

  it('generates new key with new passphrase', async () => {
    await manager.createNewKeyAndSave('passphase')
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
    expect(loggerMock.info.mock.calls[0][0]).toBe('New ETH key generated')
    expect(loggerMock.info.mock.calls[1][0]).toBe('<<<< Passphrase for ETH key changed, replace in ENV >>>>')
  }, 10000)

  it('creates key from private key', async () => {
    await manager.createNewKeyAndSave('passphase', mockPrivateKey)
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
    expect(loggerMock.info.mock.calls[0][0]).toBe('New ETH key generated')
    expect(loggerMock.info.mock.calls[1][0]).toBe('<<<< Passphrase for ETH key changed, replace in ENV >>>>')

    const keyData = JSON.parse(keyDataAdapterMock.addNewKey.mock.calls[0][1])

    expect(keyData.address).toBe(
      EthCrypto.util.removeTrailing0x(
        EthCrypto.publicKey.toAddress(EthCrypto.publicKeyByPrivateKey(mockPrivateKey)).toLowerCase()
      )
    )
  })

  it('upload key uses env.passphrase if not specified', async () => {
    await manager.createNewKeyAndSave(null, mockPrivateKey)
    expect(keyDataAdapterMock.addNewKey).toHaveBeenCalled()
    expect(loggerMock.info.mock.calls[0][0]).toBe('New ETH key generated')
    expect(loggerMock.info.mock.calls[1][0]).toBe('<<<< Passphrase for ETH key changed, replace in ENV >>>>')

    const keyData = JSON.parse(keyDataAdapterMock.addNewKey.mock.calls[0][1])

    expect(web3.eth.accounts.decrypt(keyData, 'env.passphrase')).toBeDefined()
  })

  it('return no key', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => null)
    const key = await manager.getActiveKeyData('passphrase')

    expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
    expect(key).toBeNull()
  })

  it('return eth key', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => ({ data: JSON.stringify(mockKey) }))
    const key = await manager.getActiveKeyData('passphrase')

    expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
    expect(key).toEqual(key)
  })

  it('fails on invalid passpharse', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => ({ data: JSON.stringify(mockKey) }))
    try {
      await manager.getActiveKeyData('__invalid__')
    } catch (err) {
      expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
      expect(err.message).toBe('Error decrypting Key')
    }
  })

  it('fails on invalid data', async () => {
    keyDataAdapterMock.getActiveKey.mockImplementation(() => ({ data: { invalid: '' } }))
    try {
      await manager.getActiveKeyData('__invalid__')
    } catch (err) {
      expect(keyDataAdapterMock.getActiveKey).toHaveBeenCalled()
      expect(err.message).toBe('Error decrypting Key')
    }
  })
})
