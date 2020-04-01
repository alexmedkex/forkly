import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'
import { NotificationManager, TaskManager } from '@komgo/notification-publisher'
import { Container, decorate, inject, injectable, interfaces } from 'inversify'
import { autoProvide, makeProvideDecorator, makeFluentProvideDecorator } from 'inversify-binding-decorators'
import 'reflect-metadata'
import { Controller } from 'tsoa'

import { ITimerJobProcessorBase } from '../business-layer/schedule/ITimerJobProcessor'
import { NotificationJobProcessor } from '../business-layer/schedule/job-processors/NotificationJobProcessor'
import { TaskJobProcessor } from '../business-layer/schedule/job-processors/TaskJobProcessor'
import { TimerScheduleProcessor, ITimerScheduleProcessor } from '../business-layer/schedule/TimerScheduleProcessor'
import { ITimerScheduleService, TimerScheduleService } from '../business-layer/schedule/TimerScheduleService'
import { ITimerDataAgent } from '../data-layer/data-agents/ITimerDataAgent'
import TimerDataAgent from '../data-layer/data-agents/TimerDataAgent'

import { TYPES } from './types'

const iocContainer = new Container()
const provide = makeProvideDecorator(iocContainer)
const fluentProvider = makeFluentProvideDecorator(iocContainer)

decorate(injectable(), Controller)

const API_NOTIF_BASE_URL = process.env.API_NOTIF_BASE_URL || 'http://api-notif:8080'
iocContainer.bind<string>('notifUrl').toConstantValue(API_NOTIF_BASE_URL)
iocContainer.bind<TaskManager>(TYPES.TaskManagerClient).toConstantValue(new TaskManager(API_NOTIF_BASE_URL))
iocContainer
  .bind<NotificationManager>(TYPES.NotificationManagerClient)
  .toConstantValue(new NotificationManager(API_NOTIF_BASE_URL))

iocContainer.bind<ITimerDataAgent>(TYPES.TimerDataAgent).to(TimerDataAgent)
iocContainer.bind<ITimerScheduleProcessor>(TYPES.TimerScheduleProcessor).to(TimerScheduleProcessor)
iocContainer.bind<ITimerScheduleService>(TYPES.TimerScheduleService).to(TimerScheduleService)

iocContainer.bind<ITimerJobProcessorBase>(TYPES.TimerJobProcessor).to(TaskJobProcessor)
iocContainer.bind<ITimerJobProcessorBase>(TYPES.TimerJobProcessor).to(NotificationJobProcessor)

iocContainer.bind<number>('timerRetryNumber').toConstantValue(Number(process.env.TIMER_RETRY_NUMBER || 5))
iocContainer.bind<number>('timerRetryTime').toConstantValue(Number(process.env.TIMER_RETRY_TIME || 1))

iocContainer
  .bind(TYPES.MessagePublisher)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST,
      process.env.INTERNAL_MQ_USERNAME,
      process.env.INTERNAL_MQ_PASSWORD,
      getRequestIdHandler()
    ).createPublisher('to-event-mgnt')
  )

const provideSingleton = (identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>) => {
  return fluentProvider(identifier)
    .inSingletonScope()
    .done()
}

export { iocContainer, autoProvide, provide, provideSingleton, inject }
