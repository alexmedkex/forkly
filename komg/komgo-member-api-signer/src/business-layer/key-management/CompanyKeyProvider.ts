import 'reflect-metadata'

import { ErrorCode } from '@komgo/error-utilities'
import { IJSONPublicOrPrivateKey, IJWKObject } from '@komgo/jose'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { KeyPart } from '../../data-layer/constants/KeyPart'
import { KeyType } from '../../data-layer/constants/KeyType'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { RsaKeyManager } from './RsaKeyManager'

@injectable()
export default class CompanyKeyProvider {
  private readonly logger = getLogger('CompanyKeyProvider')

  private rsaKey: IJWKObject

  constructor(@inject(TYPES.RsaKeyManager) private readonly rsaKeyManager: RsaKeyManager) {}

  async reloadRSAKey(passphrase: string) {
    this.logger.info('Reloading RSA key')
    return this.initRSAKey(passphrase)
  }

  async getRSAKey(part?: KeyPart): Promise<IJWKObject | IJSONPublicOrPrivateKey> {
    await this.initializeIfNecessary()

    if (!this.rsaKey) {
      return this.rsaKey
    }

    if (!part) {
      return this.rsaKey
    }

    if (part === 'private') {
      return this.rsaKey.toJSON(true)
    }

    return this.rsaKey.toJSON()
  }

  private async initRSAKey(passphrase: string) {
    this.rsaKey = await this.initKeyData<IJWKObject>('RSA', passphrase, pass =>
      this.rsaKeyManager.getActiveKeyData(pass)
    )
  }

  private async initializeIfNecessary(): Promise<void> {
    if (this.rsaKey) {
      return
    }

    await this.initRSAKey(process.env.RSA_KEYSTORE_PASSPHRASE)
  }

  private async initKeyData<TKeyType>(
    keyType: KeyType,
    passphrase: string,
    loadKey: (passphrase: string) => Promise<TKeyType>
  ) {
    this.logger.info(`key: Loading`, {
      action: ACTIONS.INIT_KEY_DAT,
      keyType
    })
    if (!passphrase) {
      this.logger.info(`key: keystore passphrase isn't set, skipping key load`, {
        action: ACTIONS.INIT_KEY_DAT,
        keyType
      })
      return null
    }

    const key = await loadKey(passphrase)

    if (key) {
      this.logger.info(`key: Loaded`, {
        action: ACTIONS.INIT_KEY_DAT,
        keyType
      })
    } else {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.NoKeyData, `key: No key data`, {
        action: ACTIONS.INIT_KEY_DAT,
        keyType
      })
    }

    return key
  }
}
