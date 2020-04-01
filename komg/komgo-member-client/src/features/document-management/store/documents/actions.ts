import { toast } from 'react-toastify'
import { Action, ActionCreator, Dispatch } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { history } from '../../../../store/history'
import { ApplicationState } from '../../../../store/reducers'
import {
  DOCUMENTS_BASE_ENDPOINT,
  TRADE_FINANCE_BASE_ENDPOINT,
  TRADE_DOCUMENTS_BASE_ENDPOINT
} from '../../../../utils/endpoints'
import { getEndpointError } from '../../../../utils/error-handler'
import { HttpRequest } from '../../../../utils/http'
import { ToastContainerIds } from '../../../../utils/toast'
import { BottomSheetActionType, BottomSheetItem, BottomSheetStatus } from '../../../bottom-sheet/store/types'
import { Counterparty } from '../../../counterparties/store/types'
import { createToast } from '../../../toasts/store/actions'
import { counterpartyName } from '../../utils/counterpartyHelper'
import { isSelected, removeMultipleDocumentsFromSelectedList } from '../../utils/documentSelection'
import { initiateDownload } from '../../utils/downloadDocument'
import {
  ChangeDocumentsFilter,
  CreateDocumentError,
  CreateDocumentRequest,
  CreateDocumentSuccess,
  DeleteDocumentError,
  DeleteDocumentSuccess,
  Document,
  DocumentActionType,
  DocumentResponse,
  DownloadDocumentError,
  DownloadDocumentSuccess,
  FetchDocumentContentError,
  FetchDocumentContentSuccess,
  FetchDocumentError,
  FetchDocumentsError,
  FetchDocumentsSuccess,
  FetchDocumentSuccess,
  ProductId,
  ResetDocumentsSelectData,
  SearchDocumentsError,
  SearchDocumentsSuccess,
  SelectDocument,
  SelectDocumentType,
  SendDocumentsRequest,
  StartFetchingDocumentContent,
  StartFetchingDocuments,
  CounterpartyFilter,
  SetCounterpartyFilter,
  DocumentListFilter,
  CounterpartyDocumentFilter
} from '../types'
import { displayToast, TOAST_TYPE } from '../../../../features/toasts/utils'
import { SetDocumentsListFilter, SetCounterpartyDocsFilter } from '../types/document'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

/**
 * Counts how many replies do we get from documents sharing API. Once
 * the expected count is reached, a toast is displayed with an appropriate message.
 */
export class ShareRepliesCounter {
  private totalRepliesCount = 0
  private successfulReplies = 0
  private isError = false

  constructor(
    private readonly dispatch,
    private readonly expectedCount: number,
    private readonly documentsCount: number,
    private readonly companies: Counterparty[]
  ) {}

  onSuccess() {
    this.successfulReplies++
    this.onReply()
  }

  onError() {
    this.isError = true
    this.onReply()
  }

  private onReply() {
    this.totalRepliesCount++
    if (this.totalRepliesCount === this.expectedCount) {
      if (this.isError) {
        this.dispatch(createToast('Error sharing document(s)', TOAST_TYPE.Error))
      } else {
        const textToast = this.textToast()
        this.dispatch(createToast(textToast), TOAST_TYPE.Ok)
      }
    }
  }

  private textToast() {
    const documentText = this.documentsCount > 1 ? 'documents' : 'document'
    if (this.expectedCount === 1 && this.successfulReplies === 1) {
      return `${this.documentsCount} ${documentText} shared with ${counterpartyName(this.companies[0])}`
    } else {
      return `${this.documentsCount} ${documentText} shared with ${this.successfulReplies} counterparties`
    }
  }
}

