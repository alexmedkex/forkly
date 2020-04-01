import { sortCategories, sortDocumentTypes } from './sortingHelper'
import { mockCategories } from '../store/categories/mock-data'
import { Category, DocumentType } from '../store/types'
import { mockProduct } from '../store/products/mock-data'

describe('sortingHelper utils', () => {
  it('sorting of the Categories work as expected', () => {
    const expectedSorting: string[] = [
      'banking-documents',
      'business-description',
      'company-details',
      'management-and-directors',
      'miscellaneous',
      'regulation-and-compliance',
      'shareholders'
    ]
    const categoriesSorted = sortCategories(mockCategories)
    expect(categoriesSorted.map(c => c.id)).toEqual(expectedSorting)
  })
  it('The category "Additional" goes always at the end', () => {
    const mockCategories1: Category[] = [
      {
        id: 'additional',
        product: mockProduct,
        name: 'Additional'
      },
      {
        id: 'bbb',
        product: mockProduct,
        name: 'BBB'
      },
      {
        id: 'aaa',
        product: mockProduct,
        name: 'AAA'
      }
    ]

    const expectedSorting: string[] = ['aaa', 'bbb', 'additional']
    const categoriesSorted = sortCategories(mockCategories1)
    expect(categoriesSorted.map(c => c.id)).toEqual(expectedSorting)
  })
  it('sorting of the Categories work with empty list', () => {
    const mockEmptyCategories: Category[] = []
    const categoriesSorted = sortCategories(mockEmptyCategories)
    expect(categoriesSorted).toEqual([])
  })
  it('sorting of DocumentTypes work as expected', () => {
    const mockDocTypes: DocumentType[] = [
      {
        product: mockProduct,
        category: mockCategories[0],
        name: 'CCC',
        id: 'ccc',
        fields: [],
        predefined: false
      },

      {
        product: mockProduct,
        category: mockCategories[1],
        name: 'BBB',
        id: 'bbb',
        fields: [],
        predefined: false
      },

      {
        product: mockProduct,
        category: mockCategories[2],
        name: 'AAA',
        id: 'aaa',
        fields: [],
        predefined: false
      }
    ]
    const expectedSorting: string[] = ['aaa', 'bbb', 'ccc']
    const docTypesSorted = sortDocumentTypes(mockDocTypes)
    expect(docTypesSorted.map(c => c.id)).toEqual(expectedSorting)
  })
  it('sorting of the document types work with empty list', () => {
    const mockEmptyDocTypes: DocumentType[] = []
    const docTypesSorted = sortDocumentTypes(mockEmptyDocTypes)
    expect(docTypesSorted).toEqual([])
  })
})
