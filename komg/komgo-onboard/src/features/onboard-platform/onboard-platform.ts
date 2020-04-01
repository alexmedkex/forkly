import { Config } from '../../config'
import { onboardPlatformBroker } from './onboard-platform-broker'
import { PlatformOptions } from '../../commands/command-platform'

export const onboardPlatform = async (config: Config, opts: PlatformOptions) => {
  await onboardPlatformBroker(config, opts)
}