export const downloadTradeFinanceDocument: ActionCreator<ActionThunk> = (documentId: string) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents/${documentId}/content?printVersion=${true}`, {
        type: DocumentActionType.FETCH_DOCUMENT_CONTENT_REQUEST,
        responseType: 'arraybuffer',
        onError: fetchDocumentContentError,
        onSuccess: fetchDocumentContentSuccess
      })
    )
  }
}

export const fetchTradeFinanceDocuments: ActionCreator<ActionThunk> = (afterHandler?: ActionCreator<ActionThunk>) => (
  dispatch,
  getState,
  api
): Action => {
  return dispatch(
    api.get(`${DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents`, {
      type: DocumentActionType.FETCH_DOCUMENTS_REQUEST,
      onError: fetchDocumentsError,
      onSuccess: {
        type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler()(dispatcher, getState, api)
        }
      }
    })
  )
}

export const getTradeFinanceDocumentByHash: ActionCreator<ActionThunk> = (hash: string) => {
  const afterHandler = () => (dispatcher, getState, api) => {
    const state: ApplicationState = getState()

    const documentDetails = state
      .get('documents')
      .get('allDocuments')
      .find(d => d.hash === hash)

    if (documentDetails) {
      downloadTradeFinanceDocument(documentDetails.id)(dispatcher, getState, api)
    }
  }

  return fetchTradeFinanceDocuments(afterHandler)
}

// GET
// TODO: Non generic function to be removed
export const fetchDocumentsAsync: ActionCreator<ActionThunk> = (productId: ProductId, optionParams?: string) => {
  return (dispatch, getState, api): Action => {
    dispatch(startFetchingDocuments(true))
    let url = ''
    if (productId === 'tradeFinance') {
      url = `${TRADE_FINANCE_BASE_ENDPOINT}/lc/${optionParams}/documents`
    } else {
      const options = optionParams ? `?sharedBy=${optionParams}` : ''
      url = `${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents${options}`
    }

    return dispatch(
      api.get(url, {
        onError: fetchDocumentsError,
        onSuccess: fetchDocumentsSuccess
      })
    )
  }
}

export const fetchTradeDocumentsAsync: ActionCreator<ActionThunk> = () => (dispatch, _, api): Action =>
  dispatch(
    api.get(`${TRADE_DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents`, {
      type: DocumentActionType.FETCH_DOCUMENTS_REQUEST,
      onError: fetchDocumentsError,
      onSuccess: fetchDocumentsSuccess
    })
  )

export const fetchDocumentsWithParamsAsync: ActionCreator<ActionThunk> = (
  productId: ProductId,
  query?: string,
  sharedBy?: string,
  context?: object
) => {
  return (dispatch, getState, api): Action => {
    dispatch(startFetchingDocuments(true))
    let options = ''
    if (query) {
      options += `?query=${query}`
    }
    if (sharedBy) {
      const prefixOptions = options ? '&' : '?'
      options += `${prefixOptions}sharedBy=${sharedBy}`
    }
    if (context) {
      const prefixOptions = options ? '&' : '?'
      options += `${prefixOptions}context=${JSON.stringify(context)}`
    }

    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents${options}`, {
        onError: fetchDocumentsError,
        onSuccess: fetchDocumentsSuccess
      })
    )
  }
}

export const startFetchingDocuments: ActionCreator<StartFetchingDocuments> = (isFetching: boolean) => ({
  type: DocumentActionType.START_FETCHING_DOCUMENTS
})

export const fetchDocumentsSuccess: ActionCreator<FetchDocumentsSuccess> = (documents: Document[]) => {
  return {
    type: DocumentActionType.FETCH_DOCUMENTS_SUCCESS,
    payload: documents
  }
}

export const fetchDocumentsError: ActionCreator<FetchDocumentsError> = error => ({
  type: DocumentActionType.FETCH_DOCUMENTS_ERROR,
  error
})

