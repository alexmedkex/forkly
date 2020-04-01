import { TemplatesReducer, TemplateActions } from './templates'
import { CategoriesReducer, CategoryActions } from './categories'
import { DocumentTypesReducer, DocumentTypeActions } from './document-types'
import { ProductsReducer, ProductsActions } from './products'
import { RequestsReducer, RequestActions } from './requests'
import { DocumentsReducer, DocumentsActions } from './documents'
import { ModalsReducer, ModalActions } from './modals'
export const DEFAULT_PRODUCT = 'kyc'

export * from './types'

export {
  CategoriesReducer,
  CategoryActions,
  DocumentTypesReducer,
  DocumentTypeActions,
  TemplatesReducer,
  TemplateActions,
  ProductsActions,
  ProductsReducer,
  RequestsReducer,
  RequestActions,
  DocumentsReducer,
  DocumentsActions,
  ModalsReducer,
  ModalActions
}
