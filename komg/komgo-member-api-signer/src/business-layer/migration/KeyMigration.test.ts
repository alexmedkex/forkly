import 'jest'
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import KeyDataAgent from '../../data-layer/data-agents/KeyDataAgent'
import VaultClient from '../../infrastructure/vault/VaultClient'

import KeyMigration from './KeyMigration'

let mockTime = 0
const getMockedPrivateKey = (id: string): {} => {
  return 'RSA-key-mock'
}
const getMockedDatabaseKey = (id: string, validFrom: Date, validTo?: Date) => {
  return {
    _id: id,
    validFrom,
    validTo,
    data: getMockedPrivateKey(id)
  }
}
const getMockVaultKey = (id: string, version: number, validFrom: Date, validTo?: Date) => {
  return {
    data: {
      key: getMockedPrivateKey(id),
      mongoMigration: {
        _id: id,
        validFrom: validFrom.getTime(),
        validTo: validTo ? validTo.getTime() : undefined
      }
    },
    metadata: {
      created_time: new Date(mockTime++),
      destroyed: false,
      version
    }
  }
}

const getMockDataPair = (id: string, version: number, withValidTo = true) => {
  const validFrom = new Date(mockTime++)
  const validTo = withValidTo ? new Date(mockTime++) : undefined
  return {
    mockedDatabaseKey: getMockedDatabaseKey(id, validFrom, validTo),
    mockedVaultKey: getMockVaultKey(id, version, validFrom, validTo)
  }
}

// populate mock data
const MOCKED_DATA_LEN = 5
const MOCKED_DATABASE_KEYS = []
const MOCKED_VAULT_KEYS = []
for (let version = 1; version <= MOCKED_DATA_LEN; version++) {
  const withValidTo = version === MOCKED_DATA_LEN ? false : true
  const { mockedDatabaseKey, mockedVaultKey } = getMockDataPair(`mockId_${version}`, version, withValidTo)
  MOCKED_DATABASE_KEYS.push(mockedDatabaseKey)
  MOCKED_VAULT_KEYS.push(mockedVaultKey)
}
const LASTEST_VAULT_KEY = MOCKED_VAULT_KEYS[MOCKED_VAULT_KEYS.length - 1]

