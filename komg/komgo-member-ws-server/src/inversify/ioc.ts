import { MessagingFactory, IConsumerWatchdog } from '@komgo/messaging-library'
import express, { Express } from 'express'
import { Server as HttpServer } from 'http'
import { Container } from 'inversify'
import 'reflect-metadata'
import SocketIO from 'socket.io'

import { IMQMessageHandler, MQMessageHandler } from '../service/MQMessageHandler'
import { Server } from '../service/Server'
import { IWSConnectionHandler, WSConnectionHandler } from '../service/WSConnectionHandler'

import { TYPES } from './types'

const iocContainer = new Container()
const CLIENT_ID = 'ws-server'
const RETRY_DELAY = 5000

iocContainer.bind<IWSConnectionHandler>(TYPES.WSConnectionHandler).to(WSConnectionHandler)
iocContainer.bind<IMQMessageHandler>(TYPES.MQMessageHandler).to(MQMessageHandler)
iocContainer.bind<Server>(TYPES.Server).to(Server)
iocContainer.bind<Express>(TYPES.Express).toConstantValue(express())
iocContainer
  .bind<HttpServer>(TYPES.HttpServer)
  .toConstantValue(new HttpServer(iocContainer.get<Express>(TYPES.Express)))
iocContainer
  .bind<SocketIO.Server>(TYPES.SocketIO)
  .toConstantValue(SocketIO(iocContainer.get<HttpServer>(TYPES.HttpServer)))
iocContainer
  .bind<IConsumerWatchdog>(TYPES.ConsumerWatchdog)
  .toConstantValue(
    new MessagingFactory(
      process.env.INTERNAL_MQ_HOST as string,
      process.env.INTERNAL_MQ_USERNAME as string,
      process.env.INTERNAL_MQ_PASSWORD as string
    ).createConsumerWatchdog(CLIENT_ID, RETRY_DELAY)
  )

export { iocContainer }
