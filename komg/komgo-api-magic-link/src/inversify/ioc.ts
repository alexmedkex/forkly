import { Web3Wrapper } from '@komgo/blockchain-access'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'
import Web3 from 'web3'

import DeactivatedDocumentDataAgent, {
  IDeactivatedDocumentDataAgent
} from '../data-layer/data-agent/DeactivatedDocumentDataAgent'
import JtiDataAgent, { IJtiDataAgent } from '../data-layer/data-agent/JtiDataAgent'
import SessionDataAgent, { ISessionDataAgent } from '../data-layer/data-agent/SessionDataAgent'
import JWSAgent, { IJWSAgent } from '../data-layer/utils/JWSAgent'
import CompanyRegistryService, { ICompanyRegistryService } from '../infrastructure/api-registry/CompanyRegistryService'
import { DocumentRegistry } from '../infrastructure/blockchain/DocumentRegistry'
import { DocumentRegistryV1 } from '../infrastructure/blockchain/DocumentRegistryV1'
import { ISmartContractProvider } from '../infrastructure/blockchain/interfaces'
import { SmartContractProvider } from '../infrastructure/blockchain/SmartContractProvider'

import { TYPES } from './types'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

const web3Wrapper = new Web3Wrapper()
iocContainer.bind<Web3>(TYPES.Web3Instance).toConstantValue(web3Wrapper.web3Instance)
iocContainer.bind<ISessionDataAgent>(TYPES.SessionDataAgent).to(SessionDataAgent)
iocContainer.bind<IJtiDataAgent>(TYPES.JtiDataAgent).to(JtiDataAgent)
iocContainer.bind<ISmartContractProvider>(TYPES.SmartContractProvider).to(SmartContractProvider)
iocContainer.bind<DocumentRegistry>(TYPES.DocumentRegistry).to(DocumentRegistry)
iocContainer.bind<DocumentRegistryV1>(TYPES.DocumentRegistryV1).to(DocumentRegistryV1)
iocContainer.bind<ICompanyRegistryService>(TYPES.CompanyRegistryService).to(CompanyRegistryService)
iocContainer.bind<IDeactivatedDocumentDataAgent>(TYPES.DeactivatedDocumentDataAgent).to(DeactivatedDocumentDataAgent)
iocContainer
  .bind(TYPES.DocumentRegistryV1Domain)
  .toConstantValue(process.env.DOCUMENT_REGISTRY_V1_DOMAIN || 'documentregistryv1.contract.komgo')
iocContainer
  .bind(TYPES.DocumentRegistryDomain)
  .toConstantValue(process.env.DOCUMENT_REGISTRY_DOMAIN || 'documentregistry.contract.komgo')
iocContainer.bind(TYPES.ApiSignerUrl).toConstantValue(process.env.API_SIGNER_BASE_URL)
iocContainer.bind(TYPES.ApiRegistryUrl).toConstantValue(process.env.API_REGISTRY_BASE_URL)
iocContainer
  .bind<IJWSAgent>(TYPES.JWTAgent)
  .to(JWSAgent)
  .inSingletonScope()

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
