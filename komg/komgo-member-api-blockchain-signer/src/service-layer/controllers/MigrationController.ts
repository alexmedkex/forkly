import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { Controller, Post, Route, Tags } from 'tsoa'

import KeyMigration from '../../business-layer/migration/KeyMigration'
import OneTimeSigner from '../../business-layer/one-time-key/OneTimeSigner'
import { MnemonicData } from '../../infrastructure/vault/response/MnemonicData'
import VaultClient from '../../infrastructure/vault/VaultClient'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../middleware/common/Constants'
import { VAULT_MNEMONIC_PATH } from '../request/one-time-signer'

@Tags('Migration')
@Route('migration')
@provideSingleton(MigrationController)
export class MigrationController extends Controller {
  private readonly logger = getLogger('MigrationController')

  /**
   *
   * @param oneTimeSigner
   * @param vaultClient
   */
  constructor(
    @inject(TYPES.OneTimeSigner) private readonly oneTimeSigner: OneTimeSigner,
    @inject(TYPES.VaultClient) private readonly vaultClient: VaultClient,
    @inject(TYPES.KeyMigration) private readonly keyMigration: KeyMigration
  ) {
    super()
  }

  /**
   *
   */
  @Post()
  public async migrate(): Promise<void> {
    await this.keyMigration.migrate()
    await this.migrateMnemonic()
  }

  /**
   *
   */
  private async migrateMnemonic(): Promise<void> {
    const mnemonicObj: MnemonicData = {
      mnemonic: this.oneTimeSigner.mnemonic,
      hash: this.oneTimeSigner.mnemonicHash()
    }

    try {
      await this.vaultClient.writeKVSecret(VAULT_MNEMONIC_PATH, mnemonicObj)
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionVault, ErrorName.VaultWriteKVFailed, 'failed to write mnemonic to vault', {
        VAULT_MNEMONIC_PATH
      })

      throw ErrorUtils.internalServerException(ErrorCode.ConnectionVault)
    }
  }
}
