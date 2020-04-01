import 'reflect-metadata'

import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import _ from 'lodash'

import { KeyPart } from '../../data-layer/constants/KeyPart'
import { KeyType } from '../../data-layer/constants/KeyType'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'

import { ETHKeyManager } from './ETHKeyManager'
import { IETHKeyData } from './models/IETHKeyData'

@injectable()
export default class CompanyKeyProvider {
  private readonly logger = getLogger('CompanyKeyProvider')

  private ethKey: IETHKeyData

  constructor(@inject(TYPES.ETHKeyManager) private readonly ethKeyManager: ETHKeyManager) {}

  async reloadETHKey(passphrase: string) {
    return this.initETHKey(passphrase)
  }

  async getETHKey(part?: KeyPart): Promise<IETHKeyData> {
    await this.initializeIfNecessary()

    if (!this.ethKey) {
      return Promise.resolve(this.ethKey)
    }

    if (!part) {
      return Promise.resolve(this.ethKey)
    }

    const parts = {
      public: ['publicKey', 'publicKeyCompressed', 'address'],
      private: ['privateKey']
    }

    return Promise.resolve(_.pick(this.ethKey, parts[part]))
  }

  private async initETHKey(passphrase: string) {
    this.ethKey = await this.initKeyData<IETHKeyData>('ETH', passphrase, pass =>
      this.ethKeyManager.getActiveKeyData(pass)
    )
  }

  private async initializeIfNecessary() {
    if (this.ethKey) {
      return
    }

    await this.initETHKey(process.env.ETH_KEYSTORE_PASSPHRASE)
  }

  private async initKeyData<TKeyType>(
    keyType: KeyType,
    passphrase: string,
    loadKey: (passphrase: string) => Promise<TKeyType>
  ): Promise<TKeyType> {
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
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.NoETHKeyData, `key: No key data`, {
        action: ACTIONS.INIT_KEY_DAT,
        keyType
      })
    }

    return key
  }
}
