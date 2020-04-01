import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardMemberENS } from '../../features'

export const commandMemberAddENS = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , jsonFileName] = cli.input
  if (!jsonFileName) {
    logger.error('Invalid command usage, json file name is missing. Get command usage example using --help.')
    process.exit(1)
  }

  await onboardMemberENS(config, jsonFileName)
  process.exit(0)
}