export const searchDocumentsAsync: ActionCreator<ActionThunk> = (
  productId: ProductId,
  query?: string,
  sharedBy?: string,
  context?: object
) => {
  return (dispatch, getState, api): Action => {
    dispatch({
      type: DocumentActionType.SEARCH_DOCUMENTS_START
    })

    let options = ''
    if (query) {
      options += `?query=${query}`
    }
    if (sharedBy) {
      const prefixOptions = options ? '&' : '?'
      options += `${prefixOptions}sharedBy=${sharedBy}`
    }
    if (context) {
      const prefixOptions = options ? '&' : '?'
      options += `${prefixOptions}context=${JSON.stringify(context)}`
    }

    return dispatch(
      api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents${options}`, {
        onError: searchDocumentsError,
        onSuccess: searchDocumentsSuccess
      })
    )
  }
}

export const searchDocumentsSuccess: ActionCreator<SearchDocumentsSuccess> = (documents: Document[]) => ({
  type: DocumentActionType.SEARCH_DOCUMENTS_SUCCESS,
  payload: documents
})

export const searchDocumentsError: ActionCreator<SearchDocumentsError> = error => ({
  type: DocumentActionType.SEARCH_DOCUMENTS_ERROR,
  error
})

// POST
export const sendDocumentsAsync: ActionCreator<ActionThunk> = (
  requests: SendDocumentsRequest[],
  productId: ProductId
) => {
  if (requests.length === 0) {
    return
  }

  return (dispatch, getState, api): Action => {
    dispatch(createToast('Sharing documents. Please wait.', TOAST_TYPE.Ok))
    const counterparties: Counterparty[] = getState()
      .get('counterparties')
      .get('counterparties')

    const allCounterpartiesIds = new Set(requests.map(r => r.companyId))
    const toastsCounter = new ShareRepliesCounter(
      dispatch,
      requests.length,
      requests[0].documents.length,
      counterparties.filter(c => allCounterpartiesIds.has(c.staticId))
    )

    let res
    for (const request of requests) {
      res = dispatch(
        api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/send-documents`, {
          data: request,
          onSuccess: shareDocumentSuccess(dispatch, toastsCounter),
          onError: shareDocumentError(dispatch, toastsCounter)
        })
      )
    }
    return res
  }
}

export const shareDocumentSuccess = (dispatch, toastsCounter: ShareRepliesCounter) => {
  return (documents: Document[]) => {
    toastsCounter.onSuccess()
    return {
      type: DocumentActionType.SEND_DOCUMENTS_SUCCESS,
      payload: documents
    }
  }
}
export const shareDocumentError = (dispatch, toastsCounter: ShareRepliesCounter) => (error, response) => {
  toastsCounter.onError()
  // Handle specific errors or fallback to a generic error toast

  // HTTP 413 - Request Entity Too Large
  // This may happen when a user tries to share a set of documents that, all together, exceeds a specified limit
  // This is enforced by api-documents (env variable SHARE_DOCUMENTS_LIMIT) and current limit is 200mb

  /* Commented the lines below in case they come back */
  // if (response && response.response && response.response.status === 413) {
  //   toast.error('Shared files are going over the size limit', { containerId: ToastContainerIds.Default })
  // }
  // // Generic error toast
  // else {
  //   toast.error(`${getEndpointError(response)}`, { containerId: ToastContainerIds.Default })
  // }
  return { type: DocumentActionType.SEND_DOCUMENTS_ERROR, error }
}

// CREATE
export const createDocumentAsync: ActionCreator<ActionThunk> = (
  createDocumentRequest: CreateDocumentRequest,
  productId: ProductId
) => {
  return (dispatch: any, getState: () => ApplicationState, api: any) => {
    const categoryId = createDocumentRequest.categoryId
    const typeId = createDocumentRequest.documentTypeId

    const extraData = {
      name: createDocumentRequest.name,
      metadata: [{ name: '42r', value: `${Math.random()}` }],
      owner: {
        firstName: createDocumentRequest.creator.firstName,
        lastName: createDocumentRequest.creator.lastName,
        companyId: createDocumentRequest.creator.companyId
      },
      context: createDocumentRequest.context
    }

    const formData = new FormData()
    formData.set('extraData', JSON.stringify(extraData))
    formData.append('fileData', createDocumentRequest.file)

    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/categories/${categoryId}/types/${typeId}/upload`, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        onSuccess: data => dispatch(createDocumentSuccess(data)),
        onError: createDocumentError
      })
    )
  }
}

export const createTradeDocumentAsync: ActionCreator<ActionThunk> = (createDocumentRequest: CreateDocumentRequest) => {
  return (dispatch: any, getState: () => ApplicationState, api: any) => {
    const categoryId = createDocumentRequest.categoryId
    const typeId = createDocumentRequest.documentTypeId

    const extraData = {
      name: createDocumentRequest.name,
      metadata: [{ name: '42r', value: `${Math.random()}` }],
      owner: {
        firstName: createDocumentRequest.creator.firstName,
        lastName: createDocumentRequest.creator.lastName,
        companyId: createDocumentRequest.creator.companyId
      },
      context: createDocumentRequest.context
    }

    const formData = new FormData()
    formData.set('extraData', JSON.stringify(extraData))
    formData.append('fileData', createDocumentRequest.file)

    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/trade-finance/categories/${categoryId}/types/${typeId}/upload`, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        onSuccess: data => dispatch(createDocumentSuccess(data)),
        onError: createDocumentError
      })
    )
  }
}

