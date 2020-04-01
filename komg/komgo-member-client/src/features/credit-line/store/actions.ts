import { Action, ActionCreator } from 'redux'
import { ICreateCreditLineRequest } from '@komgo/types'

import { ApiActions } from '../../../store/common/types'
import { CREDIT_LINES_BASE_ENDPOINT } from '../../../utils/endpoints'
import {
  CreditLineActionType,
  ICreateOrEditCreditLineForm,
  CreditLineType,
  IExtendedCreditLine,
  IMailToData
} from './types'
import { history } from '../../../store/history'
import { displayToast, TOAST_TYPE } from '../../toasts/utils'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { findFeature } from '../utils/creditAppetiteTypes'
import { dictionary } from '../dictionary'
import { openDefaultMailClientWithDataPopulated } from '../utils/mailTo'

const RISK_COVER_URL = '/risk-cover'
const BANK_LINES_URL = '/bank-lines'

const successMessageWithRedirect = (message: string, actionType: CreditLineActionType, redirectUrl: string) => {
  history.push(redirectUrl)
  displayToast(message, TOAST_TYPE.Ok)
  return {
    type: actionType
  }
}

/**
 * Financial Institution Actions
 */

export const fetchCreditLines: ActionCreator<ApiActions> = (productId: Products, subProductId: SubProducts) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/credit-lines/product/${productId}/sub-product/${subProductId}`, {
      type: CreditLineActionType.FetchCreditLinesRequest,
      onSuccess: { type: CreditLineActionType.FetchCreditLinesSuccess, productId, subProductId },
      onError: CreditLineActionType.FetchCreditLinesFailure
    })
  )
}

export const getCreditLine: ActionCreator<ApiActions> = (
  id: string,
  productId: Products,
  subProductId: SubProducts
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/credit-lines/${id}`, {
      type: CreditLineActionType.GetCreditLineRequest,
      onSuccess: { type: CreditLineActionType.GetCreditLineSuccess, productId, subProductId },
      onError: CreditLineActionType.GetCreditLineFailure
    })
  )
}

const getBaseRedirectUrl = (data: ICreateOrEditCreditLineForm | ICreateCreditLineRequest) => {
  return findFeature(data) === CreditLineType.RiskCover ? RISK_COVER_URL : BANK_LINES_URL
}

export const createCreditLine: ActionCreator<ApiActions> = (
  data: ICreateOrEditCreditLineForm,
  counterpartyName: string
) => (dispatch, _, api): Action => {
  const feature = findFeature(data)
  return dispatch(
    api.post(
      `${CREDIT_LINES_BASE_ENDPOINT}/credit-lines/product/${data.context.productId}/sub-product/${
        data.context.subProductId
      }`,
      {
        type: CreditLineActionType.CreateCreditLineRequest,
        data,
        onSuccess: (id: string) =>
          successMessageWithRedirect(
            `${counterpartyName} added as ${dictionary[feature].financialInstitution.createOrEdit.counterpartyRole}`,
            CreditLineActionType.CreateCreditLineSuccess,
            `${getBaseRedirectUrl(data)}/${id}`
          ),
        onError: CreditLineActionType.CreateCreditLineFailure
      }
    )
  )
}

export const editCreditLine: ActionCreator<ApiActions> = (
  data: ICreateOrEditCreditLineForm,
  id: string,
  counterpartyName: string
) => (dispatch, _, api): Action => {
  // TODO: use product and subproduct from data.context for url and redirect
  return dispatch(
    api.put(`${CREDIT_LINES_BASE_ENDPOINT}/credit-lines/${id}`, {
      type: CreditLineActionType.EditCreditLineRequest,
      data,
      onSuccess: () =>
        successMessageWithRedirect(
          `${counterpartyName} has been updated`,
          CreditLineActionType.EditCreditLineSuccess,
          `${getBaseRedirectUrl(data)}/${data.staticId}`
        ),
      onError: CreditLineActionType.EditCreditLineFailure
    })
  )
}

