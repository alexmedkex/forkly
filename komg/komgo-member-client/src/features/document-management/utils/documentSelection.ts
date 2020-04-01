import { Document } from '../store/types/document'

export const isSelected = (id: string, selectedIds: string[]): boolean => selectedIds.indexOf(id) !== -1

export const removeMultipleDocumentsFromSelectedList = (
  selectedDocuments: string[],
  documentsFromDocumentType: Document[]
): string[] => {
  const newSelectedDocuments = selectedDocuments.filter(selectedDocument => {
    let leave = true
    documentsFromDocumentType.forEach(document => {
      if (document.id === selectedDocument) {
        leave = false
      }
    })
    return leave
  })
  return newSelectedDocuments
}