describe('KeyMigrations', () => {
  let keyMigration: KeyMigration
  let keyDataAdapterMock
  let vaultClientMock

  beforeEach(() => {
    // database mock
    keyDataAdapterMock = createMockInstance(KeyDataAgent)

    // vault mock
    vaultClientMock = createMockInstance(VaultClient)
    vaultClientMock.isAvailable.mockImplementation(() => true)

    // test subject
    keyMigration = new KeyMigration(keyDataAdapterMock, vaultClientMock)
  })

  it('should throw exception when vault is not available', async () => {
    vaultClientMock.isAvailable.mockImplementation(() => false)

    await expect(keyMigration.migrate()).rejects.toThrow('Vault is not available')
    expect(vaultClientMock.isAvailable).toBeCalledTimes(1)
    expect(keyDataAdapterMock.getAllKeys).toBeCalledTimes(0)
    expect(vaultClientMock.readRawData).toBeCalledTimes(0)
    expect(vaultClientMock.storeKeyData).toBeCalledTimes(0)
    expect(keyDataAdapterMock.deleteKey).toBeCalledTimes(0)
  })

  it('should not perform migration if there are no keys in database', async () => {
    keyDataAdapterMock.getAllKeys.mockResolvedValueOnce([])

    await keyMigration.migrate()
    expect(vaultClientMock.isAvailable).toBeCalledTimes(1)
    expect(keyDataAdapterMock.getAllKeys).toBeCalledTimes(1)
    expect(vaultClientMock.readRawData).toBeCalledTimes(0)
    expect(vaultClientMock.storeKeyData).toBeCalledTimes(0)
    expect(keyDataAdapterMock.deleteKey).toBeCalledTimes(0)
  })

  it('should migrate keys to vault and delete them from database', async () => {
    keyDataAdapterMock.getAllKeys.mockResolvedValueOnce(MOCKED_DATABASE_KEYS)

    // mock `getMigratedKeys()`
    // first call will be to determine `currentVersion` variable
    // given we're passing undefined, currentVersion = 0
    vaultClientMock.readRawData.mockResolvedValueOnce(undefined)

    await keyMigration.migrate()
    expect(vaultClientMock.storeKeyData).toBeCalledTimes(MOCKED_VAULT_KEYS.length)
    await MOCKED_VAULT_KEYS.forEach(key => expect(vaultClientMock.storeKeyData).toBeCalledWith(key.data))
    expect(keyDataAdapterMock.deleteKey).toBeCalledTimes(MOCKED_DATABASE_KEYS.length)
    await MOCKED_DATABASE_KEYS.forEach(key => expect(keyDataAdapterMock.deleteKey).toBeCalledWith(key))
  })

  it('should not migrate keys to vault if keys already exist in vault (but ensure keys are deleted from database)', async () => {
    keyDataAdapterMock.getAllKeys.mockResolvedValueOnce(MOCKED_DATABASE_KEYS)

    // mock `getMigratedKeys()`
    // first call will be to determine `currentVersion` variable
    vaultClientMock.readRawData.mockResolvedValueOnce(LASTEST_VAULT_KEY)
    // following calls will be to retrieve actual versions
    for (const mockedVaultKey of MOCKED_VAULT_KEYS) {
      vaultClientMock.readRawData.mockResolvedValueOnce(mockedVaultKey)
    }

    await keyMigration.migrate()
    // since all keys are in vault, we expect NOT to store any key
    expect(vaultClientMock.storeKeyData).toBeCalledTimes(0)
    // ensure all keys are removed from the database as they are already in vault
    expect(keyDataAdapterMock.deleteKey).toBeCalledTimes(MOCKED_DATABASE_KEYS.length)
    await MOCKED_DATABASE_KEYS.forEach(key => expect(keyDataAdapterMock.deleteKey).toBeCalledWith(key))
  })

  it('should fail if storing key in vault fails', async () => {
    keyDataAdapterMock.getAllKeys.mockResolvedValueOnce(MOCKED_DATABASE_KEYS)

    // mock `getMigratedKeys()`
    // first call will be to determine `currentVersion` variable
    vaultClientMock.readRawData.mockResolvedValueOnce(undefined)

    // simulate failure
    vaultClientMock.storeKeyData.mockRejectedValue(new Error('Vault Failure'))

    await expect(keyMigration.migrate()).rejects.toThrow('Failed migrating key mockId_1: Vault Failure')
    expect(vaultClientMock.storeKeyData).toBeCalledTimes(1)
    expect(vaultClientMock.storeKeyData).toBeCalledWith(MOCKED_VAULT_KEYS[0].data)
    expect(keyDataAdapterMock.deleteKey).toBeCalledTimes(0)
  })

  it('should fail if deleting key in database fails', async () => {
    keyDataAdapterMock.getAllKeys.mockResolvedValueOnce(MOCKED_DATABASE_KEYS)

    // mock `getMigratedKeys()`
    // first call will be to determine `currentVersion` variable
    vaultClientMock.readRawData.mockResolvedValueOnce(undefined)

    // simulate failure
    keyDataAdapterMock.deleteKey.mockRejectedValue(new Error('Database Failure'))

    await expect(keyMigration.migrate()).rejects.toThrow('Failed migrating key mockId_1: Database Failure')
    expect(vaultClientMock.storeKeyData).toBeCalledTimes(1)
    expect(vaultClientMock.storeKeyData).toBeCalledWith(MOCKED_VAULT_KEYS[0].data)
    expect(keyDataAdapterMock.deleteKey).toBeCalledTimes(1)
    expect(keyDataAdapterMock.deleteKey).toBeCalledWith(MOCKED_DATABASE_KEYS[0])
  })
})
