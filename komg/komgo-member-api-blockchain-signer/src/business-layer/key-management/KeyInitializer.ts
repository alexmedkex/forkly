import fs from 'fs'

import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'

import CompanyKeyProvider from './CompanyKeyProvider'
import { ETHKeyManager } from './ETHKeyManager'

/**
 * Purpose of this class is to provide methods to init keys but importing them from a file or generating new ones
 */
export default class KeyInitializer {
  constructor(
    @inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider,
    @inject(TYPES.ETHKeyManager) private readonly ethKeyManager: ETHKeyManager
  ) {}

  /**
   * If keys are not provided this method will generate new ones
   *
   * @param importedEthPrivKey string
   */
  public async import(importedEthPrivKey?: string) {
    if (importedEthPrivKey) {
      await this.ethKeyManager.createNewKeyAndSave(process.env.ETH_KEYSTORE_PASSPHRASE, importedEthPrivKey)
    } else {
      await this.ethKeyManager.createNewKeyAndSave(process.env.ETH_KEYSTORE_PASSPHRASE)
    }
  }

  public async writePublicKeysToFile(filePath) {
    const f = JSON.stringify(
      {
        ethPubKey: await this.companyKeyProvider.getETHKey('public')
      },
      null,
      2
    )

    fs.writeFileSync(filePath, f)
  }
}
