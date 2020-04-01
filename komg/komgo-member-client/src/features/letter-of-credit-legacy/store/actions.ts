import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'
import {
  ChangeActionStatus,
  LetterOfCreditActionType,
  LetterOfCreditClearError,
  LetterOfCreditState,
  SortLettersOfCredit,
  TableSortParams
} from './types'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { TradingRole } from '../../trades/constants'
import { getTradeWithMovements } from '../../trades/store/actions'
import { history } from '../../../store/history'
import { ApplicationState } from '../../../store/reducers'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../utils/endpoints'
import { HttpRequest } from '../../../utils/http'
import { ToastContainerIds } from '../../../utils/toast'
import { toast } from 'react-toastify'
import { Action, ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { compressToBase64 } from 'lz-string'
import { stringify } from 'qs'

import { Task } from '../../tasks/store/types'
import { ACTION_NAME, ACTION_STATUS, RejectLCForm } from '../constants'
import { ActionType, UploadLCForm } from '../store/types'
import { fetchPresentationDocuments } from './presentation/actions'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export type LetterOfCreditActionThunk = ThunkAction<Action, LetterOfCreditState, HttpRequest>

export const fetchLettersOfCredit: ActionCreator<LetterOfCreditActionThunk> = (params?: any) => (
  dispatch,
  _,
  api
): Action => {
  params =
    params && params.hasOwnProperty('filter')
      ? { ...params, filter: compressToBase64(stringify(params.filter)) }
      : params

  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc`, {
      type: LetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
      onSuccess: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
      onError: LetterOfCreditActionType.LETTERS_OF_CREDIT_FAILURE,
      params
    })
  )
}

export const getLetterOfCredit: ActionCreator<LetterOfCreditActionThunk> = (params: {
  id: string
  polling?: boolean
  withDocuments?: boolean
}) => (dispatch, getState, api): Action => {
  const { id, withDocuments, polling } = params
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${id}`, {
      type: LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST,
      onSuccess: withDocuments
        ? payload => {
            return {
              type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
              payload,
              afterHandler: () => {
                if (payload.presentations) {
                  payload.presentations.forEach(presentation => {
                    fetchPresentationDocuments(payload._id, presentation.staticId)(dispatch, getState, api)
                  })
                }
              }
            }
          }
        : LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
      onError: LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE,
      params: { polling }
    })
  )
}

export const sortBy: ActionCreator<SortLettersOfCredit> = (params: TableSortParams) => ({
  type: LetterOfCreditActionType.SORT_LETTERS_OF_CREDIT,
  payload: params
})

export const submitLetterOfCredit: ActionCreator<LetterOfCreditActionThunk> = (
  letterOfCreditDetails: ILetterOfCredit
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc`, {
      type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_SUCCESS,
        afterHandler: () => history.push(`/trades?tradingRole=${TradingRole.BUYER}`)
      },
      onError: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE,
      data: letterOfCreditDetails
    })
  )
}

export const getLetterOfCreditWithTradeAndMovements: ActionCreator<LetterOfCreditActionThunk> = (params: {
  id: string
}) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${params.id}`, {
      type: LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          let tradeId
          try {
            tradeId = getState()
              .get('lettersOfCredit')
              .get('byId')
              .get(params.id)
              .get('tradeAndCargoSnapshot')
              .get('trade')
              .get('_id')
          } catch (e) {
            tradeId = 'NotFound'
          }
          return getTradeWithMovements({ id: tradeId })(dispatcher, _ as any, api)
        }
      },
      onError: LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE
    })
  )
}

export const getLetterOfCreditWithTrade: ActionCreator<LetterOfCreditActionThunk> = (params: { id: string }) => (
  dispatch,
  _,
  api
): Action => {
  return dispatch(
    api.get(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${params.id}`, {
      type: LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST,
      onSuccess: {
        type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          const tradeId = getState()
            .get('lettersOfCredit')
            .get('byId')
            .get(params.id)
            .get('tradeAndCargoSnapshot')
            .get('trade')
            .get('_id')
          return getTradeWithMovements(tradeId)(dispatcher, _ as any, api)
        }
      },
      onError: LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE
    })
  )
}

export const clearLetterOfCreditError: ActionCreator<LetterOfCreditClearError> = () => ({
  type: LetterOfCreditActionType.CLEAR_ERROR
})

export const createLetterOfCreditAsync: ActionCreator<LetterOfCreditActionThunk> = (
  uploadLCFormData: UploadLCForm,
  id: string
) => (dispatch, _, api: any): Action => {
  dispatch(changeActionStatus({ status: ACTION_STATUS.PENDING, name: ACTION_NAME.ISSUE_BANK_ISSUE_LC }))
  const extraData = {
    issuedLCReference: uploadLCFormData.issuingBankLCReference
  }

  const formData = new FormData()
  formData.set('extraData', JSON.stringify(extraData))
  formData.append('fileData', uploadLCFormData.fileLC!)

  return dispatch(
    api.post(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/${id}/task/issue`, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData,
      onSuccess: successUploadLetterOfCredit,
      onError: errorUploadLetterOfCredit
    })
  )
}

