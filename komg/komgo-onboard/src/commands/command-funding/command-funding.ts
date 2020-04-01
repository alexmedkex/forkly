import fs from 'fs'
// import { PrivateKey } from 'web3'
import { CLI } from '../../cli'
import { Config } from '../../config'
import { onboardFunding } from '../../features'
import { logger } from '../../utils'

export const commandFunding = async (config: Config, cli: CLI) => {
  const [, keystorePath, keystoreSecret] = cli.input
  if (!keystorePath || !keystoreSecret) {
    logger.error('Invalid command usage, keystore file path or secret missing. Get command usage example using --help.')
    process.exit(1)
  }
  if (!fs.existsSync(keystorePath)) {
    logger.error('File does not exists.')
    process.exit(1)
  }
  const json = fs.readFileSync(keystorePath).toString()
  const data = JSON.parse(json)
  await onboardFunding(config, data, keystoreSecret)
}
