import { Container, inject, interfaces, decorate, injectable } from 'inversify'
import { makeFluentProvideDecorator } from 'inversify-binding-decorators'
import { Controller } from 'tsoa'

import CompanyKeyProvider from '../business-layer/key-management/CompanyKeyProvider'
import { RsaKeyManager } from '../business-layer/key-management/RsaKeyManager'
import KeyMigration from '../business-layer/migration/KeyMigration'
import KeyDataAgent from '../data-layer/data-agents/KeyDataAgent'
import VaultClient from '../infrastructure/vault/VaultClient'

import { CONFIG_KEYS } from './config_keys'
import { TYPES } from './types'

const iocContainer = new Container()
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

// Business layer
iocContainer
  .bind<RsaKeyManager>(TYPES.RsaKeyManager)
  .to(RsaKeyManager)
  .inSingletonScope()
iocContainer
  .bind<CompanyKeyProvider>(TYPES.CompanyKeyProvider)
  .to(CompanyKeyProvider)
  .inSingletonScope()
iocContainer
  .bind<KeyMigration>(TYPES.KeyMigration)
  .to(KeyMigration)
  .inSingletonScope()
// Data layer
iocContainer
  .bind<KeyDataAgent>(TYPES.KeyDataAgent)
  .to(KeyDataAgent)
  .inSingletonScope()

iocContainer.bind<string>(CONFIG_KEYS.vaultRoleId).toConstantValue(process.env.API_SIGNER_VAULT_ROLE_ID)
iocContainer.bind<string>(CONFIG_KEYS.vaultSecretId).toConstantValue(process.env.API_SIGNER_VAULT_SECRET_ID)
iocContainer.bind<string>(CONFIG_KEYS.apiVersion).toConstantValue(process.env.VAULT_API_VERSION || 'v1')
iocContainer.bind<string>(CONFIG_KEYS.vaultUrl).toConstantValue(process.env.VAULT_BASE_URL)

iocContainer
  .bind(TYPES.VaultClient)
  .toConstantValue(
    new VaultClient(
      process.env.VAULT_BASE_URL,
      process.env.API_SIGNER_VAULT_ROLE_ID,
      process.env.API_SIGNER_VAULT_SECRET_ID,
      'v1'
    )
  )

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, provideSingleton, inject }