export const createDocumentSuccess: ActionCreator<ActionThunk> = (document: DocumentResponse) => (dispatch, _, api) => {
  const action = api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${document.product.id}/document/${document.id}/retry`, {
    onSuccess: DocumentActionType.CREATE_DOCUMENT_SUCCESS,
    onError: (error, result) => createDocumentError(error, result, document)
  })
  return {
    type: DocumentActionType.CREATE_DOCUMENT_SUCCESS,
    payload: { ...document, action }
  }
}

export const createDocumentError: ActionCreator<CreateDocumentError> = (error, result, item?: BottomSheetItem) => {
  // Handle specific errors or fallback to a generic error toast
  // HTTP 413 - Request Entity Too Large
  // This may happen when a user tries to upload a document that exceeds body size limits
  // This is enforced by api-gateway (nginx) and current limit is 200mb
  if (result && result.response && result.response.status === 413) {
    displayToast('Uploaded file has achieved the size limit', TOAST_TYPE.Error)
  } else if (
    result.response &&
    result.response.data &&
    result.response.data.message &&
    result.response.status === 500
  ) {
    // checking for specific error messages that we return the document in the 500 error message payload
    // ignore otherwise
    const doc = parseBottomSheetItemFromError(result.response.data.message)
    if (doc) {
      doc.state = BottomSheetStatus.FAILED
      return {
        type: DocumentActionType.CREATE_DOCUMENT_ERROR,
        payload: doc
      }
    }
  }
  // Generic error toast
  else {
    displayToast(`Error uploading document: ${getEndpointError(result)}`, TOAST_TYPE.Error)
  }
  return {
    type: DocumentActionType.CREATE_DOCUMENT_ERROR,
    error,
    payload: item
  }
}

const parseBottomSheetItemFromError = (errMsg: string): BottomSheetItem => {
  try {
    return JSON.parse(errMsg) as BottomSheetItem
  } catch (e) {
    return undefined
  }
}

// GET
export const downloadDocumentsAsync: ActionCreator<ActionThunk> = (documentId: string, productId: string) => {
  return (dispatch, getState, api): Action => {
    let url = `${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents/${documentId}/content/`

    if (productId === 'tradeFinance') {
      url = `${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/${documentId}/content/`
    }

    return dispatch(
      api.get(url, {
        onError: downloadDocumentsError,
        onSuccess: downloadDocumentsSuccess
      })
    )
  }
}

export const downloadDocumentsSuccess: ActionCreator<DownloadDocumentSuccess> = (documents: any) => ({
  type: DocumentActionType.DOWNLOAD_DOCUMENT_SUCCESS,
  payload: documents
})

export const downloadDocumentsError: ActionCreator<DownloadDocumentError> = error => ({
  type: DocumentActionType.DOWNLOAD_DOCUMENT_ERROR,
  error
})

// DELETE

export const deleteDocumentAsync: ActionCreator<ActionThunk> = (
  productId: ProductId,
  documentId: string,
  onSuccess = deleteDocumentSuccess
) => {
  return (dispatch, getState, api): Action => {
    return dispatch(
      api.delete(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents/${documentId}`, {
        onError: deleteDocumentError,
        onSuccess
      })
    )
  }
}

