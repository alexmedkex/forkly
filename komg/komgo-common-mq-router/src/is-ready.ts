import { ErrorCode } from '@komgo/error-utilities'
import { getLogger, configureLogging } from '@komgo/logging'

import { connect } from './connect'
import { ErrorName } from './utils/error'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const logger = getLogger('isReadyCheck')
const waitForConnection = 2000 // ms
configureLogging('common-mq-router')

const isReadyCheck = async () => {
  try {
    const connection = connect()

    // wait for connection
    await sleep(waitForConnection)

    if (connection.isConnected()) {
      logger.info('RabbitMQ connection is OK')
      process.exit(0)
    } else {
      logger.error(ErrorCode.ConnectionCommonMQ, ErrorName.CommonMQHealthCheck, 'Disconnected from Common RabbitMQ')
    }
  } catch (e) {
    logger.error(ErrorCode.ConnectionCommonMQ, ErrorName.CommonMQHealthCheck, e.message, {
      stacktrace: e.stack
    })
  }
  process.exit(1)
}

isReadyCheck()
