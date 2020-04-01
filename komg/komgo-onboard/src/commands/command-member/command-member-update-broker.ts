import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardMemberUpdateBroker } from '../../features'
import { generateCredentials } from '../../features/onboard-member/generate-credentials'

export const commandMemberUpdateBroker = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , mnid] = cli.input
  if (!mnid) {
    logger.error('Invalid command usage, mnid name missing. Get command usage example using --help.')
    process.exit(1)
  }

  // Running onboarding feature:
  await onboardMemberUpdateBroker(config, mnid)
  process.exit(0)
}
