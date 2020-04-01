import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import KeyDataAgent from '../../data-layer/data-agents/KeyDataAgent'
import { IKeyDocument } from '../../data-layer/models/key'
import IRsaKeyData from '../../infrastructure/vault/response/IRsaKeyData'
import VaultClient from '../../infrastructure/vault/VaultClient'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../middleware/common/Constants'

@injectable()
export default class KeyMigration {
  private readonly logger = getLogger('Migrations')

  constructor(
    @inject(TYPES.KeyDataAgent) private readonly keyDataAgent: KeyDataAgent,
    @inject(TYPES.VaultClient) private readonly vaultClient: VaultClient
  ) {}

  public async migrate(): Promise<void> {
    this.logger.info('Starting migration process for RSA keys')
    if (!this.vaultClient.isAvailable()) {
      this.logger.warn(ErrorCode.ConnectionVault, ErrorName.VaultIsNotAvailable)
      throw new Error('Vault is not available')
    }

    // get all keys from the database to be migrated and ensure they are sorted by validFrom
    const keysInMongo: IKeyDocument[] = await this.keyDataAgent.getAllKeys()
    if (keysInMongo.length === 0) {
      this.logger.info('DB has no RSA keys, nothing to migrate')
      return
    }
    this.logger.info(`Migrating ${keysInMongo.length} RSA keys to Vault`)
    keysInMongo.sort((a, b) => a.validFrom.getTime() - b.validFrom.getTime())

    // get all versions already migrated in vault
    const migratedKeys = await this.getMigratedKeys()

    // perform migration
    await this.migrateToVault(keysInMongo, migratedKeys)
  }

  public async migrateToVault(keysInMongo: IKeyDocument[], migratedKeys: string[]) {
    for (const rsaKey of keysInMongo) {
      const validFrom = rsaKey.validFrom.toISOString()
      const validTo = rsaKey.validTo ? rsaKey.validTo.toISOString() : 'now'
      const key: string = rsaKey.data
      const keyData: IRsaKeyData = {
        key,
        mongoMigration: {
          _id: rsaKey._id,
          validFrom: rsaKey.validFrom.getTime(),
          validTo: rsaKey.validTo ? rsaKey.validTo.getTime() : undefined
        }
      }
      this.logger.info(`handling key [${validFrom} to ${validTo}]: ${rsaKey._id}`)

      try {
        if (migratedKeys.includes(`${rsaKey._id}`)) {
          this.logger.info(`skipping key migration ${rsaKey._id}: already migrated`)
        } else {
          this.logger.info(`storing ${rsaKey._id} in vault`)
          await this.vaultClient.storeKeyData(keyData)
        }
        this.logger.info(`removing ${rsaKey._id} from mongo`)
        await this.keyDataAgent.deleteKey(rsaKey)
      } catch (error) {
        throw new Error(`Failed migrating key ${rsaKey._id}: ${error.message}`)
      }
    }
  }

  public async getMigratedKeys(): Promise<string[]> {
    const migratedKeys = []
    const currentVersion = await this.getCurrentVersion()
    // iterate through all existing versions in vault
    for (let version = 1; version <= currentVersion; version++) {
      this.logger.info(`Fetching versions ${version}`)
      try {
        const keyVersion = await this.vaultClient.readRawData(version)
        this.logger.info(`${JSON.stringify(keyVersion.data)}`)
        if (keyVersion && keyVersion.data && keyVersion.data.mongoMigration) {
          migratedKeys.push(keyVersion.data.mongoMigration._id)
        }
      } catch (error) {
        throw new Error(`Failed to read migrated version=${version}: ${error.message}`)
      }
    }
    this.logger.info(`already migrated: ${migratedKeys}`)
    return migratedKeys
  }

  private async getCurrentVersion(): Promise<number> {
    try {
      const currentKey = await this.vaultClient.readRawData()
      if (currentKey) {
        return currentKey.metadata.version
      } else {
        return 0
      }
    } catch (error) {
      // in case vault doesn't have any key, return 0 (no keys in vault)
      if (error.message.indexOf('status code 404') !== -1) {
        return 0
      } else {
        throw error
      }
    }
  }
}
