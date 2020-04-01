import { ErrorCode } from '@komgo/error-utilities'
import { configureLogging, getLogger } from '@komgo/logging'
import { AmqpConnectionManager } from 'amqp-connection-manager'

import { connect } from './connect'
import { inboundRouter, inboundEmailRouter } from './routers'
import { ErrorName } from './utils/error'

const logger = getLogger('start')
configureLogging('common-mq-router')

export const start = async (): Promise<AmqpConnectionManager> => {
  try {
    logger.info('Connecting to RMQ...')
    const connection = await connect()
    logger.info('Starting the router...')
    await inboundRouter('VAKT', connection)
    await inboundEmailRouter(connection)
    logger.info('Routing set up')
    return connection
  } catch (err) {
    logger.crit(ErrorCode.UnexpectedError, ErrorName.UnexpectedSetupError, err.message, {
      stacktrace: err.stack
    })
    process.exit(1)
    // throw err to sattisfy tslint
    throw err
  }
}

// do not start automatically in the integrational tests
if (require.main === module) {
  start()
}
