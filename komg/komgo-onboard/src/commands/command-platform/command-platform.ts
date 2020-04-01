import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { commandPlatformAdd } from './command-platform-add'
import { commandPlatformRm } from './command-platform-rm'
import { commandPlatformAddMonitoring } from './command-platform-monitoring'
import { commandPlatformEmailNotification } from './command-platform-email-notification'

export const commandPlatform = async (config: Config, cli: CLI) => {
  const [command] = cli.input.slice(1)
  switch (command) {
    case 'add': {
      await commandPlatformAdd(config, cli)
      break
    }
    case 'rm': {
      await commandPlatformRm(config, cli)
      break
    }
    case 'configure-monitoring': {
      await commandPlatformAddMonitoring(config, cli)
      break
    }
    case 'configure-email-notification': {
      await commandPlatformEmailNotification(config, cli)
      break
    }
    default: {
      logger.error('Invalid command. Get full command list using --help')
      process.exit(1)
    }
  }
}
