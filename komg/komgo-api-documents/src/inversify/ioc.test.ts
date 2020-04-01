import 'jest'
import 'reflect-metadata'

import { CONFIG_KEYS } from './config_keys'
import { iocContainer } from './ioc'

describe('ioc.ts', () => {
  it('api-documents should read and write messages from different locations', async () => {
    const from = iocContainer.get(CONFIG_KEYS.FromPublisherId)
    const to = iocContainer.get(CONFIG_KEYS.ToPublisherId)

    expect(from).not.toEqual(to)
  })
})
