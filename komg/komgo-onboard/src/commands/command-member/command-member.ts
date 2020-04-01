import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { commandMemberAdd } from './command-member-add'
import { commandMemberAddGeneral } from './command-member-add-general'
import { commandMemberAddKeys } from './command-member-add-keys'
import { commandMemberAddENS } from './command-member-add-ens'
import { commandMemberAddBroker } from './command-member-add-broker'
import { commandMemberUpdateBroker } from './command-member-update-broker'
import { commandMemberRm } from './command-member-rm'
import { commandGenerateMemberPackage } from './command-member-generate-package'
import { commandMemberRetrieveKeys } from './command-member-get-keys'

export const commandMember = async (config: Config, cli: CLI) => {
  const [command] = cli.input.slice(1)
  switch (command) {
    case 'add': {
      await commandMemberAdd(config, cli)
      break
    }
    case 'add-broker': {
      await commandMemberAddBroker(config, cli)
      break
    }
    case 'update-broker': {
      await commandMemberUpdateBroker(config, cli)
      break
    }
    case 'add-general': {
      await commandMemberAddGeneral(config, cli)
      break
    }
    case 'add-keys': {
      await commandMemberAddKeys(config, cli)
      break
    }
    case 'get-keys': {
      await commandMemberRetrieveKeys(config, cli)
      break
    }
    case 'add-ens': {
      await commandMemberAddENS(config, cli)
      break
    }
    case 'rm': {
      await commandMemberRm(config, cli)
      break
    }
    case 'generate-member-package': {
      await commandGenerateMemberPackage(config, cli)
      break
    }
    default: {
      logger.error('Invalid command. Get full command list using --help')
      process.exit(1)
    }
  }
}
