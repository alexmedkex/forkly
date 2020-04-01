import { Action } from 'redux'
import { ImmutableMap } from '../../../utils/types'
import { IX500Name } from '@komgo/types'

// Actions types
export enum CounterpartiesActionType {
  FETCH_CONNECTED_COUNTERPARTIES_REQUEST = '@@counterparties/FETCH_CONNECTED_COUNTERPARTIES_REQUEST',
  FETCH_CONNECTED_COUNTERPARTIES_SUCCESS = '@@counterparties/FETCH_CONNECTED_COUNTERPARTIES_SUCCESS',
  FETCH_CONNECTED_COUNTERPARTIES_FAILURE = '@@counterparties/FETCH_CONNECTED_COUNTERPARTIES_FAILURE',
  FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST = '@@counterparties/FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST',
  FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS = '@@counterparties/FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS',
  FETCH_NOT_CONNECTED_COUNTERPARTIES_FAILURE = '@@counterparties/FETCH_NOT_CONNECTED_COUNTERPARTIES_FAILURE',
  ADD_COUNTERPARTY_REQUEST = '@@counterparties/ADD_COUNTERPARTY_REQUEST',
  ADD_COUNTERPARTY_SUCCESS = '@@counterparties/ADD_COUNTERPARTY_SUCCESS',
  ADD_COUNTERPARTY_FAILURE = '@@counterparties/ADD_COUNTERPARTY_FAILURE',
  FETCH_COUNTERPARTY_REQ_REQUEST = '@@counterparties/FETCH_COUNTERPARTY_REQ_REQUEST',
  FETCH_COUNTERPARTY_REQ_SUCCESS = '@@counterparties/FETCH_COUNTERPARTY_REQ_SUCCESS',
  FETCH_COUNTERPARTY_REQ_FAILURE = '@@counterparties/FETCH_COUNTERPARTY_REQ_FAILURE',
  RESEND_COUNTERPARTY_REQUEST = '@@counterparties/RESEND_COUNTERPARTY_REQUEST',
  RESEND_COUNTERPARTY_SUCCESS = '@@counterparties/RESEND_COUNTERPARTY_SUCCESS',
  RESEND_COUNTERPARTY_FAILURE = '@@counterparties/RESEND_COUNTERPARTY_FAILURE',
  RESPONSE_ON_COUNTERPARTY_REQ_REQUEST = '@@counterparties/RESPONSE_ON_COUNTERPARTY_REQ_REQUEST',
  RESPONSE_ON_COUNTERPARTY_REQ_SUCCESS = '@@counterparties/RESPONSE_ON_COUNTERPARTY_REQ_SUCCESS',
  RESPONSE_ON_COUNTERPARTY_REQ_FAILURE = '@@counterparties/RESPONSE_ON_COUNTERPARTY_REQ_FAILURE',
  SEARCH_COUNTERPARTY = '@@counterparties/SEARCH_COUNTERPARTY',
  SORT_CONNECTED_COUNTERPARTIES = '@@counterparties/SORT_CONNECTED_COUNTERPARTIES',
  SET_ADD_COUNTERPARTIES = '@@counterparties/SET_ADD_COUNTERPARTIES',
  SET_COUNTERPARTY_MODAL = '@@counterparties/SET_COUNTERPARTY_MODAL',
  SET_REQUEST_ACTION = '@@counterparties/SET_REQUEST_ACTION',
  FETCH_COUNTERPARTY_PROFILE_REQUEST = '@@counterparties/FETCH_COUNTERPARTY_PROFILE_REQUEST',
  FETCH_COUNTERPARTY_PROFILE_SUCCESS = '@@counterparties/FETCH_COUNTERPARTY_PROFILE_SUCCESS',
  FETCH_COUNTERPARTY_PROFILE_FAILURE = '@@counterparties/FETCH_COUNTERPARTY_PROFILE_FAILURE',
  UPDATE_COUNTERPARTY_PROFILE_REQUEST = '@@counterparties/UPDATE_COUNTERPARTY_PROFILE_REQUEST',
  UPDATE_COUNTERPARTY_PROFILE_SUCCESS = '@@counterparties/UPDATE_COUNTERPARTY_PROFILE_SUCCESS',
  UPDATE_COUNTERPARTY_PROFILE_FAILURE = '@@counterparties/UPDATE_COUNTERPARTY_PROFILE_FAILURE',
  CREATE_COUNTERPARTY_PROFILE_REQUEST = '@@counterparties/CREATE_COUNTERPARTY_PROFILE_REQUEST',
  CREATE_COUNTERPARTY_PROFILE_SUCCESS = '@@counterparties/CREATE_COUNTERPARTY_PROFILE_SUCCESS',
  CREATE_COUNTERPARTY_PROFILE_FAILURE = '@@counterparties/CREATE_COUNTERPARTY_PROFILE_FAILURE'
}