const successRemoveCreditLine = (creditLine: IExtendedCreditLine) => {
  displayToast(`${creditLine.counterpartyName} has been removed`, TOAST_TYPE.Ok)
  return {
    type: CreditLineActionType.RemoveCreditLineSuccess,
    payload: creditLine.staticId,
    productId: creditLine.context.productId,
    subProductId: creditLine.context.subProductId
  }
}

export const removeCreditLine: ActionCreator<ApiActions> = (creditLine: IExtendedCreditLine) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.delete(`${CREDIT_LINES_BASE_ENDPOINT}/credit-lines/${creditLine.staticId}`, {
      type: CreditLineActionType.RemoveCreditLineRequest,
      onSuccess: () => successRemoveCreditLine(creditLine),
      onError: CreditLineActionType.RemoveCreditLineFailure
    })
  )
}

export const fetchReceivedRequests: ActionCreator<ApiActions> = (productId: Products, subProductId: SubProducts) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${CREDIT_LINES_BASE_ENDPOINT}/requests/received/product/${productId}/sub-product/${subProductId}`, {
      type: CreditLineActionType.FetchRequestsRequest,
      onSuccess: { type: CreditLineActionType.FetchRequestsSuccess, productId, subProductId },
      onError: CreditLineActionType.FetchRequestsFailure
    })
  )
}

export const declineRequests: ActionCreator<ApiActions> = (
  product: Products,
  subProduct: SubProducts,
  counterpartyId: string,
  requests: string[]
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${CREDIT_LINES_BASE_ENDPOINT}/requests/${product}/sub-product/${subProduct}/${counterpartyId}/decline`, {
      data: requests,
      type: CreditLineActionType.DeclineAllRequestsRequest,
      onSuccess: () =>
        successMessageWithRedirect('Requests declined', CreditLineActionType.DeclineAllRequestsSuccess, RISK_COVER_URL),
      onError: CreditLineActionType.DeclineAllRequestsFailure
    })
  )
}

/**
 * Corporate Actions
 */

export const fetchDisclosedCreditLineSummaries: ActionCreator<ApiActions> = (
  productId: Products,
  subProductId: SubProducts
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(
      `${CREDIT_LINES_BASE_ENDPOINT}/disclosed-credit-lines/product/${productId}/sub-product/${subProductId}/summary`,
      {
        type: CreditLineActionType.FetchDisclosedCreditLineSummariesRequest,
        onSuccess: { type: CreditLineActionType.FetchDisclosedCreditLineSummariesSuccess, productId, subProductId },
        onError: CreditLineActionType.FetchDisclosedCreditLineSummariesFailure
      }
    )
  )
}

export const fetchDisclosedCreditLines: ActionCreator<ApiActions> = (
  productId: Products,
  subProductId: SubProducts,
  counterpartyId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(
      `${CREDIT_LINES_BASE_ENDPOINT}/disclosed-credit-lines/product/${productId}/sub-product/${subProductId}/${counterpartyId}`,
      {
        type: CreditLineActionType.FetchDisclosedCreditLinesForCounterpartyRequest,
        onSuccess: {
          type: CreditLineActionType.FetchDisclosedCreditLinesForCounterpartySuccess,
          productId,
          subProductId
        },
        onError: CreditLineActionType.FetchDisclosedCreditLinesForCounterpartyFailure
      }
    )
  )
}

export const createRequestInformation: ActionCreator<ApiActions> = (
  data: ICreateCreditLineRequest,
  mailTo?: IMailToData
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(
      `${CREDIT_LINES_BASE_ENDPOINT}/requests/product/${data.context.productId}/sub-product/${
        data.context.subProductId
      }`,
      {
        type: CreditLineActionType.CreateReqInformationRequest,
        data,
        onSuccess: () => {
          if (mailTo) {
            openDefaultMailClientWithDataPopulated(mailTo)
          }
          return successMessageWithRedirect(
            'Request for information sent',
            CreditLineActionType.CreateReqInformationSuccess,
            getBaseRedirectUrl(data)
          )
        },
        onError: CreditLineActionType.CreateReqInformationFailure
      }
    )
  )
}
