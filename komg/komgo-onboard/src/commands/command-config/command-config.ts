import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'

export const commandConfig = async (config: Config, cli: CLI) => {
  const [key, value] = cli.input.slice(1)
  const isActuallyOk = config.get(key) !== void 0
  if (!key) {
    logger.info(JSON.stringify(config.data, null, 2))
    process.exit(0)
  }
  if (!isActuallyOk) {
    console.error(`Invalid key: ${key}.`)
    process.exit(1)
  } else {
    switch (value) {
      case undefined: {
        logger.info(config.get(key))
        break
      }
      case 'false': {
        logger.info(config.set(key, false))
        break
      }
      case 'true': {
        logger.info(config.set(key, true))
        break
      }
      default: {
        logger.info(config.set(key, value))
        break
      }
    }
    if (config.src) {
      Config.writeToFile(config.src, config)
    }
    process.exit(0)
  }
}