export const rejectLetterOfCreditAsync: ActionCreator<LetterOfCreditActionThunk> = (
  RejectLCFormData: RejectLCForm,
  letterOfCredit: ILetterOfCredit,
  task: Task
) => (dispatch, _, api: any): Action => {
  dispatch(changeActionStatus({ status: ACTION_STATUS.PENDING, name: ACTION_NAME.REJECT_LC }))

  const route = `${TRADE_FINANCE_BASE_ENDPOINT}/lc/${letterOfCredit._id}/task/${getRejectionRoute(
    task,
    letterOfCredit
  )}`

  const jsonToSend = {
    reason: RejectLCFormData.rejectComment
  }

  return dispatch(
    api.post(route, {
      data: jsonToSend,
      onSuccess: successRejectLetterOfCredit,
      onError: errorRejectLetterOfCredit
    })
  )
}

export const acceptLetterOfCreditAsync: ActionCreator<LetterOfCreditActionThunk> = (
  letterOfCredit: ILetterOfCredit
) => (dispatch, _, api: any): Action => {
  dispatch(changeActionStatus({ status: ACTION_STATUS.PENDING, name: ACTION_NAME.ACCEPT_LC }))
  const route = `${TRADE_FINANCE_BASE_ENDPOINT}/lc/${letterOfCredit._id}/task/${getAcceptRoute(letterOfCredit)}`

  return dispatch(
    api.post(route, {
      onSuccess: successAcceptLetterOfCredit,
      onError: errorAcceptLetterOfCredit
    })
  )
}

export const changeActionStatus: ActionCreator<ChangeActionStatus> = (action: ActionType) => ({
  type: LetterOfCreditActionType.CHANGE_ACTION_STATUS,
  payload: action
})

export const successUploadLetterOfCredit: ActionCreator<ChangeActionStatus> = () => {
  toast.success('Letter of Credit successfully issued.', {
    hideProgressBar: true,
    containerId: ToastContainerIds.Default
  })
  return changeActionStatus({
    status: ACTION_STATUS.FINISHED,
    name: ACTION_NAME.ISSUE_BANK_ISSUE_LC,
    message: ''
  })
}

export const errorUploadLetterOfCredit: ActionCreator<ChangeActionStatus> = (payload: string) => {
  return changeActionStatus({ status: ACTION_STATUS.ERROR, name: ACTION_NAME.ISSUE_BANK_ISSUE_LC, message: payload })
}

export const successRejectLetterOfCredit: ActionCreator<ChangeActionStatus> = () => {
  toast.success('Letter of Credit successfully rejected.', {
    hideProgressBar: true,
    containerId: ToastContainerIds.Default
  })
  return changeActionStatus({
    status: ACTION_STATUS.FINISHED,
    name: ACTION_NAME.REJECT_LC,
    message: ''
  })
}

export const errorRejectLetterOfCredit: ActionCreator<ChangeActionStatus> = (payload: string) => {
  return changeActionStatus({ status: ACTION_STATUS.ERROR, name: ACTION_NAME.REJECT_LC, message: payload })
}

export const successAcceptLetterOfCredit: ActionCreator<ChangeActionStatus> = () => {
  toast.success('Letter of Credit successfully accepted.', { containerId: ToastContainerIds.Default })
  return changeActionStatus({ status: ACTION_STATUS.FINISHED, name: ACTION_NAME.ACCEPT_LC, message: '' })
}

export const errorAcceptLetterOfCredit: ActionCreator<ChangeActionStatus> = (payload: string) => {
  toast.error(payload, { containerId: ToastContainerIds.Default })
  return changeActionStatus({ status: ACTION_STATUS.ERROR, name: ACTION_NAME.ACCEPT_LC, message: payload })
}

const getRejectionRoute = (task: Task, letterOfCredit: ILetterOfCredit) => {
  if (task.taskType === LetterOfCreditTaskType.REVIEW_APPLICATION) {
    return 'requestReject'
  } else if (
    task.taskType === LetterOfCreditTaskType.REVIEW_ISSUED &&
    letterOfCredit.status === ILetterOfCreditStatus.ISSUED &&
    !!letterOfCredit.beneficiaryBankId
  ) {
    return 'rejectAdvising'
  } else if (
    task.taskType === LetterOfCreditTaskType.REVIEW_ISSUED &&
    (letterOfCredit.status === ILetterOfCreditStatus.ADVISED || !letterOfCredit.beneficiaryBankId)
  ) {
    return 'rejectBeneficiary'
  }

  return null
}

const getAcceptRoute = (letterOfCredit: ILetterOfCredit) => {
  if (letterOfCredit.status === ILetterOfCreditStatus.ISSUED && !letterOfCredit.direct) {
    return 'advise'
  }

  return 'acknowledge'
}
