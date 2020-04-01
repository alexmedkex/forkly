import { ImmutableMap } from '../../../utils/types'
import {
  IDepositLoanResponse,
  ISharedDepositLoan,
  ISaveDepositLoan,
  Currency,
  DepositLoanPeriod,
  ISaveSharedDepositLoan,
  IDisclosedDepositLoanSummary,
  IDisclosedDepositLoan,
  DepositLoanType
} from '@komgo/types'
import { Map, List } from 'immutable'
import { IRequestInformationForm } from '../../credit-line/store/types'

export enum DepositLoanActionType {
  FetchDepositsLoansRequest = '@@deposit-loan/FETCH_DEPOSITS_LOANS_REQUEST',
  FetchDepositsLoansSuccess = '@@deposit-loan/FETCH_DEPOSITS_LOANS_SUCCESS',
  FetchDepositsLoansFailure = '@@deposit-loan/FETCH_DEPOSITS_LOANS_FAILURE',
  RemoveDepositLoanRequest = '@@deposit-loan/REMOVE_DEPOSIT_LOAN_REQUEST',
  RemoveDepositLoanSuccess = '@@deposit-loan/REMOVE_DEPOSIT_LOAN_SUCCESS',
  RemoveDepositLoanFailure = '@@deposit-loan/REMOVE_DEPOSIT_LOAN_FAILURE',
  GetDepositLoanRequest = '@@deposit-loan/GET_DEPOSIT_LOAN_REQUEST',
  GetDepositLoanSuccess = '@@deposit-loan/GET_DEPOSIT_LOAN_SUCCESS',
  GetDepositLoanFailure = '@@deposit-loan/GET_DEPOSIT_LOAN_FAILURE',
  CreateDepositLoanRequest = '@@deposit-loan/CREATE_DEPOSIT_LOAN_REQUEST',
  CreateDepositLoanSuccess = '@@deposit-loan/CREATE_DEPOSIT_LOAN_SUCCESS',
  CreateDepositLoanFailure = '@@deposit-loan/CREATE_DEPOSIT_LOAN_FAILURE',
  EditDepositLoanRequest = '@@deposit-loan/EDIT_DEPOSIT_LOAN_REQUEST',
  EditDepositLoanSuccess = '@@deposit-loan/EDIT_DEPOSIT_LOAN_SUCCESS',
  EditDepositLoanFailure = '@@deposit-loan/EDIT_DEPOSIT_LOAN_FAILURE',
  FetchDisclosedDepositLoanSummariesRequest = '@@deposit-loan/FETCH_DISCLOSED_DEPOSIT_LOAN_SUMMARIES_REQUEST',
  FetchDisclosedDepositLoanSummariesSuccess = '@@deposit-loan/FETCH_DISCLOSED_DEPOSIT_LOAN_SUMMARIES_SUCCESS',
  FetchDisclosedDepositLoanSummariesFailure = '@@deposit-loan/FETCH_DISCLOSED_DEPOSIT_LOAN_SUMMARIES_FAILURE',
  FetchDisclosedDepositsLoansForCurrencyAndTenorRequest = '@@deposit-loan/FETCH_DISCLOSED_DEPOSITS_LOANS_FOR_CURRENCY_AND_TENOR_REQUEST',
  FetchDisclosedDepositsLoansForCurrencyAndTenorSuccess = '@@deposit-loan/FETCH_DISCLOSED_DEPOSITS_LOANS_FOR_CURRENCY_AND_TENOR_SUCCESS',
  FetchDisclosedDepositsLoansForCurrencyAndTenorFailure = '@@deposit-loan/FETCH_DISCLOSED_DEPOSITS_LOANS_FOR_CURRENCY_AND_TENOR_FAILURE',
  CreateReqDepositLoanInformationRequest = '@@deposit-loan/CREATE_REQ_DEPOSIT_LOAN_INFO_REQUEST',
  CreateReqDepositLoanInformationSuccess = '@@deposit-loan/CREATE_REQ_DEPOSIT_LOAN_INFO_SUCCESS',
  CreateReqDepositLoanInformationFailure = '@@deposit-loan/CREATE_REQ_DEPOSIT_LOAN_INFO_FAILURE',
  FetchReqsDepositLoanRequest = '@@deposit-loan/FETCH_REQS_DEPOSIT_LOAN_REQUEST',
  FetchReqsDepositLoanSuccess = '@@deposit-loan/FETCH_REQS_DEPOSIT_LOAN_SUCCESS',
  FetchReqsDepositLoanFailure = '@@deposit-loan/FETCH_REQS_DEPOSIT_LOAN_FAILURE',
  DeclineReqsDepositLoanRequest = '@@deposit-loan/DECLINE_REQS_DEPOSIT_LOAN_REQUEST',
  DeclineReqsDepositLoanSuccess = '@@deposit-loan/DECLINE_REQS_DEPOSIT_LOAN_SUCCESS',
  DeclineReqsDepositLoanFailure = '@@deposit-loan/DECLINE_REQS_DEPOSIT_LOAN_FAILURE'
}

