import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { toast } from 'react-toastify'
import _ from 'lodash'

import { HttpRequest } from '../../../utils/http'

import {
  TradeActionType,
  TableSortParams,
  SortTrades,
  FilterTradingRole,
  TableFilterParams,
  CreateTradeError,
  ICreateOrUpdateTrade,
  DeleteTradeError,
  EditTradeError,
  EditCargoError,
  CreateTradeDocumentRequest,
  ITradeDocument,
  CreateCargoError,
  TradeDocumentContext
} from './types'

import { TRADE_CARGO_BASE_ENDPOINT, DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { fetchLettersOfCredit } from '../../letter-of-credit-legacy/store/actions'
import { stringOrNull } from '../../../utils/types'
import { history } from '../../../store/history'
import { TradingRole, initialCargoData } from '../constants'
import { formatCargoData, formatCargoDates, formatDocuments } from '../utils/formatters'
import { ApplicationState } from '../../../store/reducers'
import { DocumentResponse } from '../../document-management'
import { getEndpointError } from '../../../utils/error-handler'
import { ToastContainerIds } from '../../../utils/toast'
import { User, ActionCreatorChainHandler, IPaginate } from '../../../store/common/types'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { Products } from '../../document-management/constants/Products'
import { TradeSource, CreditRequirements, ITrade, ICargo } from '@komgo/types'
import { fetchRdsByStaticIds } from '../../receivable-discounting-legacy/store/application/actions'
import { fetchStandByLettersOfCredit } from '../../standby-letter-of-credit-legacy/store/actions'
import { isCargoDataEntered } from '../utils/tradeActionUtils'
import {
  TRADE_EDITED_MESSAGE,
  TRADE_CREATED_MESSAGE,
  TRADE_AND_CARGO_EDITED_MESSAGE,
  TRADE_DELETED_MESSAGE
} from '../constants'
import { fetchLettersOfCreditByType } from '../../letter-of-credit/store/actions'

export type TradeActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const getTrade: ActionCreator<TradeActionThunk> = (id: string) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades/${id}`, {
      type: TradeActionType.TRADE_REQUEST,
      onSuccess: TradeActionType.TRADE_SUCCESS,
      onError: TradeActionType.TRADE_FAILURE
    })
  )
}

export interface FindCargoBySourceAndSourceId {
  source: TradeSource
  filter: {
    projection: any | undefined
    options: any | undefined
    query: {
      source: TradeSource
      sourceId: string
    }
  }
}

export const fetchMovements: ActionCreator<TradeActionThunk> = (tradeId: string) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades/${tradeId}/movements`, {
      type: TradeActionType.TRADE_MOVEMENTS_REQUEST,
      onSuccess: TradeActionType.TRADE_MOVEMENTS_SUCCESS,
      onError: TradeActionType.TRADE_MOVEMENTS_FAILURE
    })
  )
}

export const fetchCargos: ActionCreator<TradeActionThunk> = (
  params: FindCargoBySourceAndSourceId,
  afterHandler: ActionCreator<TradeActionThunk>
) => (dispatch, getState, api): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/movements`, {
      type: TradeActionType.TRADE_MOVEMENTS_REQUEST,
      onSuccess: {
        type: TradeActionType.TRADE_MOVEMENTS_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher } = store
          return afterHandler && afterHandler(params)(dispatcher, _ as any, api)
        }
      },
      onError: TradeActionType.TRADE_MOVEMENTS_FAILURE,
      params
    })
  )
}

export const fetchTradeDocuments: ActionCreator<TradeActionThunk> = (sourceId: string) => (
  dispatch,
  _,
  api
): Action => {
  const productId = Products.TradeFinance
  const context = encodeURIComponent(JSON.stringify(createDocumentContext(sourceId)))

  const options = `context=${context}`

  return dispatch(
    api.get(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/documents?${options}`, {
      type: TradeActionType.TRADE_DOCUMENTS_REQUEST,
      onSuccess: TradeActionType.TRADE_DOCUMENTS_SUCCESS,
      onError: TradeActionType.TRADE_DOCUMENTS_FAILURE
    })
  )
}

export interface FindTradeBySourceAndSourceId {
  source: TradeSource
  filter: {
    projection: any | undefined
    options: any
    query: {
      source: TradeSource
      sourceId: string
    }
  }
}

