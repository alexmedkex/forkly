import { Container, inject, interfaces, decorate, injectable } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import { INotificationDataAgent } from '../data-layer/data-agents/interfaces/INotificationDataAgent'
import NotificationDataAgent from '../data-layer/data-agents/NotificationDataAgent'
import { ITaskDataAgent } from '../data-layer/data-agents/interfaces/ITaskDataAgent'
import TaskDataAgent from '../data-layer/data-agents/TaskDataAgent'

import { TYPES } from './types'
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { IEmailService, EmailService } from '../business-layer/emails/EmailService'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

iocContainer.bind<INotificationDataAgent>(TYPES.NotificationDataAgent).to(NotificationDataAgent)
iocContainer.bind<ITaskDataAgent>(TYPES.TaskDataAgent).to(TaskDataAgent)
iocContainer.bind<IEmailService>(TYPES.EmailService).to(EmailService)
iocContainer
  .bind<boolean>('metrics-and-email-activated')
  .toConstantValue(process.env.METRICS_AND_EMAIL_NOTIFICATIONS === 'true')
iocContainer
  .bind(TYPES.MessagePublisher)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST,
      process.env.INTERNAL_MQ_USERNAME,
      process.env.INTERNAL_MQ_PASSWORD,
      getRequestIdHandler()
    ).createPublisher('websocket')
  )

iocContainer
  .bind(TYPES.InternalMQPublisher)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST,
      process.env.INTERNAL_MQ_USERNAME,
      process.env.INTERNAL_MQ_PASSWORD,
      getRequestIdHandler()
    ).createPublisher(process.env.INTERNAL_MQ_TO_PUBLISHER_ID || 'to-event-mgnt')
  )

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