export const deleteDocumentSuccess: ActionCreator<DeleteDocumentSuccess> = (document: Document) => {
  displayToast(`Document '${document.name}' deleted`, TOAST_TYPE.Ok)
  history.push('/documents')
  return {
    type: DocumentActionType.DELETE_DOCUMENT_SUCCESS,
    payload: document
  }
}

export const deleteDocumentSuccessWithoutPush: ActionCreator<DeleteDocumentSuccess> = (document: Document) => {
  displayToast(`Document '${document.name}' deleted`, TOAST_TYPE.Ok)
  return {
    type: DocumentActionType.DELETE_DOCUMENT_SUCCESS,
    payload: document
  }
}

export const deleteDocumentError: ActionCreator<DeleteDocumentError> = (error, errorObj) => {
  displayToast(`Error deleting document: ${getEndpointError(errorObj)}`, TOAST_TYPE.Error)
  return {
    type: DocumentActionType.DELETE_DOCUMENT_ERROR,
    error
  }
}

// GET BY ID
export const fetchDocumentAsync: ActionCreator<ActionThunk> = (
  productId: ProductId,
  documentId: string,
  isLcDocument: boolean
) => {
  return (dispatch, getState, api): Action => {
    let url = `${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents/${documentId}`

    // TODO: refactor this URL logic and extract to out side. configuration for container should be injected
    if (isLcDocument) {
      url = `${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/${documentId}`
    }

    return dispatch(
      api.get(url, {
        onError: fetchDocumentError,
        onSuccess: fetchDocumentSuccess
      })
    )
  }
}

export const fetchDocumentSuccess: ActionCreator<FetchDocumentSuccess> = (document: Document) => ({
  type: DocumentActionType.FETCH_DOCUMENT_SUCCESS,
  payload: document
})

export const fetchDocumentError: ActionCreator<FetchDocumentError> = error => ({
  type: DocumentActionType.FETCH_DOCUMENT_ERROR,
  error
})

export const fetchDocumentContentAsync: ActionCreator<ActionThunk> = (
  documentId: string,
  productId: ProductId,
  isLcDocument: boolean
) => {
  return (dispatch, getState, api): Action => {
    dispatch(startFetchingDocumentContent())
    let url = `${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents/${documentId}/content`
    url += `?printVersion=${true}`

    // TODO: refactor this URL logic and extract to out side. configuration for container should be injected
    if (isLcDocument) {
      url = `${TRADE_FINANCE_BASE_ENDPOINT}/lc/documents/${documentId}/content`
    }

    return dispatch(
      api.get(url, {
        responseType: 'arraybuffer',
        onError: fetchDocumentContentError,
        onSuccess: fetchDocumentContentSuccess
      })
    )
  }
}

export const startFetchingDocumentContent: ActionCreator<StartFetchingDocumentContent> = () => ({
  type: DocumentActionType.START_FETCHING_DOCUMENT_CONTENT
})

export const fetchDocumentContentSuccess: ActionCreator<FetchDocumentContentSuccess> = (
  responseData: any,
  headers: any
) => {
  return {
    type: DocumentActionType.FETCH_DOCUMENT_CONTENT_SUCCESS,
    payload: new Buffer(responseData, 'binary'),
    contentType: headers['content-type']
  }
}

export const fetchDocumentContentError: ActionCreator<FetchDocumentContentError> = error => ({
  type: DocumentActionType.FETCH_DOCUMENT_CONTENT_ERROR,
  error
})
//

/*******************************
 * Actions for managing document
 * and document type selections
 ******************************/

export const changeSelectDocument: ActionCreator<SelectDocument> = (selectedDocuments: string[]) => ({
  type: DocumentActionType.SELECT_DOCUMENT,
  payload: selectedDocuments
})

export const changeSelectDocumentType: ActionCreator<SelectDocumentType> = (selectedDocumentTypes: string[]) => ({
  type: DocumentActionType.SELECT_DOCUMENT_TYPE,
  payload: selectedDocumentTypes
})

