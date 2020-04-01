import 'reflect-metadata'

const findOneAndUpdate = jest.fn(({ hash }) => hash)
const findOneAndDelete = jest.fn(({ hash }) => hash)

jest.mock('../models/DeactivatedDocument', () => ({
  DeactivatedDocument: { findOneAndUpdate, findOneAndDelete }
}))

import DeactivatedDocumentDataAgent from './DeactivatedDocumentDataAgent'

describe('DeactivatedDocumentDataAgent', () => {
  let deactivatedDocumentDataAgent
  beforeEach(() => {
    deactivatedDocumentDataAgent = new DeactivatedDocumentDataAgent()
    findOneAndUpdate.mockClear()
    findOneAndUpdate.mockClear()
  })

  it('should create a record', async () => {
    const result = await deactivatedDocumentDataAgent.deactivateDocument('hash')
    expect(findOneAndUpdate).toHaveBeenCalledWith({ hash: 'hash' }, { hash: 'hash' }, { upsert: true })
  })
  it('should delete a record', async () => {
    const result = await deactivatedDocumentDataAgent.reactivateDocument('hash')
    expect(findOneAndDelete).toHaveBeenCalledWith({ hash: 'hash' })
  })
})
