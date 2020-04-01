import {
  IParticipantRFPSummary,
  IQuoteBase,
  IRFPSummariesResponse,
  ParticipantRFPStatus,
  ICargo,
  ITrade,
  RDStatus,
  IHistory
} from '@komgo/types'
import { Map } from 'immutable'
import { Action } from 'redux'
import { ImmutableMap, stringOrNull } from '../../../utils/types'
import { Counterparty } from '../../counterparties/store/types'
import { DocumentContextBase } from '../../trades/store/types'

// Only use REQUEST/SUCCESS/FAILURE at the end of action type names
export enum ReceivableDiscountingActionType {
  CREATE_REQUEST_FOR_PROPOSAL_REQUEST = '@@receivable-discounting/CREATE_RFP_REQUEST',
  CREATE_REQUEST_FOR_PROPOSAL_SUCCESS = '@@receivable-discounting/CREATE_RFP_SUCCESS',
  CREATE_REQUEST_FOR_PROPOSAL_FAILURE = '@@receivable-discounting/CREATE_RFP_FAILURE',

  FETCH_RFP_SUMMARY_REQUEST = '@@receivable-discounting/FETCH_RFP_SUMMARY_REQUEST',
  FETCH_RFP_SUMMARY_SUCCESS = '@@receivable-discounting/FETCH_RFP_SUMMARY_SUCCESS',
  FETCH_RFP_SUMMARY_FAILURE = '@@receivable-discounting/FETCH_RFP_SUMMARY_FAILURE',

  CREATE_QUOTE_REQUEST = '@@receivable-discounting/CREATE_QUOTE_REQUEST',
  CREATE_QUOTE_SUCCESS = '@@receivable-discounting/CREATE_QUOTE_SUCCESS',
  CREATE_QUOTE_FAILURE = '@@receivable-discounting/CREATE_QUOTE_FAILURE',

  FETCH_PARTICIPANT_RFP_SUMMARY_REQUEST = '@@receivable-discounting/FETCH_PARTICIPANT_RFP_SUMMARY_REQUEST',
  FETCH_PARTICIPANT_RFP_SUMMARY_SUCCESS = '@@receivable-discounting/FETCH_PARTICIPANT_RFP_SUMMARY_SUCCESS',
  FETCH_PARTICIPANT_RFP_SUMMARY_FAILURE = '@@receivable-discounting/FETCH_PARTICIPANT_RFP_SUMMARY_FAILURE',

  FETCH_QUOTE_REQUEST = '@@receivable-discounting/FETCH_QUOTE_REQUEST',
  FETCH_QUOTE_SUCCESS = '@@receivable-discounting/FETCH_QUOTE_SUCCESS',
  FETCH_QUOTE_FAILURE = '@@receivable-discounting/FETCH_QUOTE_FAILURE',

  SUBMIT_QUOTE_REQUEST = '@@receivable-discounting/SUBMIT_QUOTE_REQUEST',
  SUBMIT_QUOTE_SUCCESS = '@@receivable-discounting/SUBMIT_QUOTE_SUCCESS',
  SUBMIT_QUOTE_FAILURE = '@@receivable-discounting/SUBMIT_QUOTE_FAILURE',

  REJECT_RFP_REQUEST = '@@receivable-discounting/REJECT_RFP_REQUEST',
  REJECT_RFP_SUCCESS = '@@receivable-discounting/REJECT_RFP_SUCCESS',
  REJECT_RFP_FAILURE = '@@receivable-discounting/REJECT_RFP_FAILURE',

  ACCEPT_QUOTE_REQUEST = '@@receivable-discounting/ACCEPT_QUOTE_REQUEST',
  ACCEPT_QUOTE_SUCCESS = '@@receivable-discounting/ACCEPT_QUOTE_SUCCESS',
  ACCEPT_QUOTE_FAILURE = '@@receivable-discounting/ACCEPT_QUOTE_FAILURE',

  FETCH_TRADE_HISTORY_REQUEST = '@@receivable-discounting/FETCH_TRADE_HISTORY_REQUEST',
  FETCH_TRADE_HISTORY_SUCCESS = '@@receivable-discounting/FETCH_TRADE_HISTORY_SUCCESS',
  FETCH_TRADE_HISTORY_FAILURE = '@@receivable-discounting/FETCH_TRADE_HISTORY_FAILURE'
}

export interface IMemberMarketSelectionItem {
  counterparty: Counterparty
  location: string
  appetite: string
  availability: string
  creditLimit: string
  riskFee: string
  margin: string
  maxTenor: string
}

export interface IReceivableDiscountingDashboardTrader {
  tradeTechnicalId: string
  rdId?: string
  tradeDate: string | number | Date
  tradeId: string
  counterparty: string
  bank: string
  commodity: string
  invoiceAmount?: string
  invoiceType?: string
  currency: string
  status: string
  rdStatus?: RDStatus
}

export interface IReceivableDiscountingDashboardBank {
  tradeId: string
  seller: string
  buyer: string
  paymentTerms: string
  rd: {
    status: RDStatus
    staticId: string
  }
  invoiceAmount: string
  invoiceType: string
  currency: string
  discountingDate: string | number | Date
  discountingDateType: string
  status: string
  requestDate: string
}

export interface IRFPRequestSummary {
  companyStaticId: string
  status: ParticipantRFPStatus
}

export interface ISubmitQuoteFormDetails extends IQuoteBase {
  comment?: string
  rdId: string
}

// Move to @komgo/types
export interface IRFPReply {
  rdId: string
  comment?: string
}

export interface IBankDeclineRFPFormDetails {
  comment?: string
}

export interface IFetchMultipleReceivableDiscountFilter {
  tradeSourceIds: string[]
}

export interface ICreateRequestForProposal {
  rdId: string
  participantStaticIds: string[]
}

export interface ITradeSnapshot {
  source: string
  sourceId: string
  trade: ITrade
  movements: ICargo[]
  createdAt?: string
  updatedAt?: string
}

// Move to @komgo/types
export interface IQuoteSubmission extends IRFPReply {
  quoteId: string
}

// Move to @komgo/types
export interface IQuoteAcceptSubmission extends IQuoteSubmission {
  participantStaticId: string
}

export interface RDDocumentContext extends DocumentContextBase {
  rdId: string
}

export interface CreateRequestForProposalError extends Action {
  type: ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_FAILURE
  payload: stringOrNull
}

export interface ReceivableDiscountingFetchedQuotesAction extends Action {
  type: ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS
  payload: IRFPSummariesResponse
  rdId: string
}

export interface ReceivableDiscountingFetchedTradeHistoryAction extends Action {
  type: ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_SUCCESS
  payload: IHistory<ITradeSnapshot>
  sourceId: string
}

export interface ReceivableDiscountingStateProperties {
  rfpSummariesByRdId: Map<string, IParticipantRFPSummary[]>
  rfpSummariesByRdIdByParticipantStaticId: Map<string, Map<string, IParticipantRFPSummary>>
  tradeSnapshotHistoryById: Map<string, IHistory<ITradeSnapshot>>
  error: stringOrNull
}

export type ReceivableDiscountingState = ImmutableMap<ReceivableDiscountingStateProperties>

export type ReceivableDiscountingAction =
  | ReceivableDiscountingFetchedQuotesAction
  | CreateRequestForProposalError
  | ReceivableDiscountingFetchedTradeHistoryAction
