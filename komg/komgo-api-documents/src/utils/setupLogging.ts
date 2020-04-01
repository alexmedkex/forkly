import logger, { configureLogging } from '@komgo/logging'
import axios from 'axios'

export const setUpLogging = () => {
  configureLogging(process.env.CONTAINER_HOSTNAME)
  logger.addLoggingToAxios(axios)
}
