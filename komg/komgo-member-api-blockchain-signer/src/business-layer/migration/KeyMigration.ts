import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import KeyDataAgent from '../../data-layer/data-agents/KeyDataAgent'
import { IKeyDocument } from '../../data-layer/models/key'
import IKeyData from '../../infrastructure/vault/response/IKeyData'
import VaultClient from '../../infrastructure/vault/VaultClient'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../middleware/common/Constants'
import IPrivateKey from '../key-management/models/IPrivateKey'

@injectable()
export default class KeyMigration {
  private readonly logger = getLogger('Migrations')

  constructor(
    @inject(TYPES.KeyDataAgent) private readonly keyDataAgent: KeyDataAgent,
    @inject(TYPES.VaultClient) private readonly vaultClient: VaultClient
  ) {}

  public async migrate(): Promise<void> {
    this.logger.info('Starting migration process for ETH keys')
    if (!this.vaultClient.isAvailable()) {
      this.logger.warn(ErrorCode.ConnectionVault, ErrorName.VaultIsNotAvailable)
      throw new Error('Vault is not available')
    }

    // get all keys from the database to be migrated and ensure they are sorted by validFrom
    const keysInMongo: IKeyDocument[] = await this.keyDataAgent.getAllKeys()
    if (keysInMongo.length === 0) {
      this.logger.info('DB has no ETH keys, nothing to migrate')
      return
    }
    this.logger.info(`Migrating ${keysInMongo.length} ETH keys to Vault`)
    keysInMongo.sort((a, b) => a.validFrom.getTime() - b.validFrom.getTime())

    // get all versions already migrated in vault
    const migratedKeys = await this.getMigratedKeys()

    // perform migration
    await this.migrateToVault(keysInMongo, migratedKeys)
  }

  public async migrateToVault(keysInMongo: IKeyDocument[], migratedKeys: string[]) {
    for (const ethKey of keysInMongo) {
      const validFrom = ethKey.validFrom.toISOString()
      const validTo = ethKey.validTo ? ethKey.validTo.toISOString() : 'now'
      const key: IPrivateKey = JSON.parse(ethKey.data)
      const keyData: IKeyData = {
        key,
        mongoMigration: {
          _id: ethKey._id,
          validFrom: ethKey.validFrom.getTime(),
          validTo: ethKey.validTo ? ethKey.validTo.getTime() : undefined
        }
      }
      this.logger.info(`handling key [${validFrom} to ${validTo}]: ${ethKey._id}`)

      try {
        if (migratedKeys.includes(`${ethKey._id}`)) {
          this.logger.info(`skipping key migration ${ethKey._id}: already migrated`)
        } else {
          this.logger.info(`storing ${ethKey._id} in vault`)
          await this.vaultClient.storeKeyData(keyData)
        }
        this.logger.info(`removing ${ethKey._id} from mongo`)
        await this.keyDataAgent.deleteKey(ethKey)
      } catch (error) {
        throw new Error(`Failed migrating key ${ethKey._id}: ${error.message}`)
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
