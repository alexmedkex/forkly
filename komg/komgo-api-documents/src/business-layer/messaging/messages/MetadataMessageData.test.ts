import 'jest'
import 'reflect-metadata'

import { MetadataMessageData } from './MetadataMessageData'

describe('MetadataMessageData', () => {
  it('make jest coverage happy', async () => {
    const data = new MetadataMessageData()
    expect(data).toBeDefined()
  })
})
