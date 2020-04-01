import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardMemberBroker } from '../../features'
import { generateCredentials } from '../../features/onboard-member/generate-credentials'

export const commandMemberAddBroker = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , mnid] = cli.input
  if (!mnid) {
    logger.error('Invalid command usage, mnid name missing. Get command usage example using --help.')
    process.exit(1)
  }

  // Generating credentials:
  const credentials = generateCredentials(mnid, config.get('aws.env.type') === 'qa')

  // Running onboarding feature:
  await onboardMemberBroker(config, { mnid, credentials }, cli.flags.skipUserCreation)
  process.exit(0)
}