export const fetchTrades: ActionCreator<TradeActionThunk> = (
  params: FindTradeBySourceAndSourceId,
  afterHandler: ActionCreator<TradeActionThunk>
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades`, {
      type: TradeActionType.TRADES_REQUEST,
      params,
      onSuccess: {
        type: TradeActionType.TRADES_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher } = store
          return afterHandler && afterHandler(params)(dispatcher, _ as any, api)
        }
      },
      onError: TradeActionType.TRADES_FAILURE
    })
  )
}

export const fetchTradesWithCargos: ActionCreator<TradeActionThunk> = (params: FindTradeBySourceAndSourceId) => (
  dispatch,
  _,
  api
): Action => {
  return fetchTrades(params, fetchCargos)(dispatch, _, api)
}

export const fetchRdsFromTrades: ActionCreator<TradeActionThunk> = (trades: ITrade[], polling: boolean = false) => (
  dispatcher,
  _,
  api
): Action => {
  // NOTE - we are currenly skipping filter with tradeIds as this causes issues with request size
  // without pagination, fetching RDs for all trades is like fetching without filters
  // const rdFilter: IFetchMultipleReceivableDiscountFilter = {
  //   tradeSourceIds: trades.filter(t => t.creditRequirement === CreditRequirements.OpenCredit).map(t => t.sourceId)
  // }
  return fetchRdsByStaticIds(undefined, polling)(dispatcher, _ as any, api)
}

export const fetchTradesWithRd: ActionCreator<TradeActionThunk> = (company: string) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades`, {
      type: TradeActionType.TRADES_REQUEST,
      params: {
        filter: {
          projection: {},
          options: {},
          query: { seller: company }
        }
      },
      onSuccess: {
        type: TradeActionType.TRADES_SUCCESS,
        afterHandler: store => {
          const { getState, dispatch: dispatcher } = store
          const trades: ITrade[] = getState()
            .get('trades')
            .get('trades')
            .toList()
            .toJS()
          return fetchRdsFromTrades(trades)(dispatcher, _ as any, api)
        }
      },
      onError: TradeActionType.TRADES_FAILURE
    })
  )
}

export const fetchTradesDashboardData: ActionCreator<TradeActionThunk> = (params: any = {}) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades`, {
      type: TradeActionType.TRADES_REQUEST,
      params,
      onSuccess: {
        type: TradeActionType.TRADES_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          const trades: ITrade[] = getState()
            .get('trades')
            .get('trades')
            .toList()
            .toJS()

          // RDs
          fetchRdsFromTrades(trades)(dispatcher, _ as any, api)

          // L/Cs

          let requestedTradeId
          if (params && params.filter && params.filter.query._id) {
            requestedTradeId = params.filter.query._id
          }

          const filter = {
            // NOTE - we are currenly skipping filter with tradeIds as this causes issues with request size
            // without pagination, fetching SBLCs for all trades is like fetching without filters
            // query: {
            //   'tradeAndCargoSnapshot.trade._id': { $in: requestedTradeId ? [requestedTradeId] : trades.map(t => t._id) }
            // },
            projection: {
              status: 1,
              _id: 1,
              'tradeAndCargoSnapshot.trade.deliveryPeriod': 1,
              'tradeAndCargoSnapshot.trade._id': 1,
              updatedAt: 1,
              'tradeAndCargoSnapshot.sourceId': 1
            }
          }

          const sblcFilter = {
            // NOTE - we are currenly skipping filter with tradeIds as this causes issues with request size
            // without pagination, fetching SBLCs for all trades is like fetching without filters
            // query: {
            //   'tradeId.sourceId': { $in: requestedTrade ? [requestedTrade.sourceId] : trades.map(t => t.sourceId) }
            // },
            projection: {
              status: 1,
              staticId: 1,
              _id: 1,
              tradeId: 1,
              updatedAt: 1
            }
          }

          const newSblcFilter = {
            projection: {
              'templateInstance.data.trade._id': 1,
              'templateInstance.data.trade.sourceId': 1,
              status: 1,
              staticId: 1,
              _id: 1,
              updatedAt: 1
            }
          }

          return Promise.all([
            fetchLettersOfCredit({ filter })(dispatcher, _ as any, api),
            fetchStandByLettersOfCredit({ filter: sblcFilter })(dispatcher, _ as any, api),
            fetchLettersOfCreditByType({ filter: newSblcFilter })(dispatcher, _ as any, api)
          ])
        }
      },
      onError: TradeActionType.TRADES_FAILURE
    })
  )
}

export const getTradeWithMovements: ActionCreator<TradeActionThunk> = (params: { id: string }) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades/${params.id}`, {
      type: TradeActionType.TRADE_REQUEST,
      onError: TradeActionType.TRADE_FAILURE,
      onSuccess: {
        type: TradeActionType.TRADE_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher } = store
          return fetchMovements(params.id)(dispatcher, _ as any, api)
        }
      }
    })
  )
}

