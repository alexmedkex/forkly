import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../../utils/endpoints'
import getBaseEndpoint from '../../utils/getBaseEndpoint'
import {
  DocumentTypeActionType,
  FetchDocumentTypesSuccess,
  FetchDocumentTypesError,
  FetchDocumentTypeByIdSuccess,
  FetchDocumentTypeByIdError,
  DocumentType,
  DocumentTypeCreateRequest,
  DocumentTypeCreateResponse,
  CreateDocumentTypeSuccess,
  CreateDocumentTypeError,
  DocumentTypeUpdateRequest,
  UpdateDocumentTypeSuccess,
  UpdateDocumentTypeError,
  DeleteDocumentTypeSuccess,
  DeleteDocumentTypeError,
  StartFetchingDocumentTypes,
  Category,
  Product,
  ProductId
} from '../types'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

// GET
export const fetchDocumentTypesAsync: ActionCreator<ActionThunk> = (productId: ProductId, categoryId?: string) => {
  return (dispatch, getState, api): Action => {
    dispatch(startFatchingDocumentTypes(true))
    return dispatch(
      api.get(`${getBaseEndpoint(productId)}/products/${productId}/types`, {
        params: {
          categoryId
        },
        onError: fetchDocumentTypesError,
        onSuccess: fetchDocumentTypesSuccess
      })
    )
  }
}

export const startFatchingDocumentTypes: ActionCreator<StartFetchingDocumentTypes> = (isLoading: boolean) => ({
  type: DocumentTypeActionType.START_FETCHING_DOCUMENT_TYPES,
  payload: isLoading
})

export const fetchDocumentTypesSuccess: ActionCreator<FetchDocumentTypesSuccess> = (documentTypes: DocumentType[]) => ({
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_SUCCESS,
  payload: documentTypes
})

export const fetchDocumentTypesError: ActionCreator<FetchDocumentTypesError> = error => ({
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPES_ERROR,
  error
})

// POST
export const createDocumentTypeAsync: ActionCreator<ActionThunk> = (
  documentType: DocumentTypeCreateRequest,
  productId: ProductId
) => {
  return (dispatch, getState, api): Action => {
    const state = getState()
    const products = state.get('products').get('products')
    const [product] = products.filter(p => p.id === productId)
    const categories = state.get('categories').get('categories')
    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/types/`, {
        data: documentType,
        onError: createDocumentTypeError,
        onSuccess: createDocumentTypeSuccess(categories, product)
      })
    )
  }
}

export const createDocumentTypeSuccess: (
  categories: Category[],
  product: Product
) => ActionCreator<CreateDocumentTypeSuccess> = (categories: Category[], product: Product) => (
  docTypeCreateResponse: DocumentTypeCreateResponse
) => {
  const categoryId = docTypeCreateResponse.categoryId
  const category = categories.find(cat => cat.id === categoryId)
  const hydratedDocType = {
    category: category!,
    product,
    name: docTypeCreateResponse.name,
    id: docTypeCreateResponse.id,
    fields: docTypeCreateResponse.fields,
    predefined: docTypeCreateResponse.predefined
  }

  return {
    type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_SUCCESS,
    payload: hydratedDocType
  }
}

export const createDocumentTypeError: ActionCreator<CreateDocumentTypeError> = error => ({
  type: DocumentTypeActionType.CREATE_DOCUMENT_TYPE_ERROR,
  error
})

// PATCH
export const updateDocumentTypeAsync: ActionCreator<ActionThunk> = (
  documentType: DocumentTypeUpdateRequest,
  productId: ProductId
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.patch(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/types/`, {
        data: documentType,
        onError: updateDocumentTypeError,
        onSuccess: updateDocumentTypeSuccess
      })
    )
  }
}

export const updateDocumentTypeSuccess: ActionCreator<UpdateDocumentTypeSuccess> = (documentType: DocumentType) => ({
  type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_SUCCESS,
  payload: documentType
})

export const updateDocumentTypeError: ActionCreator<UpdateDocumentTypeError> = error => ({
  type: DocumentTypeActionType.UPDATE_DOCUMENT_TYPE_ERROR,
  error
})

// DELETE
export const deleteDocumentTypeAsync: ActionCreator<ActionThunk> = (typeId: string, productId: ProductId) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.delete(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/types/${typeId}`, {
        onError: deleteDocumentTypeError,
        onSuccess: deleteDocumentTypeSuccess
      })
    )
  }
}

export const deleteDocumentTypeSuccess: ActionCreator<DeleteDocumentTypeSuccess> = () => ({
  type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_SUCCESS
})

export const deleteDocumentTypeError: ActionCreator<DeleteDocumentTypeError> = error => ({
  type: DocumentTypeActionType.DELETE_DOCUMENT_TYPE_ERROR,
  error
})

// GET BY ID
export const fetchDocumentTypeByIdAsync: ActionCreator<ActionThunk> = (
  documentTypeId: string,
  productId: ProductId
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}types/${documentTypeId}`, {
        onError: fetchDocumentTypeByIdError,
        onSuccess: fetchDocumentTypeByIdSuccess
      })
    )
  }
}

export const fetchDocumentTypeByIdSuccess: ActionCreator<FetchDocumentTypeByIdSuccess> = (
  documentType: DocumentType
) => ({
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPE_BY_ID_SUCCESS,
  payload: documentType
})

export const fetchDocumentTypeByIdError: ActionCreator<FetchDocumentTypeByIdError> = error => ({
  type: DocumentTypeActionType.FETCH_DOCUMENT_TYPE_BY_ID_ERROR,
  error
})