export const changeDocumentFilter: ActionCreator<ChangeDocumentsFilter> = (filter: string, value: string) => ({
  type: DocumentActionType.CHANGE_DOCUMENT_FILTER,
  payload: {
    filter,
    value
  }
})

export const setDocumentListFilter: ActionCreator<SetDocumentsListFilter> = (filter: DocumentListFilter) => ({
  type: DocumentActionType.SET_DOCUMENT_LIST_FILTER,
  payload: filter
})

export const setCounterpartyDocsFilter: ActionCreator<SetCounterpartyDocsFilter> = (
  filter: CounterpartyDocumentFilter,
  counterpartyId?: string
) => ({
  type: DocumentActionType.SET_COUNTERPARTY_DOCS_FILTER,
  payload: filter ? { filter, counterpartyId } : null
})

export const setCounterpartyFilter: ActionCreator<SetCounterpartyFilter> = (filter: CounterpartyFilter) => ({
  type: DocumentActionType.SET_COUNTERPARTY_FILTER,
  payload: filter
})

export const resetDocumentsSelectData: ActionCreator<ResetDocumentsSelectData> = () => ({
  type: DocumentActionType.RESET_DOCUMENTS_SELECT_DATA
})

/**
 * Handles document selections
 * @param documentId string
 */
export const selectDocument: ActionCreator<any> = (documentId: string) => (
  dispatch: any,
  getState: () => ApplicationState
): Action => {
  const documentsState = getState().get('documents')
  const selectedDocuments = documentsState.get('selectedDocuments')
  const isDocumentAlreadySelected = isSelected(documentId, selectedDocuments)
  let newSelectedDocuments: string[] = []
  if (!isDocumentAlreadySelected) {
    newSelectedDocuments = [...selectedDocuments, documentId]
  } else {
    newSelectedDocuments = selectedDocuments.filter(selectedDocumentId => documentId !== selectedDocumentId)
  }
  return dispatch(changeSelectDocument(newSelectedDocuments))
}

export const bulkSelectDocuments: ActionCreator<any> = (...documentIds: string[]) => (
  dispatch: Dispatch<Action>,
  getState: () => ApplicationState
): Action => {
  const documentsState = getState().get('documents')
  const selectedSet = new Set(documentsState.get('selectedDocuments'))

  documentIds.forEach(id => (selectedSet.has(id) ? selectedSet.delete(id) : selectedSet.add(id)))
  return dispatch(changeSelectDocument(Array.from(selectedSet)))
}

/**
 * Handles document type selections
 * Handles document selection which is connected with document type
 * @param documentTypeId string
 */
export const selectDocumentType: ActionCreator<any> = (documentTypeId: string) => (
  dispatch: Dispatch<Action>,
  getState: () => ApplicationState
): Action => {
  const documentsState = getState().get('documents')
  const selectedDocumentTypes = documentsState.get('selectedDocumentTypes')
  const allDocuments = documentsState.get('allDocuments')
  const documentsFromDocumentType = allDocuments.filter(document => document.type.id === documentTypeId)
  let newSelectedDocumentTypes = [...selectedDocumentTypes]
  let newSelectedDocuments = [...documentsState.get('selectedDocuments')]
  if (isSelected(documentTypeId, newSelectedDocumentTypes)) {
    newSelectedDocumentTypes = newSelectedDocumentTypes.filter(typeId => typeId !== documentTypeId)
    newSelectedDocuments = removeMultipleDocumentsFromSelectedList(newSelectedDocuments, documentsFromDocumentType)
  } else {
    newSelectedDocumentTypes.push(documentTypeId)
    documentsFromDocumentType
      .filter(document => !isSelected(document.id, newSelectedDocuments))
      .forEach(document => newSelectedDocuments.push(document.id))
  }
  dispatch(changeSelectDocument(newSelectedDocuments))
  return dispatch(changeSelectDocumentType(newSelectedDocumentTypes))
}
