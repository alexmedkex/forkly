import { IJSONPrivateKey, IJSONPublicKey } from '@komgo/jose'
import fs from 'fs'

import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

import CompanyKeyProvider from './CompanyKeyProvider'
import { RsaKeyManager } from './RsaKeyManager'

/**
 * Purpose of this class is to provide methods to init keys but importing them from a file or generating new ones
 */
export default class KeyInitializer {
  constructor(
    @inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider,
    @inject(TYPES.RsaKeyManager) private readonly rsaKeyManager: RsaKeyManager
  ) {}

  /**
   * If keys are not provided this method will generate new ones
   *
   * @param importedRsaPrivKey IJSONPrivateKey
   */
  public async import(importedRsaPrivKey?: IJSONPrivateKey) {
    if (importedRsaPrivKey) {
      await this.rsaKeyManager.createNewKeyAndSave(process.env.RSA_KEYSTORE_PASSPHRASE, importedRsaPrivKey)
    } else {
      await this.rsaKeyManager.createNewKeyAndSave(process.env.RSA_KEYSTORE_PASSPHRASE)
    }
  }

  public async writePublicKeysToFile(filePath) {
    const f = JSON.stringify(
      {
        komgoMessagingPubKey: (await this.companyKeyProvider.getRSAKey('public')) as IJSONPublicKey
      },
      null,
      2
    )

    fs.writeFileSync(filePath, f)
  }
}
