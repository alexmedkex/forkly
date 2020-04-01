import meow from 'meow'
import * as lodash from 'lodash'
import { DeepPartial } from 'ts-essentials'
import fs from 'fs'
import defaultConfig from './config.default'

export type ConfigOpts = DeepPartial<typeof Config['defaults']>

export class Config {
  static defaults = {
    ...defaultConfig
  }

  static readFromString(input: string) {
    const opts = JSON.parse(input) as ConfigOpts
    return new Config(opts)
  }

  static readFromFile(path: string) {
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(Config.defaults, null, 2))
    const data = fs.readFileSync(path).toString()
    return Object.assign(Config.readFromString(data), { src: path })
  }

  static writeToFile(path: string, config: Config) {
    fs.writeFileSync(path, JSON.stringify(config.data, null, 2))
    return this
  }

  public data: typeof Config['defaults']
  public src?: string

  constructor(opts?: ConfigOpts) {
    const defaults = JSON.parse(JSON.stringify(Config.defaults)) // yes I know
    this.data = { ...defaults, ...opts }
  }

  get(key: string) {
    const result = lodash.get(this.data, key)
    return result
  }

  set(key: string, value: string | boolean) {
    const result = lodash.set(this.data, key, value)
    return this.get(key)
  }

  cli(cli: ReturnType<typeof meow>) {
    if (cli.flags.c) {
      const flags = cli.flags.c instanceof Array ? cli.flags.c : [cli.flags.c]
      for (const pair of flags) {
        const [key, value, ...rest] = pair.split('=')
        if (!key || !value || rest.length > 0) throw new Error('Invalid key-value pair.')
        this.set(key, value)
      }
    }
    return this
  }
}
