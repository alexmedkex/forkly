import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardMember } from '../../features'

export const commandMemberAdd = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , mnid] = cli.input
  if (!mnid) {
    logger.error('Invalid command usage, mnid or json file name missing. Get command usage example using --help.')
    process.exit(1)
  }

  // Running onboarding feature:
  await onboardMember(config, mnid)
  process.exit(0)
}
