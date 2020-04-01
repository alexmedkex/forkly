import { IQuoteBase, IReceivablesDiscountingInfo, RDStatus, ITrade } from '@komgo/types'
import { Action, ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { history } from '../../../store/history'
import { ApplicationState } from '../../../store/reducers'
import { RECEIVABLE_DISCOUNTING_BASE_ENDPOINT } from '../../../utils/endpoints'
import { HttpRequest } from '../../../utils/http'
import { stringOrNull } from '../../../utils/types'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import {
  CreateRequestForProposalError,
  ICreateRequestForProposal,
  IQuoteAcceptSubmission,
  IQuoteSubmission,
  IRFPReply,
  ISubmitQuoteFormDetails,
  ReceivableDiscountingActionType
} from './types'
import { fetchTradesBySourceId } from '../../trades/store/actions'
import { IPaginate } from '../../../store/common/types'
import { fetchDisclosedCreditLines } from '../../credit-line/store/actions'
import { fetchDiscountingRequest } from './application/actions'

export type ReceivableDiscountingActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchDiscountingRequestPageData: ActionCreator<ReceivableDiscountingActionThunk> = (
  rdId: string,
  participantStaticId: string,
  single: boolean = false
) => (dispatch, _, api): Action => {
  return fetchDiscountingRequest(rdId, (store, discountingRequest: IReceivablesDiscountingInfo) => {
    const { dispatch: dispatcher } = store
    if (discountingRequest.status !== RDStatus.Requested) {
      if (single) {
        fetchSingleRFPSummary(rdId, participantStaticId)(dispatcher, _ as any, api)
      } else {
        fetchRFPSummaries(rdId, participantStaticId)(dispatcher, _ as any, api)
      }
    }
  })(dispatch, _, api)
}

export const fetchDiscountRequestRFPSummaries: ActionCreator<ReceivableDiscountingActionThunk> = (rdId: string) => (
  dispatch,
  _,
  api
): Action => {
  return fetchDiscountingRequest(rdId, store => {
    const { dispatch: dispatcher } = store
    return fetchRFPSummaries(rdId)(dispatcher, _ as any, api)
  })(dispatch, _, api)
}

export const fetchDiscountingRequestForAcceptQuote: ActionCreator<ReceivableDiscountingActionThunk> = (
  rdId: string,
  participantStaticId: string
) => (dispatch, _, api): Action => {
  return fetchDiscountingRequest(rdId, store => {
    const { dispatch: dispatcher, getState } = store
    return fetchSingleRFPSummary(rdId, participantStaticId)(dispatcher, _ as any, api)
  })(dispatch, _, api)
}

export const createRequestForProposal: ActionCreator<ReceivableDiscountingActionThunk> = (
  values: ICreateRequestForProposal
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/request-for-proposal/request`, {
      type: ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_REQUEST,
      data: values,
      onSuccess: {
        type: ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_SUCCESS,
        afterHandler: () => history.push(`/receivable-discounting`)
      },
      onError: setCreateRequestForProposalError
    })
  )
}

export const setCreateRequestForProposalError: ActionCreator<CreateRequestForProposalError> = (error: stringOrNull) => {
  return {
    type: ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_FAILURE,
    payload: error
  }
}

export const fetchRFPSummaries: ActionCreator<ReceivableDiscountingActionThunk> = (rdId: string) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/rd/${rdId}/request-for-proposal`, {
      type: ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_REQUEST,
      onSuccess: {
        type: ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS,
        rdId
      },
      onError: ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_FAILURE
    })
  )
}

export const fetchSingleRFPSummary: ActionCreator<ReceivableDiscountingActionThunk> = (
  rdId: string,
  participantId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/rd/${rdId}/request-for-proposal/${participantId}`, {
      type: ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_REQUEST,
      onSuccess: {
        type: ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_SUCCESS,
        rdId,
        participantId
      },
      onError: ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_FAILURE
    })
  )
}

export const bankCreateQuote: ActionCreator<ReceivableDiscountingActionThunk> = (
  values: ISubmitQuoteFormDetails,
  rdId: string
) => (dispatch, getState, api): Action => {
  const { comment, ...quoteBase } = values
  return dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote`, {
      type: ReceivableDiscountingActionType.CREATE_QUOTE_REQUEST,
      data: quoteBase as IQuoteBase,
      onSuccess: response => {
        const { staticId } = response
        if (response && staticId && rdId) {
          const quoteSubmission: IQuoteSubmission = {
            rdId,
            comment: values.comment,
            quoteId: staticId
          }

          bankSubmitQuote(quoteSubmission)(dispatch, getState, api)
        }

        return {
          payload: response,
          type: ReceivableDiscountingActionType.CREATE_QUOTE_SUCCESS
        }
      },
      onError: ReceivableDiscountingActionType.CREATE_QUOTE_FAILURE
    })
  )
}

