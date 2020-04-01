import DataAccess from '@komgo/data-access'
import { configureLogging } from '@komgo/logging'
import config from 'config'

import { iocContainer } from './inversify/ioc'
import { TYPES } from './inversify/types'
import IIsReadyChecker from './util/IIsReadyChecker'

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const setupLogger = () => {
  let logstashLabel = 'blockchain-event-management'
  if (process.env.COMPANY_STATIC_ID) {
    logstashLabel = `${logstashLabel}-${process.env.COMPANY_STATIC_ID}-${process.env.DEPLOYMENT_ENVIRONMENT}`
  }
  configureLogging(logstashLabel)
}

const connectToMongo = async () => {
  DataAccess.setUrl(config.get('mongo.url').toString())
  DataAccess.connect()
  // give it a second to connect
  await sleep(1000)
}

const run = async (): Promise<void> => {
  setupLogger()
  await connectToMongo()

  const checker = iocContainer.get<IIsReadyChecker>(TYPES.IsReadyChecker)
  const isReady = await checker.isReady()

  process.exit(isReady ? 0 : 1)
}

run()
