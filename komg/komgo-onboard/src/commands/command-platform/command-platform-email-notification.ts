import { CLI } from '../../cli'
import { Config } from '../../config'
import { onboardPlatformEmailNotification } from '../../features'

export const commandPlatformEmailNotification = async (config: Config, cli: CLI) => {
  // Running onboarding feature:
  await onboardPlatformEmailNotification(config)
  process.exit(0)
}
