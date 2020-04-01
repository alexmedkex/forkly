import fs from 'fs'
import { CLI } from '../../cli'
import { Config } from '../../config'
import { logger } from '../../utils'
import { onboardPlatform } from '../../features'

export interface PlatformShovel {
  readonly src: {
    readonly protocol: 'amqp' | 'amqps'
    readonly host: string
    readonly port: string
    readonly queue: string
  }
  readonly dest: {
    readonly protocol: 'amqp' | 'amqps'
    readonly host: string
    readonly port: string
    readonly username: string
    readonly password: string
    readonly exchange: string
    readonly key: string
  }
  readonly sslOptions?: {
    readonly cacertfile?: string
    readonly serverNameIndication?: string
    readonly verify?: string
    readonly depth?: number
  }
}

export interface PlatformOptions {
  readonly name: string
  readonly shovels: PlatformShovel[]
  readonly guestUser: {
    readonly username: string
    readonly password: string
    readonly permission: {
      readonly read: string
      readonly write: string
      readonly tag: string
    }
  }
}

export const commandPlatformAdd = async (config: Config, cli: CLI) => {
  // Reading input and validating it:
  const [, , fname] = cli.input
  if (!fname) {
    logger.error('Invalid command usage. Get command usage example using --help')
    process.exit(1)
  }

  // Parsing file:
  const optsFile = fs.readFileSync(fname).toString()
  const opts = JSON.parse(optsFile) as PlatformOptions

  // Running onboarding feature:
  await onboardPlatform(config, opts)
  process.exit(0)
}
