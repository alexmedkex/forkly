import { Action, ActionCreator } from 'redux'
import { IDepositLoanResponse, DepositLoanType, Currency, DepositLoanPeriod } from '@komgo/types'

import { ApiActions } from '../../../store/common/types'
import {
  DepositLoanActionType,
  CreditAppetiteDepositLoanFeature,
  IDepositLoanForm,
  DepositLoanDetailsQuery,
  ICreateDepositLoanRequest,
  RequestType
} from './types'
import { CREDIT_LINES_BASE_ENDPOINT } from '../../../utils/endpoints'
import { TOAST_TYPE, displayToast } from '../../toasts/utils'
import { getCurrencyWithTenor } from '../utils/selectors'
import { history } from '../../../store/history'
import { ROUTES } from '../routes'
import { IMailToData } from '../../credit-line/store/types'
import { openDefaultMailClientWithDataPopulated } from '../../credit-line/utils/mailTo'

const successMessageWithRedirect = (message: string, actionType: DepositLoanActionType, redirectUrl: string) => {
  history.push(redirectUrl)
  displayToast(message, TOAST_TYPE.Ok)
  return {
    type: actionType
  }
}

/**
 * Financial Institution Actions
 */

export const fetchDepositsLoans: ActionCreator<ApiActions> = (feature: CreditAppetiteDepositLoanFeature) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan/${feature}`, {
      type: DepositLoanActionType.FetchDepositsLoansRequest,
      onSuccess: { type: DepositLoanActionType.FetchDepositsLoansSuccess, feature },
      onError: DepositLoanActionType.FetchDepositsLoansFailure
    })
  )
}

const successRemove = (item: IDepositLoanResponse, feature: CreditAppetiteDepositLoanFeature) => {
  displayToast(`${getCurrencyWithTenor(item)} has been removed`, TOAST_TYPE.Ok)
  return {
    type: DepositLoanActionType.RemoveDepositLoanSuccess,
    payload: item.staticId,
    feature
  }
}

export const removeDepositLoan: ActionCreator<ApiActions> = (
  item: IDepositLoanResponse,
  feature: CreditAppetiteDepositLoanFeature
) => (dispatch, _, api): Action => {
  return dispatch(
    api.delete(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan/${feature}/${item.staticId}`, {
      type: DepositLoanActionType.RemoveDepositLoanRequest,
      onSuccess: () => successRemove(item, feature),
      onError: DepositLoanActionType.RemoveDepositLoanFailure
    })
  )
}

export const getDepositLoan: ActionCreator<ApiActions> = (id: string, feature: CreditAppetiteDepositLoanFeature) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan/${feature}/${id}`, {
      type: DepositLoanActionType.GetDepositLoanRequest,
      onSuccess: { type: DepositLoanActionType.GetDepositLoanSuccess, feature },
      onError: DepositLoanActionType.GetDepositLoanFailure
    })
  )
}

export const createDepositLoan: ActionCreator<ApiActions> = (
  data: IDepositLoanForm,
  feature: CreditAppetiteDepositLoanFeature
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan/${feature}`, {
      type: DepositLoanActionType.CreateDepositLoanRequest,
      data,
      onSuccess: (id: string) =>
        successMessageWithRedirect(
          `${getCurrencyWithTenor(data)} added`,
          DepositLoanActionType.CreateDepositLoanSuccess,
          `${ROUTES[feature].financialInstitution.dashboard}/${id}`
        ),
      onError: DepositLoanActionType.CreateDepositLoanFailure
    })
  )
}

export const editDepositLoan: ActionCreator<ApiActions> = (
  data: IDepositLoanForm,
  id: string,
  feature: CreditAppetiteDepositLoanFeature
) => (dispatch, _, api): Action => {
  return dispatch(
    api.put(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan/${feature}/${id}`, {
      type: DepositLoanActionType.EditDepositLoanRequest,
      data,
      onSuccess: () =>
        successMessageWithRedirect(
          `${getCurrencyWithTenor(data)} has been updated`,
          DepositLoanActionType.EditDepositLoanSuccess,
          `${ROUTES[feature].financialInstitution.dashboard}/${id}`
        ),
      onError: DepositLoanActionType.EditDepositLoanFailure
    })
  )
}

/***
 * Corporate Actions
 */

export const fetchDisclosedSummaries: ActionCreator<ApiActions> = (feature: CreditAppetiteDepositLoanFeature) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/disclosed-deposit-loans/type/${feature}/summary`, {
      type: DepositLoanActionType.FetchDisclosedDepositLoanSummariesRequest,
      onSuccess: { type: DepositLoanActionType.FetchDisclosedDepositLoanSummariesSuccess, feature },
      onError: DepositLoanActionType.FetchDisclosedDepositLoanSummariesFailure
    })
  )
}

export const fetchDisclosedDepositsLoans: ActionCreator<ApiActions> = (
  feature: CreditAppetiteDepositLoanFeature,
  params: DepositLoanDetailsQuery
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/disclosed-deposit-loans/${feature}`, {
      params,
      type: DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorRequest,
      onSuccess: { type: DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorSuccess, feature },
      onError: DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorFailure
    })
  )
}

export const createRequestInformation: ActionCreator<ApiActions> = (
  data: ICreateDepositLoanRequest,
  feature: CreditAppetiteDepositLoanFeature,
  mailToInfo?: IMailToData
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan-requests/${feature}`, {
      type: DepositLoanActionType.CreateReqDepositLoanInformationRequest,
      data,
      onSuccess: () => {
        if (mailToInfo) {
          openDefaultMailClientWithDataPopulated(mailToInfo)
        }
        return successMessageWithRedirect(
          'Request for information sent',
          DepositLoanActionType.CreateReqDepositLoanInformationSuccess,
          ROUTES[feature].corporate.dashboard
        )
      },
      onError: DepositLoanActionType.CreateReqDepositLoanInformationFailure
    })
  )
}

export const fetchRequests: ActionCreator<ApiActions> = (
  feature: CreditAppetiteDepositLoanFeature,
  type: RequestType
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan-requests/${feature}/request-type/${type}`, {
      type: DepositLoanActionType.FetchReqsDepositLoanRequest,
      onSuccess: { type: DepositLoanActionType.FetchReqsDepositLoanSuccess, feature },
      onError: DepositLoanActionType.FetchReqsDepositLoanFailure
    })
  )
}

export const declineAllRequests: ActionCreator<ApiActions> = (
  requests: string[],
  feature: CreditAppetiteDepositLoanFeature
) => (dispatch, _, api): Action => {
  // TODO: check url
  const url = `${CREDIT_LINES_BASE_ENDPOINT}/deposit-loan-requests/${feature}/decline`
  return dispatch(
    api.post(url, {
      data: requests,
      type: DepositLoanActionType.DeclineReqsDepositLoanRequest,
      onSuccess: () =>
        successMessageWithRedirect(
          'Requests declined',
          DepositLoanActionType.DeclineReqsDepositLoanSuccess,
          ROUTES[feature].financialInstitution.dashboard
        ),
      onError: DepositLoanActionType.DeclineReqsDepositLoanFailure
    })
  )
}
