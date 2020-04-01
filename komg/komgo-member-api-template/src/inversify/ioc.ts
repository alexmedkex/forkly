import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import {
  ITemplateDataAgent,
  TemplateDataAgent,
  TemplateBindingDataAgent,
  ITemplateBindingDataAgent
} from '../data-layer/data-agents'
import { TemplateBindingService } from '../service-layer/services/TemplateBindingService'
import { TemplateService } from '../service-layer/services/TemplateService'

import { TYPES } from './types'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<ITemplateDataAgent>(TYPES.TemplateDataAgent).to(TemplateDataAgent)
iocContainer.bind<TemplateService>(TYPES.TemplateService).to(TemplateService)
iocContainer.bind<TemplateBindingService>(TYPES.TemplateBindingService).to(TemplateBindingService)
iocContainer.bind<ITemplateBindingDataAgent>(TYPES.TemplateBindingDataAgent).to(TemplateBindingDataAgent)

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
