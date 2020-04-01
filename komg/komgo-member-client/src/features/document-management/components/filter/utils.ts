import { Category, DocumentType } from '../../index'
import { sortCategories, sortDocumentTypes } from '../../utils/sortingHelper'
import { categoryToColor } from '../documents/document-library/categoryToColor'

export const getDocumentTypeFilterOptions = (categories: Category[], types: DocumentType[]) => {
  return sortCategories(categories).map(c => ({
    name: c.name,
    value: c.id,
    display: {
      color: categoryToColor[c.id]
    },
    items: sortDocumentTypes(types)
      .filter(t => t.category.id === c.id)
      .map(t => ({
        name: t.name,
        value: t.id
      }))
  }))
}
