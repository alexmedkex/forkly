import KcAdminClient from '@komgo/keycloak-admin'
import { iocContainer, MigrationConfiguration } from '@komgo/microservice-config'
import { inject, interfaces, decorate, injectable } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import KeycloakAdminService from '../buisness-layer/keycloak/KeycloakAdminService'
import UserSettingsDataAgent, { IUserSettingsDataAgent } from '../data-layer/data-agent/UserSettingsDataAgent'
import { userSettingsModelFactory, UserSettingsModel } from '../data-layer/models/UserSettings'
import RolesClient from '../infrastructure/roles/RolesClient'

import { CONFIG } from './config'
import { TYPES } from './types'

const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

const keycloakAuthUrl = process.env.KEYCLOAK_AUTH_OVERRIDE_URL || process.env.KEYCLOAK_AUTH_URL
iocContainer.bind<string>(TYPES.KeycloakAuthUrl).toConstantValue(keycloakAuthUrl)
iocContainer.bind<string>(CONFIG.realm).toConstantValue(process.env.KEYCLOAK_REALM_NAME || 'KOMGO')
iocContainer
  .bind<string>(CONFIG.rolesBaseUrl)
  .toConstantValue(process.env.API_ROLES_BASE_URL || 'http://api-roles:8080')
iocContainer.bind<boolean>(CONFIG.keycloakSsl).toConstantValue(process.env.KEYCLOAK_SSL === 'true')
iocContainer
  .bind<string>(CONFIG.keycloakCorsAllowedOrigin)
  .toConstantValue(process.env.KEYCLOAK_ALLOWED_CORS_ORIGIN || 'http://localhost:3010')
iocContainer.bind<boolean>(CONFIG.smtpAuth).toConstantValue(process.env.SMTP_AUTH === 'true')
iocContainer.bind<string>(CONFIG.smtpHost).toConstantValue(process.env.SMTP_HOST || '')
iocContainer.bind<string>(CONFIG.smtpPort).toConstantValue(process.env.SMTP_PORT || '')
iocContainer.bind<string>(CONFIG.smtpAuthUser).toConstantValue(process.env.SMTP_AUTH_USER || '')
iocContainer.bind<string>(CONFIG.smtpAuthPassword).toConstantValue(process.env.SMTP_AUTH_PASS || '')
iocContainer.bind<boolean>(CONFIG.smtpSSL).toConstantValue(process.env.SMTP_SSL === 'true')
iocContainer.bind<boolean>(CONFIG.smtpStartTls).toConstantValue(process.env.SMTP_TLS === 'true')
iocContainer.bind<string>(CONFIG.smtpFrom).toConstantValue(process.env.MAIL_FROM || '')
iocContainer.bind<string>(CONFIG.clientId).toConstantValue(process.env.KEYCLOAK_CLIENT_ID || 'web-app')

iocContainer
  .bind<interfaces.Factory<UserSettingsModel>>('Factory<UserSettingsModel>')
  .toFactory<UserSettingsModel>(userSettingsModelFactory)
iocContainer.bind<IUserSettingsDataAgent>(TYPES.UserSettingsDataAgent).to(UserSettingsDataAgent)
iocContainer.bind<KeycloakAdminService>(TYPES.KeycloakAdminService).to(KeycloakAdminService)
iocContainer.bind<RolesClient>(TYPES.RolesClient).to(RolesClient)
iocContainer.bind<KcAdminClient>(TYPES.KeycloakAdminClient).toProvider(context => async () => {
  const kcAdminClient = new KcAdminClient({ baseUrl: keycloakAuthUrl })
  await kcAdminClient.auth({
    username: process.env.KEYCLOAK_USER,
    password: process.env.KEYCLOAK_PASSWORD,
    grantType: 'password',
    clientId: 'admin-cli'
  })
  return kcAdminClient
})

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) =>
  fluentProvider(identifier)
    .inSingletonScope()
    .done()

const configuration = new MigrationConfiguration()
configuration.setFilePath('config/db-migrations.js')

export { iocContainer, autoProvide, provide, provideSingleton, inject }