export const bankSubmitQuote: ActionCreator<ReceivableDiscountingActionThunk> = (values: IQuoteSubmission) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/request-for-proposal/submit-quote`, {
      type: ReceivableDiscountingActionType.SUBMIT_QUOTE_REQUEST,
      data: values,
      onSuccess: {
        type: ReceivableDiscountingActionType.SUBMIT_QUOTE_SUCCESS,
        afterHandler: response => {
          history.push(`/receivable-discounting`)
        }
      },
      onError: ReceivableDiscountingActionType.SUBMIT_QUOTE_FAILURE
    })
  )
}

export const bankDeclineRFP: ActionCreator<ReceivableDiscountingActionThunk> = (values: IRFPReply) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/request-for-proposal/reject`, {
      type: ReceivableDiscountingActionType.REJECT_RFP_REQUEST,
      data: values,
      onSuccess: {
        type: ReceivableDiscountingActionType.REJECT_RFP_SUCCESS,
        afterHandler: response => {
          history.push(`/receivable-discounting`)
        }
      },
      onError: ReceivableDiscountingActionType.REJECT_RFP_FAILURE
    })
  )
}

export const traderCreateQuote: ActionCreator<ReceivableDiscountingActionThunk> = (
  values: ISubmitQuoteFormDetails,
  rdId: string,
  participantStaticId: string
) => (dispatch, getState, api): Action => {
  const { comment, ...quoteBase } = values
  return dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote`, {
      type: ReceivableDiscountingActionType.CREATE_QUOTE_REQUEST,
      data: quoteBase as IQuoteBase,
      onSuccess: response => {
        const { staticId } = response
        if (response && staticId && rdId) {
          const quoteAcceptSubmission: IQuoteAcceptSubmission = {
            rdId,
            comment: values.comment,
            quoteId: staticId,
            participantStaticId
          }

          traderAcceptQuote(quoteAcceptSubmission)(dispatch, getState, api)
        }

        return {
          payload: response,
          type: ReceivableDiscountingActionType.CREATE_QUOTE_SUCCESS
        }
      },
      onError: ReceivableDiscountingActionType.CREATE_QUOTE_FAILURE
    })
  )
}

export const traderAcceptQuote: ActionCreator<ReceivableDiscountingActionThunk> = (values: IQuoteSubmission) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.post(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/request-for-proposal/accept-quote`, {
      type: ReceivableDiscountingActionType.ACCEPT_QUOTE_REQUEST,
      data: values,
      onSuccess: {
        type: ReceivableDiscountingActionType.ACCEPT_QUOTE_SUCCESS,
        afterHandler: response => {
          history.push(`/receivable-discounting`)
        }
      },
      onError: ReceivableDiscountingActionType.ACCEPT_QUOTE_FAILURE
    })
  )
}

export const fetchSingleQuote: ActionCreator<ReceivableDiscountingActionThunk> = (staticId: string) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/quote/${staticId}`, {
      type: ReceivableDiscountingActionType.FETCH_QUOTE_REQUEST,
      onError: ReceivableDiscountingActionType.FETCH_QUOTE_FAILURE,
      onSuccess: ReceivableDiscountingActionType.FETCH_QUOTE_SUCCESS
    })
  )
}

export const fetchRDRequesForProposalMembersData: ActionCreator<ReceivableDiscountingActionThunk> = (rdId: string) => (
  dispatch,
  _,
  api
): Action => {
  return fetchDiscountingRequest(rdId, (store, discountingRequest: IReceivablesDiscountingInfo) => {
    return fetchTradesBySourceId(
      discountingRequest.rd.tradeReference.source,
      discountingRequest.rd.tradeReference.sourceId,
      (store, trades: IPaginate<ITrade[]>) => {
        if (trades.items.length === 0) {
          throw new Error(
            `There is no Trade with ID '${
              discountingRequest.rd.tradeReference.sellerEtrmId
            }' associated with Receivable Discounting '${rdId}'`
          )
        }

        const buyerStaticId = trades.items[0].buyer
        return fetchDisclosedCreditLines(Products.TradeFinance, SubProducts.ReceivableDiscounting, buyerStaticId)(
          dispatch,
          _ as any,
          api
        )
      }
    )(dispatch, _ as any, api)
  })(dispatch, _, api)
}

export const fetchHistoryForTrade: ActionCreator<ReceivableDiscountingActionThunk> = (sourceId: string) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${RECEIVABLE_DISCOUNTING_BASE_ENDPOINT}/trade/${sourceId}/history`, {
      type: ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_REQUEST,
      onSuccess: {
        type: ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_SUCCESS,
        sourceId
      },
      onError: ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_FAILURE
    })
  )
}