export enum CreditAppetiteDepositLoanFeature {
  Deposit = 'deposit',
  Loan = 'loan'
}

export interface ICurrencyAndTenor {
  currency: Currency
  period: DepositLoanPeriod
  periodDuration?: number
}

export interface ICurrencyAndTenorOption {
  value: string
  text: string
  content: string
}

export interface IExtendedSharedWith extends ISharedDepositLoan {
  sharedWithCompanyName?: string
}

export interface IExtendedDepositLoanResponse extends IDepositLoanResponse {
  currencyAndTenor?: string
  sharedWith: IExtendedSharedWith[]
}

export interface ISharedDepositLoanForm extends ISaveSharedDepositLoan {
  sharedWithCompanyName?: string
  staticId?: string
  updatedAt?: string
  requestStaticId?: string
}

export interface IExtendedDisclosedDepositLoanSummary extends IDisclosedDepositLoanSummary {
  currencyAndTenor: string
}

export interface DepositLoanDetailsQuery {
  currency: Currency
  period: DepositLoanPeriod
  periodDuration?: number
}

export interface IDepositLoanForm extends ISaveDepositLoan {
  staticId?: string
  currencyAndTenor?: string
  pricingUpdatedAt?: string
  sharedWith: ISharedDepositLoanForm[]
}

export interface IExtendedDisclosedDepositLoan extends IDisclosedDepositLoan {
  companyName: string
  companyLocation: string
}

export interface IRequestDepositLoanInformationForm extends IRequestInformationForm {
  type: DepositLoanType
}

// TODO: this should be in komgo types
export interface ICreateDepositLoanRequest {
  companyIds: string[]
  comment: string
  currency: Currency
  period: DepositLoanPeriod
  periodDuration?: number
  type: DepositLoanType
}

export enum RequestType {
  Received = 'received',
  Requested = 'requested'
}

// TODO: load this from komgo types !!!!
export enum DepositLoanRequestType {
  Requested = 'REQUESTED',
  Received = 'RECEIVED'
}

export enum DepositLoanRequestStatus {
  Pending = 'PENDING',
  Declined = 'DECLINED',
  Disclosed = 'DISCLOSED'
}
export interface IDepositLoanRequestDocument {
  staticId: string

  requestType: DepositLoanRequestType

  type: DepositLoanType
  currency: Currency
  period: DepositLoanPeriod
  periodDuration?: number
  comment: string
  companyStaticId: string

  // TODO Create same one
  status: DepositLoanRequestStatus

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface IExtendRequestDepositLoan extends IDepositLoanRequestDocument {
  companyName: string
  currencyAndTenor: string
  currencyAndTenorStringValue: string
}

export interface DepoistLoanProperties {
  byId: Map<string, IDepositLoanResponse>
  summaries: List<IDisclosedDepositLoanSummary>
  disclosedById: Map<string, IDisclosedDepositLoan>
  requestsById: Map<string, IDepositLoanRequestDocument>
}

export interface DepositLoanProperties {
  [CreditAppetiteDepositLoanFeature.Deposit]: ImmutableMap<DepoistLoanProperties>
  [CreditAppetiteDepositLoanFeature.Loan]: ImmutableMap<DepoistLoanProperties>
}

export type DepositLoanState = ImmutableMap<DepositLoanProperties>
