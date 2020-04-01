import { Category, DocumentType, Document, HasName } from '../store/types'

/**
 * Why are we sorting by 'name' and not by 'id' if 'id' is more curated??
 * The answer is because in some cases they dont match and the nature of
 * these sortings is purelly visual for the user. This is the case of the
 * document type with 'id'='business-description', which has the
 * name='Description of the business'.
 */
export const sortCategories = (categories: Category[]) => {
  const sorted = [...categories] // to avoid sonarqube errors due to side effects of sort()
  sorted.sort((a: Category, b: Category) => (a.name > b.name ? 1 : -1))
  const additional: Category = sorted.find(c => c.id === 'additional')
  if (sorted.length > 0 && additional) {
    sorted.push(sorted.splice(sorted.indexOf(additional), 1)[0])
  }
  return sorted
}

export const sortDocumentTypes = (docTypes: DocumentType[]) => {
  const sortedDocTypes = [...docTypes]
  const funcSorting = docTypes => docTypes.sort((a: DocumentType, b: DocumentType) => (a.name > b.name ? 1 : -1))
  return sortByDocumentTypes<DocumentType>(sortedDocTypes, funcSorting)
}

export const sortDocumentsByDocumentTypes = (docs: Document[]) => {
  const sortedDocTypes = [...docs]
  const funcSorting = docs => docs.sort((a: Document, b: Document) => (a.type.name > b.type.name ? 1 : -1))
  return sortByDocumentTypes<Document>(sortedDocTypes, funcSorting)
}

function sortByDocumentTypes<T extends HasName>(docsArray: T[], sorting: (t: T[]) => void): T[] {
  const sortedDocTypes = [...docsArray]
  sorting(sortedDocTypes)
  const others: T[] = sortedDocTypes.filter(c => c.name === 'Other')
  if (sortedDocTypes.length > 0 && others) {
    others.forEach(other => sortedDocTypes.push(sortedDocTypes.splice(sortedDocTypes.indexOf(other), 1)[0]))
  }
  return sortedDocTypes
}
