import { ErrorCode } from '@komgo/error-utilities'
import {
  createKeyFromJson,
  decryptWithPassword,
  encryptWithPassword,
  generateKey,
  IJSONPrivateKey,
  IJSONPublicKey,
  IJWKObject
} from '@komgo/jose'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'
import KeyDataAgent from '../../data-layer/data-agents/KeyDataAgent'

import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import KeyCreationError from './exceptions/KeyCreationError'
import VaultClient from '../../infrastructure/vault/VaultClient'

@injectable()
export class RsaKeyManager {
  private static readonly KEY_SIZE = 2048
  private readonly logger = getLogger('RsaKeyManager')

  constructor(
    @inject(TYPES.KeyDataAgent) private readonly keyDataAgent: KeyDataAgent,
    @inject(TYPES.VaultClient) private readonly vaultClient: VaultClient
  ) {}

  async createNewKeyAndSave(passphrase?: string, keyData?: IJSONPrivateKey): Promise<IJSONPublicKey> {
    let key: IJWKObject

    try {
      key = await this.createKey(keyData)
    } catch (err) {
      throw err
    }

    const pubKey = await this.saveAndReturnKey(key, passphrase)

    return pubKey
  }

  async createKey(keyData?: IJSONPrivateKey): Promise<IJWKObject> {
    let key: IJWKObject

    try {
      if (keyData) {
        key = await this.createKeyFromPrivateKey(keyData)
        const result = await this.validateKey(key)

        if (result) {
          throw new KeyCreationError(result)
        }
      } else {
        key = await this.generateKey()
      }
    } catch (err) {
      this.logger.error(ErrorCode.Configuration, ErrorName.RSACreateKey, 'Error creating RSA key', {
        action: ACTIONS.RSA_CREATE_KEY,
        error: err
      })
      if (err instanceof KeyCreationError) {
        throw err
      }

      throw new KeyCreationError('Invalid key data')
    }

    return key
  }

  async saveAndReturnKey(key: IJWKObject, passphrase?: string): Promise<IJSONPublicKey> {
    passphrase = passphrase || process.env.RSA_KEYSTORE_PASSPHRASE
    await this.saveKey(key.toJSON(true) as IJSONPrivateKey, passphrase)

    return this.getKeyPublicKey(key)
  }

  async getActiveKeyData(passphrase: string): Promise<IJWKObject> {
    if (this.vaultClient.isAvailable()) {
      try {
        const vaultRsaKey = await this.vaultClient.readRsaKey()
        if (!vaultRsaKey) return null

        return this.parseKeyData(vaultRsaKey, passphrase)
      } catch (e) {
        this.logger.error(ErrorCode.Configuration, ErrorName.VaultReadKVFailed, 'Failed to get keyData', {
          errorMessage: e.message
        })
        return null
      }
    }

    const data = await this.keyDataAgent.getActiveKey('RSA')

    if (!data) {
      return null
    }

    return this.parseKeyData(data.data, passphrase)
  }

  private async saveKey(key: IJSONPrivateKey, passphrase: string) {
    const keyData = await this.encryptKey(key, passphrase)

    // TODO: Remove once we replace our mongo storage with Vault
    if (this.vaultClient.isAvailable()) {
      await this.vaultClient.storeRsaKey(keyData)
    } else {
      await this.keyDataAgent.addNewKey('RSA', keyData)
    }

    this.logger.info('New RSA key generated', {
      action: ACTIONS.RSA_CREATE_KEY
    })

    if (passphrase !== process.env.RSA_KEYSTORE_PASSPHRASE) {
      this.logger.info('<<<< Passphrase for RSA key changed, replace in ENV >>>>', {
        action: ACTIONS.RSA_CREATE_KEY
      })
    }
  }

  private async parseKeyData(data: string, passphrase: string): Promise<IJWKObject> {
    if (!data) {
      return null
    }

    let key

    try {
      const keyData = (await this.decryptKey(data, passphrase)).payload.toString()
      key = createKeyFromJson(JSON.parse(keyData))
    } catch (err) {
      this.logger.error(ErrorCode.Configuration, ErrorName.ParseRSAKey, 'Error parsing RSA key data', {
        action: ACTIONS.RSA_GET_KEY,
        error: err
      })
      throw new Error('Error parsing RSA key data')
    }

    return key
  }

  private async generateKey(): Promise<IJWKObject> {
    return generateKey(RsaKeyManager.KEY_SIZE)
  }

  private async createKeyFromPrivateKey(key: IJSONPrivateKey) {
    const createdKeyFromJson = createKeyFromJson(key)
    return createdKeyFromJson
  }

  private getKeyPublicKey(key: IJWKObject): IJSONPublicKey {
    return key.toJSON()
  }

  private async validateKey(key: IJWKObject): Promise<string> {
    if (key.kty !== 'RSA' || key.length !== RsaKeyManager.KEY_SIZE) {
      return 'Key must be RSA 2048'
    }

    // TODO - add additional validation for key. node-jose do not have it yet
    return null
  }

  private async encryptKey(keyData, passphrase) {
    const encryptedKey = await encryptWithPassword(JSON.stringify(keyData), passphrase)
    return encryptedKey
  }

  private async decryptKey(keyData, passphrase) {
    return decryptWithPassword(keyData, passphrase)
  }
}
