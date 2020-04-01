import { GlobalActions } from './GlobalActions'

module.exports = async () => {
  if (process.env.INTEGRATION_TEST) {
    await GlobalActions.deleteMongoDB()
    await GlobalActions.deleteRabbitMQ()
  }
}
