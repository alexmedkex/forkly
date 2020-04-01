import 'reflect-metadata'

import { LastProcessedBlock } from './LastProcessedBlock'

describe('LastProcessedBlock', () => {
  it('should not return _id in object', async () => {
    const result = new LastProcessedBlock()
    expect(result.toJSON()).not.toContain('_id')
  })
})
