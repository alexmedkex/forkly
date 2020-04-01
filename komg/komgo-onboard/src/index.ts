import path from 'path'
import { Config } from './config'
import { cli } from './cli'
import { logger } from './utils'
import { commandConfig, commandPlatform, commandMember, commandFunding, commandGenerateAddressBook } from './commands'

// Loading current config:
const configPath = path.join(__dirname, '..', 'config.json')
const config = Config.readFromFile(configPath).cli(cli)

// Remember: All commands are async:
switch (cli.input[0]) {
  case 'config': {
    commandConfig(config, cli)
    break
  }
  case 'platform': {
    commandPlatform(config, cli)
    break
  }
  case 'member': {
    commandMember(config, cli)
    break
  }
  case 'funding': {
    commandFunding(config, cli)
    break
  }
  case 'gen-addr-book': {
    commandGenerateAddressBook(config, cli)
    break
  }
  default: {
    logger.error('Invalid command. Get full command list using --help')
    process.exit(1)
  }
}