// State
export interface CounterpartiesStateFields {
  counterpartiesSearch: string
  counterparties: Counterparty[]
  counterpartiesSort: Sort
  notConnectedCounterpartySearch: string
  notConnectedCounterparties: NotConnectedCounterparty[]
  addCounterparties: string[]
  isAddModalOpen: boolean
  requestResponseActionStatus: boolean
  counterpartyRequest: CounterpartyRequest | null
  counterpartyProfiles: Map<string, CounterpartyProfile>
}

// Immutable state
export type CounterpartiesState = ImmutableMap<CounterpartiesStateFields>

export enum CouneterpartyStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  WAITING = 'WAITING'
}

export const CouneterpartyStatusText: { [key: string]: string } = {
  [CouneterpartyStatus.COMPLETED]: 'Completed',
  [CouneterpartyStatus.PENDING]: 'Request pending',
  [CouneterpartyStatus.WAITING]: 'Action Required'
}

// Data types
export interface Counterparty {
  isFinancialInstitution: boolean
  staticId: string
  isMember: boolean
  x500Name: IX500Name
  covered: boolean
  status?: string
  timestamp?: Date
  profile?: CounterpartyProfile
}

export interface CounterpartyRequest extends Counterparty {
  requestId: string
}

export interface CompanyInfo {
  CN: string
  O: string
  C: string
  L: string
  STREET: string
  PC: string
}

export interface NotConnectedCounterparty {
  staticId: string
  isMember: boolean
  x500Name: CompanyInfo
  status?: CouneterpartyStatus
}

export interface SearchCounterpartyPayload {
  search: string
  typeCounterparty: 'counterpartiesSearch' | 'notConnectedCounterpartySearch'
}

export interface Sort {
  column: string
  order: 'ascending' | 'descending' | ''
}

export interface ModalPayload {
  name: 'isAddModalOpen'
  value: boolean
}

export interface CounterpartyProfile {
  id: string
  counterpartyId: string
  riskLevel: RiskLevel
  renewalDate: string
  managedById: string
}

export enum RiskLevel {
  unspecified = '',
  low = 'low',
  medium = 'medium',
  high = 'high'
}

// Actions
export interface FetchCounterpartiesSuccess extends Action {
  payload: Counterparty[]
  type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS
}

export interface FetchCounterpartiesError extends Action {
  type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_FAILURE
  payload: string
}

export interface FetchNotConnectedCounterpartiesSuccess extends Action {
  payload: NotConnectedCounterparty[]
  type: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS
}

export interface FetchNotConnectedCounterpartiesError extends Action {
  type: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_FAILURE
  payload: string
}

export interface RequestFetchSuccess extends Action {
  type: CounterpartiesActionType.FETCH_COUNTERPARTY_REQ_SUCCESS
  payload: any
}

export interface SearchCounterparty extends Action {
  type: CounterpartiesActionType.SEARCH_COUNTERPARTY
  payload: SearchCounterpartyPayload
}

export interface SortConnectedCounterparties extends Action {
  type: CounterpartiesActionType.SORT_CONNECTED_COUNTERPARTIES
  payload: Sort
}

export interface AddCounterpartySuccess extends Action {
  type: CounterpartiesActionType.ADD_COUNTERPARTY_SUCCESS
  payload: string[]
}

export interface SetCounterpartyModal extends Action {
  type: CounterpartiesActionType.SET_COUNTERPARTY_MODAL
  payload: ModalPayload
}

export interface SetAddCounterparties extends Action {
  type: CounterpartiesActionType.SET_ADD_COUNTERPARTIES
  payload: string[]
}

export interface CounterPartyResponseAction extends Action {
  type: CounterpartiesActionType.SET_REQUEST_ACTION
  payload: {
    status: boolean
  }
}

export interface FetchCounterpartyProfileSuccess extends Action {
  type: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_SUCCESS
  payload: CounterpartyProfile
}

export interface FetchCounterpartyProfileFailure extends Action {
  type: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_FAILURE
  payload: {
    error: any
    counterpartyId: string
  }
}

export interface CreateCounterpartyProfileSuccess extends Action {
  type: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_SUCCESS
  payload: CounterpartyProfile
}

export interface UpdateCounterpartyProfileSuccess extends Action {
  type: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_SUCCESS
  payload: CounterpartyProfile
}

// All actions
export type CounterpartiesAction =
  | FetchCounterpartiesSuccess
  | FetchCounterpartiesError
  | RequestFetchSuccess
  | SetCounterpartyModal
  | FetchNotConnectedCounterpartiesError
  | FetchNotConnectedCounterpartiesSuccess
  | SearchCounterparty
  | SortConnectedCounterparties
  | AddCounterpartySuccess
  | SetAddCounterparties
  | CounterPartyResponseAction
  | FetchCounterpartyProfileSuccess
  | FetchCounterpartyProfileFailure
  | CreateCounterpartyProfileSuccess
  | UpdateCounterpartyProfileSuccess
