import { iocContainer, MigrationConfiguration } from '@komgo/microservice-config'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import { IRoleDataAgent } from '../data-layer/data-agents/interfaces/IRoleDataAgent'
import RoleDataAgent from '../data-layer/data-agents/RoleDataAgent'
import { RoleModel, roleModelFactory } from '../data-layer/models/role'

import { TYPES } from './types'

const isKomgoNode = process.env.IS_KOMGO_NODE === 'true'

const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<IRoleDataAgent>(TYPES.RoleDataAgent).to(RoleDataAgent)
iocContainer.bind<boolean>('is-komgo-node').toConstantValue(isKomgoNode)
iocContainer.bind<interfaces.Factory<RoleModel>>('Factory<RoleModel>').toFactory<RoleModel>(roleModelFactory)

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

const configuration = new MigrationConfiguration()
configuration.setFilePath('config/db-migrations.js')

export { iocContainer, autoProvide, provide, provideSingleton, inject }
