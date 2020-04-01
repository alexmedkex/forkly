import { Document } from '../../document-management'
import { fakeDocument } from '../../document-management/utils/faker'
import { latestDocument } from './document-utils'

describe('latestDocument', () => {
  let fakeDocs: Document[]
  beforeEach(() => {
    fakeDocs = [
      fakeDocument({ registrationDate: new Date('2019-01-01'), receivedDate: new Date('2019-01-10') }),
      fakeDocument({ registrationDate: new Date('2019-01-05'), receivedDate: undefined })
    ]
  })

  it('should return the undefined if no documents provided', () => {
    expect(latestDocument([])).not.toBeDefined()
  })

  it('should return the latest document', () => {
    const latest = fakeDocument({ registrationDate: new Date('2020-01-01'), receivedDate: new Date('2020-01-9') })

    expect(latestDocument([...fakeDocs, latest])).toEqual(expect.objectContaining(latest))
    expect(latestDocument([...fakeDocs, latest])).toHaveProperty('lastModifiedAt', new Date('2020-01-9'))
  })

  it('should return the latest document if documents have only been registered', () => {
    const docs = [
      fakeDocument({ registrationDate: new Date('2019-01-01'), receivedDate: undefined }),
      fakeDocument({ registrationDate: new Date('2019-01-05'), receivedDate: undefined }),
      fakeDocument({ registrationDate: new Date('2019-01-02'), receivedDate: undefined })
    ]

    expect(latestDocument(docs)).toEqual(expect.objectContaining(docs[1]))
    expect(latestDocument([...docs])).toHaveProperty('lastModifiedAt', new Date('2019-01-05'))
  })
})
