import { ProductId, Document, SharedWith } from '../store'

export type Picker<T, V> = (el: T) => V

export const pickDocumentId: Picker<Document, string> = (doc: Document) => doc.id

export const pickDocumentSharedWith: Picker<Document, SharedWith[]> = (doc: Document) => doc.sharedWith

export const pickDocumentSharedBy: Picker<Document, string> = (doc: Document) => doc.sharedBy

export const pickDocumentProductId: Picker<Document, ProductId> = (doc: Document) =>
  doc.product ? doc.product.id : undefined

export const pickDocumentCategoryId: Picker<Document, string> = (doc: Document) =>
  doc.category ? doc.category.id : undefined

export const pickDocumentSubProductId: Picker<Document, string | undefined> = (doc: Document) =>
  doc.context && (doc.context as any).subProductId ? (doc.context as any).subProductId : undefined
