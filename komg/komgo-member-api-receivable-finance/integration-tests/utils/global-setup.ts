import { LogLevel } from '@komgo/logging'

import { GlobalActions } from './GlobalActions'

module.exports = async () => {
  if (process.env.INTEGRATION_TEST) {
    process.env.LOG_LEVEL = LogLevel.Crit

    GlobalActions.setupEnvs()
    await GlobalActions.startMongoDB()
    await GlobalActions.startRabbitMQ()
  }
}
