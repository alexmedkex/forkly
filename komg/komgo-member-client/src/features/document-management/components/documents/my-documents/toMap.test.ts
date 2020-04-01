import { mapDocumentsByDocumentTypeId, mapDocumentTypesByCategoryId } from './toMap'
import { mockCategories } from '../../../store/categories/mock-data'
import { mockDocumentTypes } from '../../../store/document-types/mock-data'
import { mockDocuments } from '../../../store/documents/mock-data'
describe('mapDocumentsByDocumentTypeId', () => {
  const sut = mapDocumentsByDocumentTypeId(mockDocuments)

  it('should return a map of document-type ids to a list of documents', () => {
    const anonDocumentType = mockDocumentTypes[1]
    const anonDocumentTypeId = anonDocumentType.id
    const expected = mockDocuments.filter(doc => doc.type.id === anonDocumentTypeId)
    const actual = sut.get(anonDocumentTypeId)
    expect(actual).toEqual(expected)
  })

  it('should have an "all" member which contains all documents', () => {
    const expected = mockDocuments
    const actual = sut.get('all')
    expect(actual).toEqual(expected)
  })
})

describe('mapDocumentTypesByCategoryId', () => {
  const sut = mapDocumentTypesByCategoryId(mockDocumentTypes)

  it('should return a map of category ids to a list of document-types', () => {
    const anonCategory = mockCategories[1]
    const anonCategoryId = anonCategory.id
    const expected = mockDocumentTypes.filter(docType => docType.category.id === anonCategoryId)
    const actual = sut.get(anonCategoryId)
    expect(actual).toEqual(expected)
  })

  it('should have an "all" member which contains all document-types', () => {
    const expected = mockDocumentTypes
    const actual = sut.get('all')
    expect(actual).toEqual(expected)
  })
})
