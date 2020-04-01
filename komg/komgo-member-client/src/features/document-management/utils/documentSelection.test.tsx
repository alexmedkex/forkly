import * as documentSelection from './documentSelection'
import { mockDocuments } from '../store/documents/mock-data'

describe('documentSelection utils', () => {
  it('is selected checks for presence of an element in an array', () => {
    const anonCollection = ['1', '2', '3']
    const target = '3'
    const actual = documentSelection.isSelected(target, anonCollection)
    expect(actual).toBe(true)
  })
  it('removeMultipleDocumentsFromSelectedList removes documents from a collection by id', () => {
    const selectedDocumentIds = ['1', '2', '3']
    const actual = documentSelection.removeMultipleDocumentsFromSelectedList(selectedDocumentIds, mockDocuments)
    expect(actual).toEqual([])
  })
})
