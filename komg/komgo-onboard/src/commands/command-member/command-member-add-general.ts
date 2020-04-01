import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardMemberKeys, onboardMemberENS } from '../../features'

export const commandMemberAddGeneral = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , jsonFileName, apiSignerURL, apiBlockchainSignerURL, keycloakURL] = cli.input
  if (!jsonFileName) {
    logger.error('Invalid command usage, json file name is missing. Get command usage example using --help.')
    process.exit(1)
  }

  // Running onboarding feature:
  await onboardMemberKeys(config, jsonFileName, apiSignerURL, apiBlockchainSignerURL)
  await onboardMemberENS(config, jsonFileName)
  process.exit(0)
}
