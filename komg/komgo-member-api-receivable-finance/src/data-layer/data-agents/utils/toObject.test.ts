import { toObject } from './toObject'

const mockObject = {
  objectId: 'id'
}
const mockDocument = {
  toObject: jest.fn().mockReturnValue(mockObject)
}

describe('toObject', () => {
  it('should call toObject of the mongoose document successfully', async () => {
    const result = toObject(mockDocument as any)

    expect(mockDocument.toObject).toHaveBeenCalled()
    expect(result).toEqual(mockObject)
  })

  it('should return null if document is null', async () => {
    const result = toObject(null)

    expect(result).toBeNull()
  })
})
