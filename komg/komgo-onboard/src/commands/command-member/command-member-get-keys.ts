import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardMemberKeys, onboardMemberENS } from '../../features'
import * as fs from 'fs'

export const commandMemberRetrieveKeys = async (config: Config, cli: CLI) => {
  const [, , jsonFileName, apiSignerURL, apiBlockchainSignerURL, keycloakURL] = cli.input
  if (!jsonFileName) {
    logger.error('Invalid command usage, json file name is missing. Get command usage example using --help.')
    process.exit(1)
  }

  const data = await onboardMemberKeys(config, jsonFileName, apiSignerURL, apiBlockchainSignerURL, true)
  const json = JSON.stringify(data, null, 2)
  const outputFileName = 'member-package-with-keys.json'
  fs.writeFile(outputFileName, json, function(err) {
    if (err) {
      return logger.error(err.message, err)
    }
    logger.info(`Member package was saved to ${outputFileName}`)
  })
}
