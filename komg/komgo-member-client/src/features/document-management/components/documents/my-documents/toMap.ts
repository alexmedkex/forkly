import { DocumentType, Document } from '../../../store/types'

export type MapDocumentsToDocumentTypeId = Map<string, Document[]>

export const mapDocumentsByDocumentTypeId = (documents: Document[]): MapDocumentsToDocumentTypeId => {
  const getDocumentTypeIdFromDocument = (doc: Document) => doc.type.id
  const documentTypesByCategory = groupBy<string, Document>(documents, getDocumentTypeIdFromDocument)

  documentTypesByCategory.set('all', documents)
  return documentTypesByCategory
}

/* This is a filter over a map of string->Document[] using the second argument passed
to the function */
export const filterMapRequestedDocTypes = (map: MapDocumentsToDocumentTypeId, documentTypes: DocumentType[]) => {
  const reqTypes = documentTypes.map(x => x.id)
  const newObj = new Map(map)
  Array.from(newObj.keys()).forEach((key: string) => {
    if (-1 === reqTypes.indexOf(key)) {
      newObj.delete(key)
    }
  })
  return newObj
}

export type MapDocumentTypesByCategoryId = Map<string, DocumentType[]>

export const mapDocumentTypesByCategoryId = (documentTypes: DocumentType[]): MapDocumentTypesByCategoryId => {
  const getCategoryIdFromDocumentType = (docType: DocumentType) => docType.category.id
  const docsByType = groupBy<string, DocumentType>(documentTypes, getCategoryIdFromDocumentType)

  docsByType.set('all', documentTypes)
  return docsByType
}

export function groupBy<K, T>(collection: T[] = [], key: (el: T) => K): Map<K, T[]> {
  const accumulator = new Map<K, T[]>()

  return collection.reduce((acc, el) => {
    const value = key(el)

    if (!acc.has(value)) {
      acc.set(value, [])
    }
    acc.get(value)!.push(el)

    return acc
  }, accumulator)
}
