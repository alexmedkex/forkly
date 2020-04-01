import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import EthCrypto from 'eth-crypto'
import { inject, injectable } from 'inversify'
import Web3 from 'web3'

import KeyDataAgent from '../../data-layer/data-agents/KeyDataAgent'
import { TYPES } from '../../inversify/types'
import { INJECTED_VALUES } from '../../inversify/values'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'

import KeyCreationError from './exceptions/KeyCreationError'
import { IAccount } from './models/IAccount'
import { IETHKeyData, IETHPublicData } from './models/IETHKeyData'
import IPrivateKey from './models/IPrivateKey'
import VaultClient from '../../infrastructure/vault/VaultClient'

@injectable()
export class ETHKeyManager {
  private readonly logger = getLogger('ETHKeyManager')

  constructor(
    @inject(TYPES.KeyDataAgent) private readonly keyDataAgent: KeyDataAgent,
    @inject(INJECTED_VALUES.Web3Instance) private readonly web3: Web3,
    @inject(TYPES.VaultClient) private readonly vaultClient: VaultClient
  ) {}

  async createNewKeyAndSave(passphrase?: string, keyData?: string): Promise<IETHPublicData> {
    let account: IAccount
    let ethKeyData: IETHKeyData

    try {
      account = keyData ? this.createAccountFromPrivateKey(keyData) : this.createNewAccount()

      ethKeyData = this.getEthKeyData(account)
    } catch (err) {
      this.logger.error(ErrorCode.Configuration, ErrorName.ETHCreateKeyFailed, 'Error creating ETH key', {
        action: ACTIONS.ETH_CREATE_NEW_KEY,
        error: err
      })
      throw new KeyCreationError('Invalid key data')
    }

    passphrase = passphrase || process.env.ETH_KEYSTORE_PASSPHRASE
    await this.saveNewKey(account, passphrase)
    return this.getPublicKeyData(ethKeyData)
  }

  async getActiveKeyData(passphrase: string): Promise<IETHKeyData> {
    if (this.vaultClient.isAvailable()) {
      try {
        const vaultEthKey = await this.vaultClient.readEthKey()
        if (!vaultEthKey) return null

        return this.parseKeyData(JSON.stringify(vaultEthKey), passphrase)
      } catch (e) {
        this.logger.error(ErrorCode.Configuration, ErrorName.VaultReadKVFailed, { errorMessage: e.message })
        return null
      }
    }

    const data = await this.keyDataAgent.getActiveKey('ETH')
    if (!data) {
      return null
    }

    return this.parseKeyData(data.data, passphrase)
  }

  private async parseKeyData(keyData: string, passphrase: string): Promise<IETHKeyData> {
    try {
      const key = JSON.parse(keyData) as IPrivateKey

      const account = this.web3.eth.accounts.decrypt(key, passphrase)

      return this.getEthKeyData(account)
    } catch (err) {
      this.logger.error(ErrorCode.Configuration, ErrorName.ETHDecryptFailed, 'Failure:', err)
      throw new Error('Error decrypting Key')
    }
  }

  private async saveNewKey(account: IAccount, passphrase: string) {
    const keyStore = this.generatePrivateKeyData(account, passphrase)
    // TODO: Remove once we replace our mongo storage with Vault
    if (this.vaultClient.isAvailable()) {
      await this.vaultClient.storeEthKey(keyStore)
    } else {
      await this.keyDataAgent.addNewKey('ETH', JSON.stringify(keyStore))
    }

    this.logger.info('New ETH key generated', { action: ACTIONS.ETH_CREATE_NEW_KEY })

    if (passphrase !== process.env.RSA_KEYSTORE_PASSPHRASE) {
      this.logger.info('<<<< Passphrase for ETH key changed, replace in ENV >>>>', {
        action: ACTIONS.ETH_CREATE_NEW_KEY
      })
    }
  }

  private getEthKeyData(account: IAccount): IETHKeyData {
    const pubKey = EthCrypto.publicKeyByPrivateKey(account.privateKey)

    return {
      privateKey: account.privateKey,
      address: account.address,
      publicKey: pubKey,
      publicKeyCompressed: EthCrypto.publicKey.compress(pubKey)
    }
  }

  private createAccountFromPrivateKey(privateKey: string) {
    return this.web3.eth.accounts.privateKeyToAccount(privateKey)
  }

  private createNewAccount() {
    return this.web3.eth.accounts.create()
  }

  private generatePrivateKeyData(account: IAccount, passphrase: string): IPrivateKey {
    return this.web3.eth.accounts.encrypt(account.privateKey, passphrase)
  }

  private getPublicKeyData(ethData: IETHKeyData): IETHPublicData {
    return {
      address: ethData.address,
      publicKey: ethData.publicKey,
      publicKeyCompressed: ethData.publicKeyCompressed
    }
  }
}
