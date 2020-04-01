import { fakeDocument, anonDocument } from './faker'
import { Document } from '../store/types'

describe('document faker', () => {
  it('returns a valid Document given a Partial<Document>', () => {
    const actual: Document = fakeDocument()
    expect(actual).toMatchObject(anonDocument)
  })

  it('should overwrite default properties with those from passed Partial', () => {
    const defaultDocument = fakeDocument()
    const override = { id: 'anon derp' }

    const expected = { ...defaultDocument, ...override }
    const actual = fakeDocument(override)

    expect(actual).toMatchObject(expected)
  })
})
