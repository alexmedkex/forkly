import { IPaginate, ImmutableMap } from '../../../utils/types'
import { Map, List } from 'immutable'

import { stringOrNull } from '../../../utils/types'
import { ITradeBase, ICargoBase, ITrade, ICargo } from '@komgo/types'

import { Action } from 'redux'
import { TradingRole } from '../../trades/constants'
import { Document } from '../../document-management'

export enum TradeActionType {
  TRADE_REQUEST = '@@trades/TRADE_REQUEST',
  TRADE_SUCCESS = '@@trades/TRADE_SUCCESS',
  TRADE_FAILURE = '@@trades/TRADE_FAILURE',
  TRADE_MOVEMENTS_REQUEST = '@@trades/TRADE_MOVEMENTS_REQUEST',
  TRADE_MOVEMENTS_SUCCESS = '@@trades/TRADE_MOVEMENTS_SUCCESS',
  TRADE_MOVEMENTS_FAILURE = '@@trades/TRADE_MOVEMENTS_FAILURE',
  TRADE_DOCUMENTS_REQUEST = '@@trades/TRADE_DOCUMENTS_REQUEST',
  TRADE_DOCUMENTS_SUCCESS = '@@trades/TRADE_DOCUMENTS_SUCCESS',
  TRADE_DOCUMENTS_FAILURE = '@@trades/TRADE_DOCUMENTS_FAILURE',
  TRADES_REQUEST = '@@trades/TRADES_REQUEST',
  TRADES_SUCCESS = '@@trades/TRADES_SUCCESS',
  TRADES_FAILURE = '@@trades/TRADES_FAILURE',
  TRADE_TOTAL_FETCHED = '@@trades/TRADE_TOTAL_FETCHED',
  SORT_TRADES = '@@trades/SORT_TRADES',
  FILTER_TRADING_ROLE = '@@trades/FILTER_TRADING_ROLE',
  CREATE_TRADE_REQUEST = '@@trades/CREATE_TRADE_REQUEST',
  CREATE_TRADE_FAILURE = '@@trades/CREATE_TRADE_FAILURE',
  CREATE_TRADE_SUCCESS = '@@trades/CREATE_TRADE_SUCCESS',
  UPLOAD_TRADE_DOCUMENT_REQUEST = '@@trades/UPLOAD_TRADE_DOCUMENT_REQUEST',
  UPLOAD_TRADE_DOCUMENT_SUCCESS = '@@trades/UPLOAD_TRADE_DOCUMENT_SUCCESS',
  UPLOAD_TRADE_DOCUMENT_FAILURE = '@@trades/UPLOAD_TRADE_DOCUMENT_FAILURE',
  EDIT_TRADE_REQUEST = '@@trades/EDIT_TRADE_REQUEST',
  EDIT_TRADE_FAILURE = '@@trades/EDIT_TRADE_FAILURE',
  EDIT_TRADE_SUCCESS = '@@trades/EDIT_TRADE_SUCCESS',
  DELETE_TRADE_REQUEST = '@@trades/DELETE_TRADE_REQUEST',
  DELETE_TRADE_FAILURE = '@@trades/DELETE_TRADE_FAILURE',
  DELETE_TRADE_SUCCESS = '@@trades/DELETE_TRADE_SUCCESS',
  CREATE_CARGO_REQUEST = '@@trades/CREATE_CARGO_REQUEST',
  CREATE_CARGO_FAILURE = '@@trades/CREATE_CARGO_FAILURE',
  CREATE_CARGO_SUCCESS = '@@trades/CREATE_CARGO_SUCCESS',
  EDIT_CARGO_REQUEST = '@@trades/EDIT_CARGO_REQUEST',
  EDIT_CARGO_FAILURE = '@@trades/EDIT_CARGO_FAILURE',
  EDIT_CARGO_SUCCESS = '@@trades/EDIT_CARGO_SUCCESS',
  DELETE_CARGO_REQUEST = '@@trades/DELETE_CARGO_REQUEST',
  DELETE_CARGO_FAILURE = '@@trades/DELETE_CARGO_FAILURE',
  DELETE_CARGO_SUCCESS = '@@trades/DELETE_CARGO_SUCCESS',
  DELETE_TRADE_DOCUMENT_REQUEST = '@@trades/DELETE_TRADE_DOCUMENT_REQUEST',
  DELETE_TRADE_DOCUMENT_SUCCESS = '@@trades/DELETE_TRADE_DOCUMENT_SUCCESS',
  DELETE_TRADE_DOCUMENT_FAILURE = '@@trades/DELETE_TRADE_DOCUMENT_FAILURE'
}

