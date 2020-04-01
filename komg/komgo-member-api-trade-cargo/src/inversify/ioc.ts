import { Container, inject, interfaces, decorate, injectable } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import { Controller } from 'tsoa'
import { MessagingFactory } from '@komgo/messaging-library'
import { NotificationManager } from '@komgo/notification-publisher'
import TradeDataAgent from '../data-layer/data-agents/TradeDataAgent'

import { ITradeDataAgent } from '../data-layer/data-agents/ITradeDataAgent'

import { TYPES } from './types'
import { EventService } from '../service-layer/events/EventService'
import IService from '../service-layer/events/IService'
import { ICargoDataAgent } from '../data-layer/data-agents/ICargoDataAgent'
import CargoDataAgent from '../data-layer/data-agents/CargoDataAgent'
import { CargoEventProcessor } from '../service-layer/events/process/CargoEventProcessor'
import { ICargoEventProcessor } from '../service-layer/events/process/ICargoEventProcessor'
import { TradeEventProcessor } from '../service-layer/events/process/TradeEventProcessor'
import { ITradeEventProcessor } from '../service-layer/events/process/ITradeEventProcessor'
import { IMemberClient } from '../data-layer/clients/IMemberClient'
import { MemberClient } from '../data-layer/clients/MemberClient'
import { ICounterpartyClient } from '../data-layer/clients/ICounterpartyClient'
import { CounterpartyClient } from '../data-layer/clients/CounterpartyClient'
import IPollingServiceFactory from '../service-layer/IPollingServiceFactory'
import PollingServiceFactory from '../service-layer/PollingServiceFactory'
import { ITradeValidator, TradeValidator } from '../data-layer/validation/TradeValidator'
import { ICargoValidator, CargoValidator } from '../data-layer/validation/CargoValidator'
import { IDocumentServiceClient, DocumentServiceClient } from '../business-layer/documents/DocumentServiceClient'
import {
  ITradeFinanceServiceClient,
  TradeFinanceServiceClient
} from '../business-layer/trade-finance/TradeFinanceServiceClient'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { EventMessagePublisher } from '../service-layer/events/EventMessagePublisher'
import { IEventMessagePublisher } from '../service-layer/events/IEventMessagePublisher'
import { ITradeValidationService, TradeValidationService } from '../business-layer/validation/TradeValidationService'
import { VALUES } from './values'
import { TradeUpdateMessageUseCase } from '../business-layer/TradeUpdateMessageUseCase'
import { CargoUpdateMessageUseCase } from '../business-layer/CargoUpdateMessageUseCase'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<ITradeDataAgent>(TYPES.TradeDataAgent).to(TradeDataAgent)
iocContainer.bind<ICargoDataAgent>(TYPES.CargoDataAgent).to(CargoDataAgent)
iocContainer.bind<ITradeValidator>(TYPES.TradeValidator).to(TradeValidator)
iocContainer.bind<ICargoValidator>(TYPES.CargoValidator).to(CargoValidator)

iocContainer.bind<IService>(TYPES.TradeEventService).to(EventService)
iocContainer.bind<IEventMessagePublisher>(TYPES.EventMessagePublisher).to(EventMessagePublisher)

iocContainer.bind<ICargoEventProcessor>(TYPES.CargoEventProcessor).to(CargoEventProcessor)
iocContainer.bind<ITradeEventProcessor>(TYPES.TradeEventProcessor).to(TradeEventProcessor)
iocContainer.bind<IMemberClient>(TYPES.MemberClient).to(MemberClient)
iocContainer.bind<ICounterpartyClient>(TYPES.CounterpartyClient).to(CounterpartyClient)
iocContainer.bind<IDocumentServiceClient>(TYPES.DocumentServiceClient).to(DocumentServiceClient)
iocContainer.bind<ITradeFinanceServiceClient>(TYPES.TradeFinanceServiceClient).to(TradeFinanceServiceClient)
iocContainer.bind<ITradeValidationService>(TYPES.TradeValidationService).to(TradeValidationService)
iocContainer.bind<TradeUpdateMessageUseCase>(TYPES.TradeUpdateMessageUseCase).to(TradeUpdateMessageUseCase)
iocContainer.bind<CargoUpdateMessageUseCase>(TYPES.CargoUpdateMessageUseCase).to(CargoUpdateMessageUseCase)

iocContainer
  .bind<string>('documentsServiceUrl')
  .toConstantValue(process.env.API_DOCUMENTS_BASE_URL || 'http://api-documents:8080')

iocContainer
  .bind<string>('tradeFinanceServiceUrl')
  .toConstantValue(process.env.API_TRADE_FINANCE_BASE_URL || 'http://api-trade-finance:8080')

iocContainer
  .bind<IPollingServiceFactory>(TYPES.PollingServiceFactory)
  .to(PollingServiceFactory)
  .inSingletonScope()

iocContainer
  .bind<string>(VALUES.ConsumerId)
  .toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'api-trade-consumer')

iocContainer.bind<string>(VALUES.CompanyStaticId).toConstantValue(process.env.COMPANY_STATIC_ID)
iocContainer
  .bind<string>(VALUES.TradeCargoPublisherId)
  .toConstantValue(process.env.TRADE_CARGOS_PUBLISHER_ID || 'trade-cargos')
iocContainer
  .bind<string>(VALUES.InboundPublisherId)
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')

iocContainer
  .bind<number>('internal-mq-polling-interval-ms')
  .toConstantValue(parseInt(process.env.INTERNAL_MQ_POLLING_INTERVAL_MS, 10) || 100)

iocContainer
  .bind(TYPES.MessagingFactory)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST,
      process.env.INTERNAL_MQ_USERNAME,
      process.env.INTERNAL_MQ_PASSWORD,
      getRequestIdHandler()
    )
  )

iocContainer
  .bind<NotificationManager>(TYPES.NotificationClient)
  .toConstantValue(new NotificationManager(process.env.API_NOTIF_BASE_URL))

const provideNamed = (
  identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>,
  name: string
) => {
  return fluentProvider(identifier)
    .whenTargetNamed(name)
    .done()
}

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, provideNamed, inject }