export const fetchTradeWithDocuments: ActionCreator<TradeActionThunk> = (id: string) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades/${id}`, {
      type: TradeActionType.TRADE_REQUEST,
      onError: TradeActionType.TRADE_FAILURE,
      onSuccess: {
        type: TradeActionType.TRADE_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          const trade: ITrade = getState()
            .get('trades')
            .get('trades')
            .toJS()[id]
          return fetchTradeDocuments(trade.sourceId)(dispatcher, _ as any, api)
        }
      }
    })
  )
}

export const sortBy: ActionCreator<SortTrades> = (params: TableSortParams) => ({
  type: TradeActionType.SORT_TRADES,
  payload: params
})

export const filterTradingRole: ActionCreator<FilterTradingRole> = (params: TableFilterParams) => ({
  type: TradeActionType.FILTER_TRADING_ROLE,
  payload: params
})

interface ICreateTradeResponse {
  sourceId: string
}

export const createTrade: ActionCreator<TradeActionThunk> = (
  values: ICreateOrUpdateTrade,
  profile: User,
  role: TradingRole = TradingRole.BUYER
) => (dispatch, _, api): Action => {
  const {
    documents,
    cargo,
    trade: { sourceId, ...tradeToUpdate }
  } = values

  const shouldSaveCargo = isCargoDataEntered(cargo)

  // const  =
  dispatch(setCreateTradeError(null))
  return dispatch(
    api.post(`${TRADE_CARGO_BASE_ENDPOINT}/trades`, {
      type: TradeActionType.CREATE_TRADE_REQUEST,
      data: tradeToUpdate,
      onSuccess: shouldSaveCargo
        ? ({ sourceId }: ICreateTradeResponse) => ({
            type: TradeActionType.CREATE_TRADE_SUCCESS,
            afterHandler: store => {
              const { dispatch: dispatcher } = store
              return createCargo(formatCargoData(values.cargo, sourceId), true, documents, sourceId, profile, role)(
                dispatcher,
                _ as any,
                api
              )
            }
          })
        : documents && documents.length > 0
          ? ({ sourceId }: ICreateTradeResponse) => ({
              type: TradeActionType.CREATE_TRADE_SUCCESS,
              afterHandler: store => {
                const { dispatch: dispatcher } = store
                return createTradeDocumentsAsync(documents, sourceId, profile, 0, false, role)(
                  dispatcher,
                  _ as any,
                  api
                )
              }
            })
          : () => tradeCreateEditSuccess(TRADE_CREATED_MESSAGE, TradeActionType.CREATE_TRADE_SUCCESS, role),
      onError: setCreateTradeError
    })
  )
}

const tradeCreateEditSuccess = (
  message: string,
  type: TradeActionType,
  role: TradingRole = TradingRole.BUYER,
  returnURL?: string
): Action => {
  returnURL ? history.push(returnURL) : history.push(`/trades?tradingRole=${role}`)

  toast.success(message, { containerId: ToastContainerIds.Default })
  return { type }
}

export const setCreateTradeError: ActionCreator<CreateTradeError> = (error: stringOrNull) => {
  return {
    type: TradeActionType.CREATE_TRADE_FAILURE,
    payload: error
  }
}

// TODO: Handle upload of documents in parallel instead of after cargo
const createCargo: ActionCreator<TradeActionThunk> = (
  values: ICargo,
  isTradeCreate: boolean,
  documents?: ITradeDocument[],
  sourceId?: string,
  profile?: User,
  role: TradingRole = TradingRole.BUYER
) => (dispatch, _, api): Action => {
  const successMessage = isTradeCreate ? TRADE_CREATED_MESSAGE : TRADE_EDITED_MESSAGE
  return dispatch(
    api.post(`${TRADE_CARGO_BASE_ENDPOINT}/movements`, {
      type: TradeActionType.CREATE_CARGO_REQUEST,
      data: values,
      onSuccess:
        documents && documents.length > 0
          ? {
              type: TradeActionType.CREATE_CARGO_SUCCESS,
              afterHandler: store => {
                const { dispatch: dispatcher } = store
                return createTradeDocumentsAsync(documents, sourceId, profile, 0, false, role)(
                  dispatcher,
                  _ as any,
                  api
                )
              }
            }
          : () => tradeCreateEditSuccess(successMessage, TradeActionType.CREATE_CARGO_SUCCESS, role),
      onError: (error: string, response: any) => setCreateCargoError(error, response, role)
    })
  )
}

const setCreateCargoError: ActionCreator<CreateCargoError> = (
  error: stringOrNull,
  role: TradingRole = TradingRole.BUYER
) => {
  history.push(`/trades?tradingRole=${role}`)

  return {
    type: TradeActionType.CREATE_CARGO_FAILURE,
    payload: error
  }
}

/**
 * createTradeDocumentsAsync will print message trade created in case of success and
 * because of that we need flag (isTradeUpdate) to know if we call this function from editTrade since we don't need that message
 */
const createTradeDocumentsAsync: ActionCreator<TradeActionThunk> = (
  documents: ITradeDocument[],
  sourceId: string,
  profile: User,
  currIndex: number,
  isTradeUpdate: boolean = false,
  role: TradingRole = TradingRole.BUYER
) => {
  const documentRequest: CreateTradeDocumentRequest = createDocumentRequest(documents[currIndex], sourceId, profile)

  return (dispatch: any, getState: () => ApplicationState, api: any) => {
    const productId = Products.TradeFinance
    const categoryId = documentRequest.categoryId
    const typeId = documentRequest.documentTypeId

    const extraData = {
      name: documentRequest.name,
      categoryId,
      typeId,
      context: documentRequest.context,
      metadata: [{ name: '42r', value: `${Math.random()}` }],
      owner: documentRequest.owner
    }

    const formData = new FormData()
    formData.set('extraData', JSON.stringify(extraData))
    formData.append('fileData', documentRequest.file)

    return dispatch(
      api.post(`${DOCUMENTS_BASE_ENDPOINT}/products/${productId}/categories/${categoryId}/types/${typeId}/documents`, {
        type: TradeActionType.UPLOAD_TRADE_DOCUMENT_REQUEST,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        onSuccess: (document: DocumentResponse) => {
          uploadTradeDocumentSuccess(document)
          if (currIndex === documents.length - 1) {
            if (isTradeUpdate) {
              return { type: TradeActionType.UPLOAD_TRADE_DOCUMENT_SUCCESS }
            }
            return tradeCreateEditSuccess(TRADE_CREATED_MESSAGE, TradeActionType.UPLOAD_TRADE_DOCUMENT_SUCCESS, role)
          } else {
            return {
              type: TradeActionType.UPLOAD_TRADE_DOCUMENT_SUCCESS,
              afterHandler: store => {
                const { dispatch: dispatcher } = store
                return createTradeDocumentsAsync(documents, sourceId, profile, currIndex + 1, isTradeUpdate, role)(
                  dispatcher,
                  _ as any,
                  api
                )
              }
            }
          }
        },
        onError: (error: string, response: any) => uploadTradeDocumentError(error, response, role)
      })
    )
  }
}

export const deleteDocuments = (document: ITradeDocument) => (
  dispatch: any,
  getState: () => ApplicationState,
  api: any
) => {
  return dispatch(
    api.delete(`${DOCUMENTS_BASE_ENDPOINT}/products/${Products.TradeFinance}/documents/${document.id}`, {
      type: TradeActionType.DELETE_TRADE_DOCUMENT_REQUEST,
      onSuccess: () => {
        toast.success(`${document.name} removed from trade`, { containerId: ToastContainerIds.Default })
        return TradeActionType.DELETE_TRADE_DOCUMENT_SUCCESS
      },
      onError: TradeActionType.DELETE_TRADE_DOCUMENT_FAILURE
    })
  )
}

const createDocumentRequest = (
  document: ITradeDocument,
  sourceId: string,
  profile: User
): CreateTradeDocumentRequest => {
  return {
    context: createDocumentContext(sourceId),
    categoryId: document.categoryId,
    documentTypeId: document.typeId,
    file: document.file,
    name: document.name,
    owner: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyId: profile.company
    }
  }
}

const createDocumentContext = (sourceId: string): TradeDocumentContext => {
  return {
    productId: Products.TradeFinance,
    subProductId: SubProducts.Trade,
    vaktId: sourceId // still using vaktId as currently in api-document the Document Context uses vaktId on subProductId trade. should be renamed in the future
  }
}

const uploadTradeDocumentSuccess = (document: DocumentResponse) => {
  toast.success(`${document.name} added to trade`, { containerId: ToastContainerIds.Default })
}

const uploadTradeDocumentError = (error: string, response: any, role: TradingRole = TradingRole.BUYER) => {
  history.push(`/trades?tradingRole=${role}`)

  // Handle specific errors or fallback to a generic error toast
  // HTTP 413 - Request Entity Too Large
  // This may happen when a user tries to upload a document that exceeds body size limits
  // This is enforced by api-gateway (nginx) and current limit is 200mb
  if (response && response.response && response.response.status === 413) {
    toast.error('Uploaded file has achieved the size limit', { containerId: ToastContainerIds.Default })
  }
  // Generic error toast
  else {
    toast.error(`Error uploading document: ${getEndpointError(response)}`, { containerId: ToastContainerIds.Default })
  }
  return {
    type: TradeActionType.UPLOAD_TRADE_DOCUMENT_FAILURE,
    error
  }
}

export const editTrade: ActionCreator<TradeActionThunk> = (
  id: string,
  values: ICreateOrUpdateTrade,
  sourceId: string,
  profile: User,
  role: TradingRole = TradingRole.BUYER,
  returnURL?: string
) => (dispatch, getState, api): Action => {
  dispatch({
    type: TradeActionType.EDIT_TRADE_FAILURE,
    payload: null
  })

  // Cargo
  const tradeMovements = getState()
    .get('trades')
    .get('tradeMovements')
    .toJS()
  let oldCargo = formatCargoData({ ...values.cargo, ...initialCargoData }, sourceId)
  if (tradeMovements[0]) {
    oldCargo = formatCargoData(formatCargoDates(tradeMovements[0]), sourceId)
  }
  const newCargo = formatCargoData(values.cargo, sourceId)

  // Documents
  const uploadedDocuments = getState()
    .get('trades')
    .get('tradeDocuments')
    .toJS()
  const oldDocuments = formatDocuments(uploadedDocuments)
  const newDocuments = values.documents

  const updateCargo = !_.isEqual({ ...newCargo, cargoId: '' }, { ...oldCargo, cargoId: '' }) // skip cargoId check since it can't be changed, not entered now for new cargos
  const updateDocuments = !_.isEqual(oldDocuments, newDocuments)

  return dispatch(
    api.put(`${TRADE_CARGO_BASE_ENDPOINT}/trades/${id}`, {
      type: TradeActionType.EDIT_TRADE_REQUEST,
      data: values.trade,
      onSuccess: () => {
        // If cargo should be updated continue and update cargo
        if (updateCargo) {
          if (!oldCargo.cargoId) {
            createCargo(newCargo, false)(dispatch, getState, api)
          } else if (!newCargo.cargoId) {
            deleteCargo(tradeMovements[0].cargoId, tradeMovements[0].source, role)(dispatch, getState, api)
          } else {
            editCargo({ ...tradeMovements[0], ...newCargo }, role, returnURL)(dispatch, getState, api)
          }
        }
        // If documents should be updated continue and update documents (remove/add document)
        if (updateDocuments) {
          const newDocumentsForUpload = newDocuments.filter(d => d.file)
          if (newDocumentsForUpload.length > 0) {
            createTradeDocumentsAsync(newDocumentsForUpload, sourceId, profile, 0, true, role)(dispatch, _ as any, api)
          }
          const deletedDocuments = findDeletedDocuments(oldDocuments, newDocuments)
          if (deletedDocuments.length > 0) {
            Promise.all(deletedDocuments.map(d => deleteDocuments(d)(dispatch, getState, api)))
          }
          if (!updateCargo) {
            toast.success(TRADE_EDITED_MESSAGE, { containerId: ToastContainerIds.Default })
            history.push(tradeURLorCustom(role, returnURL))
          }
        }
        if (!updateCargo && !updateDocuments) {
          return tradeCreateEditSuccess(TRADE_EDITED_MESSAGE, TradeActionType.EDIT_TRADE_SUCCESS, role, returnURL)
        }
        return { type: TradeActionType.EDIT_TRADE_SUCCESS }
      },
      onError: (err, errObj) => setEditTradeError(err, errObj, role)
    })
  )
}

const tradeURLorCustom = (role: TradingRole, returnURL?: string) =>
  returnURL ? returnURL : `/trades?tradingRole=${role}`

const findDeletedDocuments = (oldDocuments: ITradeDocument[], newDocuments: ITradeDocument[]) =>
  oldDocuments.filter(oldDocs => {
    const [newDocument] = newDocuments.filter(newDocs => newDocs.id === oldDocs.id)
    return newDocument ? false : true
  })

const setEditTradeError: ActionCreator<EditTradeError> = (error: stringOrNull) => ({
  type: TradeActionType.EDIT_TRADE_FAILURE,
  payload: error
})

const editCargo: ActionCreator<TradeActionThunk> = (
  values: ICargo,
  role: TradingRole = TradingRole.BUYER,
  returnURL: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.put(`${TRADE_CARGO_BASE_ENDPOINT}/movements/${values.cargoId}`, {
      type: TradeActionType.EDIT_CARGO_REQUEST,
      data: values,
      onSuccess: () =>
        tradeCreateEditSuccess(TRADE_AND_CARGO_EDITED_MESSAGE, TradeActionType.EDIT_CARGO_SUCCESS, role, returnURL),
      onError: error => setEditCargoError(error, role)
    })
  )
}

const setEditCargoError: ActionCreator<EditCargoError> = (error: stringOrNull) => {
  return {
    type: TradeActionType.EDIT_CARGO_FAILURE,
    payload: error
  }
}

export const deleteCargo: ActionCreator<TradeActionThunk> = (
  id: string,
  source: string,
  role: TradingRole = TradingRole.BUYER,
  returnURL: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.delete(`${TRADE_CARGO_BASE_ENDPOINT}/movements/${id}?source=${source}`, {
      type: TradeActionType.DELETE_CARGO_REQUEST,
      onSuccess: () =>
        tradeCreateEditSuccess(TRADE_EDITED_MESSAGE, TradeActionType.DELETE_CARGO_SUCCESS, role, returnURL),
      onError: TradeActionType.DELETE_CARGO_FAILURE
    })
  )
}

export const deleteTrade: ActionCreator<TradeActionThunk> = (
  id: string,
  source: string,
  role: TradingRole = TradingRole.BUYER
) => (dispatch, _, api): Action => {
  dispatch(deleteTradeError(null))
  return dispatch(
    api.delete(`${TRADE_CARGO_BASE_ENDPOINT}/trades/${id}`, {
      type: TradeActionType.DELETE_TRADE_REQUEST,
      onSuccess: () => deleteTradeSuccess(role),
      onError: (error, errObj) => deleteTradeError(error, errObj, role)
    })
  )
}

export const deleteTradeSuccess = (role: TradingRole = TradingRole.BUYER): Action => {
  history.push(`/trades?tradingRole=${role}`)
  toast.success(TRADE_DELETED_MESSAGE, { containerId: ToastContainerIds.Default })
  return { type: TradeActionType.DELETE_TRADE_SUCCESS }
}

export const deleteTradeError: ActionCreator<DeleteTradeError> = (error: stringOrNull) => {
  return {
    type: TradeActionType.DELETE_TRADE_FAILURE,
    payload: error
  }
}

export const fetchTradesBySourceId: ActionCreator<TradeActionThunk> = (
  source: TradeSource,
  sourceId: string,
  chainHandler?: ActionCreatorChainHandler<IPaginate<ITrade[]>, TradeActionThunk>
) => (dispatch, _, api): Action => {
  const params: FindTradeBySourceAndSourceId = {
    source,
    filter: {
      projection: undefined,
      options: {},
      query: {
        source,
        sourceId
      }
    }
  }
  return dispatch(
    api.get(`${TRADE_CARGO_BASE_ENDPOINT}/trades`, {
      type: TradeActionType.TRADES_REQUEST,
      params,
      onSuccess: (payload: IPaginate<ITrade[]>) => ({
        type: TradeActionType.TRADES_SUCCESS,
        meta: {
          params
        },
        payload,
        afterHandler: store => {
          return chainHandler && chainHandler(store, payload)
        }
      }),
      onError: TradeActionType.TRADES_FAILURE
    })
  )
}