export interface CreateTradeDocumentRequest {
  context: TradeDocumentContext
  name: string
  categoryId: string
  documentTypeId: string
  file: File
  owner: {
    firstName: string
    lastName: string
    companyId: string
  }
}

export interface TradeDocumentContext extends DocumentContextBase {
  vaktId: string
}

export interface DocumentContextBase {
  productId: string
  subProductId: string
}

export interface TradeStateProperties {
  trades: Map<string, ITrade>
  tradeDocuments: List<Document>
  tradeMovements: List<ICargo>
  tradeIds: List<string>
  totals: Map<string, number>
  error: stringOrNull
  confirmError: stringOrNull
}

export interface TableSortParams {
  column: keyof ITradeEnriched
  direction: number
}

export interface TableFilterParams {
  role: TradingRole
  company: string
}

export interface IPaymentsTerms {
  eventBase: string
  when: string
  time: number
  timeUnit: string
  dayType: string
}

export interface IPeriod {
  startDate: string | number | Date
  endDate: string | number | Date
}
export interface ITradeEnriched extends ITrade {
  buyerName?: string
  sellerName?: string
  tradingRole?: TradingRole
}

export interface ITradeDocument {
  _id?: string
  id?: string
  name: string
  categoryId?: string
  typeId: string
  file: File
  fileName: string
  fileType: string
}

export interface ICreateOrUpdateTrade {
  trade: ITradeEnriched
  cargo: ICargo
  documents: ITradeDocument[]
  lawOther?: string
  commodityOther?: string
  eventBaseOther?: string
  deliveryTermsOther?: string
}

export interface IActor {
  id: string
  key: string
}

export type TradeState = ImmutableMap<TradeStateProperties>

export interface TradesReceivedAction extends Action {
  meta: any
  type: TradeActionType.TRADES_SUCCESS
  payload: IPaginate<ITrade>
}

export interface TradeReceivedAction extends Action {
  type: TradeActionType.TRADE_SUCCESS
  payload: ITrade
}

export interface TradeTotalsAction extends Action {
  meta: any
  type: TradeActionType.TRADE_TOTAL_FETCHED
  payload: IPaginate<ITrade>
}

export interface TradesMovementsReceivedAction extends Action {
  type: TradeActionType.TRADE_MOVEMENTS_SUCCESS
  payload: ICargo[]
}

export interface TradesError extends Action {
  type: TradeActionType.TRADES_FAILURE | TradeActionType.TRADE_FAILURE | TradeActionType.TRADE_MOVEMENTS_FAILURE
  payload: stringOrNull
}

export interface SortTrades extends Action {
  type: TradeActionType.SORT_TRADES
  payload: TableSortParams
}

export interface FilterTradingRole extends Action {
  type: TradeActionType.FILTER_TRADING_ROLE
  payload: TableFilterParams
}

export interface CreateTradeError extends Action {
  type: TradeActionType.CREATE_TRADE_FAILURE
  payload: stringOrNull
}

export interface CreateCargoError extends Action {
  type: TradeActionType.CREATE_CARGO_FAILURE
  payload: stringOrNull
}

export interface TradeSuccessfullyCreated extends Action {
  type: TradeActionType.CREATE_TRADE_SUCCESS
  payload: string
}

export interface DeleteTradeError extends Action {
  type: TradeActionType.DELETE_TRADE_FAILURE
  payload: string
}

export interface EditTradeError extends Action {
  type: TradeActionType.EDIT_TRADE_FAILURE
  payload: string
}

export interface EditCargoError extends Action {
  type: TradeActionType.EDIT_CARGO_FAILURE
  payload: string
}

export type TradeAction =
  | TradesReceivedAction
  | TradesError
  | SortTrades
  | FilterTradingRole
  | TradeReceivedAction
  | TradesMovementsReceivedAction
  | TradeTotalsAction
  | CreateTradeError
  | TradeSuccessfullyCreated
  | DeleteTradeError
  | EditTradeError
