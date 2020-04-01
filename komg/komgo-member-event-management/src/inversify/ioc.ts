import { MessagingFactory } from '@komgo/messaging-library'
import * as express from 'express'
import { Server as HttpServer } from 'http'
import { Container } from 'inversify'
import 'reflect-metadata'

import { CommonBrokerMessageDataAgent } from '../data-layer/data-agent/CommonBrokerMessageDataAgent'
import CompanyRegistryAgent from '../data-layer/data-agent/CompanyRegistryAgent'
import { ICompanyRegistryAgent } from '../data-layer/data-agent/ICompanyRegistryAgent'
import CommonMessagingAgent from '../messaging-layer/CommonMessagingAgent'
import EnvelopeAgent from '../messaging-layer/EnvelopeAgent'
import ICommonMessagingAgent from '../messaging-layer/ICommonMessagingAgent'
import IEnvelopeAgent from '../messaging-layer/IEnvelopeAgent'
import ISignerAgent from '../messaging-layer/ISignerAgent'
import RsaSignerAgent from '../messaging-layer/RsaSignerAgent'
import { Server } from '../Server'
import AuditingService from '../service-layer/AuditingService'
import CommonToInternalForwardingService from '../service-layer/CommonToInternalForwardingService'
import DecoratorService from '../service-layer/DecoratorService'
import { IAuditingService } from '../service-layer/IAuditingService'
import InternalToCommonForwardingService from '../service-layer/InternalToCommonForwardingService'
import IPollingServiceFactory from '../service-layer/IPollingServiceFactory'
import IService from '../service-layer/IService'
import PollingServiceFactory from '../service-layer/PollingServiceFactory'
import BackoffTimer from '../util/BackoffTimer'
import IBackoffTimer from '../util/IBackoffTimer'
import IIsReadyChecker from '../util/IIsReadyChecker'
import IsReadyChecker from '../util/IsReadyChecker'
import requestIdHandlerInstance, { RequestIdHandler } from '../util/RequestIdHandler'

import { TYPES } from './types'

const iocContainer = new Container()

iocContainer
  .bind<ISignerAgent>(TYPES.SignerAgent)
  .to(RsaSignerAgent)
  .inSingletonScope()
iocContainer
  .bind<IEnvelopeAgent>(TYPES.EnvelopeAgent)
  .to(EnvelopeAgent)
  .inSingletonScope()
iocContainer
  .bind<ICommonMessagingAgent>(TYPES.CommonMessagingAgent)
  .to(CommonMessagingAgent)
  .inSingletonScope()
iocContainer
  .bind<IService>(TYPES.DecoratorService)
  .to(DecoratorService)
  .inSingletonScope()
iocContainer
  .bind<IPollingServiceFactory>(TYPES.PollingServiceFactory)
  .to(PollingServiceFactory)
  .inSingletonScope()
iocContainer
  .bind<ICompanyRegistryAgent>(TYPES.CompanyRegistryAgent)
  .to(CompanyRegistryAgent)
  .inSingletonScope()
iocContainer
  .bind<IService>(TYPES.CommonToInternalForwardingService)
  .to(CommonToInternalForwardingService)
  .inSingletonScope()
iocContainer
  .bind<IService>(TYPES.InternalToCommonForwardingService)
  .to(InternalToCommonForwardingService)
  .inSingletonScope()
iocContainer.bind<IBackoffTimer>(TYPES.BackoffTimer).to(BackoffTimer)
iocContainer
  .bind<CommonBrokerMessageDataAgent>(TYPES.CommonBrokerMessageDataAgent)
  .to(CommonBrokerMessageDataAgent)
  .inSingletonScope()
iocContainer
  .bind<IAuditingService>(TYPES.AuditingService)
  .to(AuditingService)
  .inSingletonScope()
iocContainer
  .bind<IIsReadyChecker>(TYPES.IsReadyChecker)
  .to(IsReadyChecker)
  .inSingletonScope()
