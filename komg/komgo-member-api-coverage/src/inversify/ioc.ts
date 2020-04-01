import { Container, inject, interfaces, decorate, injectable } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import { Controller } from 'tsoa'
import { MessagingFactory } from '@komgo/messaging-library'

import { TYPES } from './types'
import IService from '../service-layer/events/IService'
import { ICompanyClient } from '../business-layer/registry/ICompanyClient'
import { CompanyClient } from '../business-layer/registry/CompanyClient'
import { RequestClient } from '../business-layer/messaging/RequestClient'
import { CoverageEventProcessor } from '../service-layer/events/CoverageEventProcessor'
import IEventsProcessor from '../business-layer/messaging/event/IEventsProcessor'
import EventsProcessor from '../business-layer/messaging/event/EventsProcessor'
import { IEventProcessorBase } from '../business-layer/messaging/event/IEventProcessor'
import AddCounterPartyRequestProcessor from '../business-layer/messaging/event/AddCounterPartyRequestProcessor'

import { ICounterpartyService } from '../business-layer/counterparty/ICounterpartyService'
import CounterpartyService from '../business-layer/counterparty/CounterpartyService'
import { ICompanyCoverageDataAgent } from '../data-layer/data-agents/ICompanyCoverageDataAgent'
import { CompanyCoverageDataAgent } from '../data-layer/data-agents/CompanyCoverageDataAgent'
import CounterpartyProfileDataAgent from '../data-layer/data-agents/CounterpartyProfileDataAgent'
import { ICounterpartyProfileDataAgent } from '../data-layer/data-agents/ICounterpartyProfileDataAgent'
import RejectCounterPartyRequestProcessor from '../business-layer/messaging/event/RejectCounterPartyRequestProcessor'
import ApproveCounterPartyRequestProcessor from '../business-layer/messaging/event/ApproveCounterPartyRequestProcessor'
import { TaskManager, NotificationManager } from '@komgo/notification-publisher'
import { ConsumerWatchdogFactory } from '../business-layer/messaging/ConsumerWatchdogFactory'
import { getRequestIdHandler } from '@komgo/microservice-config'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<string>('consumer-id').toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'api-coverage-consumer')
iocContainer
  .bind<string>('outbound-publisher')
  .toConstantValue(process.env.INTERNAL_MQ_TO_PUBLISHER_ID || 'to-event-mgnt')
iocContainer
  .bind<string>('inbound-publisher')
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')

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
  .bind<string>('api-registry-url')
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry')
iocContainer.bind<string>('company-static-id').toConstantValue(process.env.COMPANY_STATIC_ID)

iocContainer.bind<ICompanyClient>(TYPES.CompanyClient).to(CompanyClient)
iocContainer.bind(TYPES.RequestClient).to(RequestClient)
iocContainer.bind(TYPES.ConsumerWatchdogFactory).to(ConsumerWatchdogFactory)
iocContainer.bind<TaskManager>(TYPES.TaskManagerClient).toConstantValue(new TaskManager(process.env.API_NOTIF_BASE_URL))
iocContainer
  .bind<NotificationManager>(TYPES.NotificationClient)
  .toConstantValue(new NotificationManager(process.env.API_NOTIF_BASE_URL))

iocContainer.bind<IService>(TYPES.CoverageEventProcessor).to(CoverageEventProcessor)
iocContainer.bind<IEventsProcessor>(TYPES.EventsProcessor).to(EventsProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(AddCounterPartyRequestProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(ApproveCounterPartyRequestProcessor)
iocContainer.bind<IEventProcessorBase>(TYPES.EventProcessor).to(RejectCounterPartyRequestProcessor)
iocContainer.bind<ICounterpartyService>(TYPES.CounterpartyService).to(CounterpartyService)
iocContainer.bind<ICompanyCoverageDataAgent>(TYPES.CompanyCoverageDataAgent).to(CompanyCoverageDataAgent)
iocContainer.bind<ICounterpartyProfileDataAgent>(TYPES.CounterpartyProfileDataAgent).to(CounterpartyProfileDataAgent)

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
