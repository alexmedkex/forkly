import { Web3Wrapper } from '@komgo/blockchain-access'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import CustomerDataAgent, { ICustomerDataAgent } from '../data-layer/data-agent/CustomerDataAgent'
import LastProcessedBlockDataAgent, {
  ILastProcessedBlockDataAgent
} from '../data-layer/data-agent/LastProcessedBlockDataAgent'
import CustomerProductManager from '../service-layer/services/CustomerProductManager'
import ICustomerProductManager from '../service-layer/services/ICustomerProductManager'
import ISmartContract from '../service-layer/services/ISmartContract'
import SmartContract from '../service-layer/services/SmartContract'

import { TYPES } from './types'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

const defaultPullInterval = 60e3 // msec
const pullIntervalStr = process.env.PULL_INTERVAL_IN_MSEC || `${defaultPullInterval}`
const ensAddress = process.env.ENS_REGISTRY_CONTRACT_ADDRESS || ''

iocContainer.bind(TYPES.Web3).toConstantValue(new Web3Wrapper())

iocContainer.bind<string>('ens-address').toConstantValue(ensAddress)
iocContainer.bind<number>('pull-interval').toConstantValue(parseInt(pullIntervalStr, 10) || defaultPullInterval)
iocContainer
  .bind<string>('komgometaresolver-domain')
  .toConstantValue(process.env.ENS_META_RESOLVER_DOMAIN || 'komgometaresolver.contract.komgo')
iocContainer
  .bind<string>('komgoonboarder-domain')
  .toConstantValue(process.env.ENS_ONBOARDER_DOMAIN || 'komgoonboarder.contract.komgo')
iocContainer.bind<ILastProcessedBlockDataAgent>(TYPES.LastProcessedBlockDataAgent).to(LastProcessedBlockDataAgent)
iocContainer.bind<ICustomerDataAgent>(TYPES.CustomerDataAgent).to(CustomerDataAgent)
iocContainer.bind<ISmartContract>(TYPES.SmartContract).to(SmartContract)
iocContainer.bind<ICustomerProductManager>(TYPES.CustomerProductManager).to(CustomerProductManager)

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