iocContainer.bind<RequestIdHandler>(TYPES.RequestIdHandler).toConstantValue(requestIdHandlerInstance)

iocContainer.bind<string>('outbound-routing-key').toConstantValue(process.env.OUTBOUND_ROUTING_KEY || 'komgo.internal')
iocContainer
  .bind<string>('outbound-vakt-exchange')
  .toConstantValue(process.env.OUTBOUND_VAKT_EXCHANGE || 'VAKT-OUTBOUND-EXCHANGE')
iocContainer
  .bind<string>('outbound-monitoring-exchange')
  .toConstantValue(process.env.OUTBOUND_MONITORING_EXCHANGE || 'MONITORING-EXCHANGE')

iocContainer.bind<string>('to-publisher-id').toConstantValue(process.env.INTERNAL_MQ_TO_PUBLISHER_ID || 'to-event-mgnt')
iocContainer
  .bind<string>('from-publisher-id')
  .toConstantValue(process.env.INTERNAL_MQ_FROM_PUBLISHER_ID || 'from-event-mgnt')
iocContainer.bind<string>('consumer-id').toConstantValue(process.env.INTERNAL_MQ_CONSUMER_ID || 'event-mgnt-consumer')
iocContainer
  .bind<number>('common-broker-polling-interval-ms')
  .toConstantValue(parseInt(process.env.COMMON_BROKER_POLLING_INTERVAL_MS, 10) || 300)
iocContainer
  .bind<number>('common-broker-max-error-delay-ms')
  .toConstantValue(parseInt(process.env.COMMON_BROKER_MAX_ERROR_DELAY_MS, 10) || 60000)
iocContainer
  .bind<number>('internal-broker-consumer-watchdog-interval-ms')
  .toConstantValue(parseInt(process.env.COMMON_BROKER_CONSUMER_WATCHDOG_INTERVAL_MS, 10) || 300)

iocContainer
  .bind<string>('common-mq-base-url')
  .toConstantValue(process.env.COMMON_MQ_BASE_URL || 'http://komgo-common-mq-node-1:15672')
iocContainer.bind<string>('common-mq-username').toConstantValue(process.env.COMMON_MQ_USERNAME || 'rabbitmq')
iocContainer.bind<string>('common-mq-password').toConstantValue(process.env.COMMON_MQ_PASSWORD || 'rabbitmq')
iocContainer
  .bind<string>('api-registry-base-url')
  .toConstantValue(process.env.API_REGISTRY_BASE_URL || 'http://api-registry:8080')
iocContainer
  .bind<string>('api-signer-base-url')
  .toConstantValue(process.env.API_SIGNER_BASE_URL || 'http://localhost:3107')

iocContainer.bind<string>('company-static-id').toConstantValue(process.env.COMPANY_STATIC_ID)
iocContainer
  .bind<number>('message-audit-write-timeout')
  .toConstantValue(parseInt(process.env.MESSAGE_AUDIT_WRITE_TIMEOUT, 10) || 10000)
iocContainer
  .bind<number>('max-content-length')
  .toConstantValue(parseInt(process.env.REQUEST_MAX_CONTENT_LENGTH_BYTES, 10) || 1073741824)
iocContainer.bind<number>('request-timeout').toConstantValue(parseInt(process.env.REQUEST_TIMEOUT, 10) || 60000)

// External dependencies
iocContainer
  .bind(TYPES.MessagingFactory)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST || 'komgo-internal-mq-node-1',
      process.env.INTERNAL_MQ_USERNAME || 'rabbitmq',
      process.env.INTERNAL_MQ_PASSWORD || 'rabbitmq',
      requestIdHandlerInstance
    )
  )

iocContainer.bind<Server>(TYPES.Server).to(Server)
iocContainer.bind<express.Express>(TYPES.Express).toConstantValue(express())
iocContainer
  .bind<HttpServer>(TYPES.HttpServer)
  .toConstantValue(new HttpServer(iocContainer.get<express.Express>(TYPES.Express)))

export { iocContainer }
