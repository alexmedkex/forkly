import fs from 'fs'
import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardPlatformMonitoring } from '../../features'

interface MonitoringConfigurationUser {
  readonly name: string
  readonly password: string
  readonly tag: string
}

export interface MonitoringConfiguration {
  readonly user: MonitoringConfigurationUser
  readonly exchangeName: string
  readonly queueName: string
  readonly routingKey: string
}
export const commandPlatformAddMonitoring = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , fname] = cli.input
  if (!fname) {
    logger.error('Invalid command usage. Get command usage example using --help')
    process.exit(1)
  }

  // Parsing file:
  const optsFile = fs.readFileSync(fname).toString()
  const opts = JSON.parse(optsFile) as MonitoringConfiguration

  // Running onboarding feature:
  await onboardPlatformMonitoring(config, opts)
  process.exit(0)
}
