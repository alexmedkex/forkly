import { ImmutableMap } from '../../../utils/types'
import { Map } from 'immutable'
import {
  ICreditLine,
  IRiskCoverData,
  Currency,
  ICreditLineResponse,
  ISharedCreditLine,
  IProductContext,
  ICreditLineRequest,
  ICreateCreditLineRequest,
  IInformationShared
} from '@komgo/types'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { IMember } from '../../members/store/types'

export enum CreditLineActionType {
  FetchCreditLinesRequest = '@@risk-cover/FETCH_CREDIT_LINES_REQUEST',
  FetchCreditLinesSuccess = '@@risk-cover/FETCH_CREDIT_LINES_SUCCESS',
  FetchCreditLinesFailure = '@@risk-cover/FETCH_CREDIT_LINES_FAILURE',
  GetCreditLineRequest = '@@risk-cover/GET_CREDIT_LINE_REQUEST',
  GetCreditLineSuccess = '@@risk-cover/GET_CREDIT_LINE_SUCCESS',
  GetCreditLineFailure = '@@risk-cover/GET_CREDIT_LINE_FAILURE',
  CreateCreditLineRequest = '@@risk-cover/CREATE_CREDIT_LINE_REQUEST',
  CreateCreditLineSuccess = '@@risk-cover/CREATE_CREDIT_LINE_SUCCESS',
  CreateCreditLineFailure = '@@risk-cover/CREATE_CREDIT_LINE_FAILURE',
  EditCreditLineRequest = '@@risk-cover/EDIT_CREDIT_LINE_REQUEST',
  EditCreditLineSuccess = '@@risk-cover/EDIT_CREDIT_LINE_SUCCESS',
  EditCreditLineFailure = '@@risk-cover/EDIT_CREDIT_LINE_FAILURE',
  FetchDisclosedCreditLineSummariesRequest = '@@risk-cover/FETCH_DISCLOSED_CREDIT_LINE_SUMMARIES_REQUEST',
  FetchDisclosedCreditLineSummariesSuccess = '@@risk-cover/FETCH_DISCLOSED_CREDIT_LINE_SUMMARIES_SUCCESS',
  FetchDisclosedCreditLineSummariesFailure = '@@risk-cover/FETCH_DISCLOSED_CREDIT_LINE_SUMMARIES_FAILURE',
  FetchDisclosedCreditLinesForCounterpartyRequest = '@@risk-cover/FETCH_DISCLOSED_CREDIT_LINES_FOR_COUNTERPARTY_REQUEST',
  FetchDisclosedCreditLinesForCounterpartySuccess = '@@risk-cover/FETCH_DISCLOSED_CREDIT_LINES_FOR_COUNTERPARTY_SUCCESS',
  FetchDisclosedCreditLinesForCounterpartyFailure = '@@risk-cover/FETCH_DISCLOSED_CREDIT_LINES_FOR_COUNTERPARTY_FAILURE',
  RemoveCreditLineRequest = '@@risk-cover/REMOVE_CREDIT_LINE_REQUEST',
  RemoveCreditLineSuccess = '@@risk-cover/REMOVE_CREDIT_LINE_SUCCESS',
  RemoveCreditLineFailure = '@@risk-cover/REMOVE_CREDIT_LINE_FAILURE',
  CreateReqInformationRequest = '@@risk-cover/CREATE_REQ_INFORMATION_REQUEST',
  CreateReqInformationSuccess = '@@risk-cover/CREATE_REQ_INFORMATION_SUCCESS',
  CreateReqInformationFailure = '@@risk-cover/CREATE_REQ_INFORMATION_FAILURE',
  FetchRequestsRequest = '@@risk-cover/FETCH_REQ_REQUEST',
  FetchRequestsSuccess = '@@risk-cover/FETCH_REQ_SUCCESS',
  FetchRequestsFailure = '@@risk-cover/FETCH_REQ_FAILURE',
  DeclineAllRequestsRequest = '@@risk-cover/DECLINE_ALL_REQ_REQUEST',
  DeclineAllRequestsSuccess = '@@risk-cover/DECLINE_ALL_REQ_SUCCESS',
  DeclineAllRequestsFailure = '@@risk-cover/DECLINE_ALL_REQ_FAILURE'
}

export enum CreditLineType {
  RiskCover = 'riskCover',
  BankLine = 'bankLine'
}

export interface IExtendedCreditLine extends ICreditLineResponse {
  counterpartyName: string
  counterpartyLocation: string
  data: IRiskCoverData
  sharedCreditLines: IExtendedSharedCreditLine[]
}

export interface IExtendedSharedCreditLine extends ISharedCreditLine<IInformationShared> {
  updatedAt?: string
  counterpartyName: string
}

export interface ICreateOrEditSharedCreditLine {
  counterpartyStaticId: string
  sharedWithStaticId: string
  data: IInformationShared
  requestStaticId?: string
  staticId?: string
  updatedAt?: string
}
export interface ICreateOrEditCreditLineForm {
  context: IProductContext
  counterpartyStaticId: string
  appetite: boolean
  availability: boolean
  creditLimit?: number
  availabilityAmount?: number
  data?: IRiskCoverData
  currency: Currency
  sharedCreditLines: ICreateOrEditSharedCreditLine[]
  availabilityAmountUpdatedAt?: string | Date
  staticId?: string
  creditExpiryDate: string | Date
}

export interface IProductProps {
  productId: Products
  subProductId: SubProducts
}

// TODO: move to komgo types
export interface IDisclosedCreditLineSummary {
  counterpartyStaticId: string
  lowestFee: number
  availabilityCount: number
  appetiteCount: number
  _id: string
}

export interface IExtendedCreditLineRequest extends ICreditLineRequest {
  counterpartyName: string
  companyName: string
}

export interface IDisclosedCreditLineSummaryEnriched extends IDisclosedCreditLineSummary {
  counterpartyName: string
  counterpartyLocation: string
}

export interface IDisclosedCreditLineEnriched extends IDisclosedCreditLine {
  companyName: string
  companyLocation: string
  counterpartyName: string
}

export interface IDisclosedCreditLine extends ICreditLine {
  ownerStaticId: string
  data?: any // TODO: move later to the right type inside `ICreditLine`
}

export interface IRequestInformationForm {
  mailTo: boolean
  comment: string
  requestForId: string
  companyIds: string[]
}

export interface IRequestCreditLineForm extends IRequestInformationForm {
  context: IProductContext
}

export interface IMailToData {
  email?: string
  subject?: string
  body?: string
}

export interface RiskCoverProperties {
  creditLinesById: Map<string, ICreditLineResponse>
  disclosedCreditLineSummariesById: Map<string, IDisclosedCreditLineSummary>
  disclosedCreditLinesById: Map<string, IDisclosedCreditLine>
  requestsById: Map<string, ICreditLineRequest>
}

export interface CreditLinesProperties {
  [CreditLineType.RiskCover]: ImmutableMap<RiskCoverProperties>
  [CreditLineType.BankLine]: ImmutableMap<RiskCoverProperties>
}

export type CreditLinesState = ImmutableMap<CreditLinesProperties>

export interface IMemberWithDisabledFlag extends IMember {
  disabled?: boolean
}
