import * as immutable from 'immutable'
import { Reducer } from 'redux'
import { LOCATION_CHANGE } from 'react-router-redux'

import { ErrorReportActionType, ErrorReportStateFields, ErrorReportState, ErrorReportError } from '../types'
import { failureRegexp } from '../../../../store/common/reducers/errors'
import { ApiAction } from '../../../../utils/http'

export const intialStateFields: ErrorReportStateFields = {
  lastRequests: [],
  lastError: null,
  uploads: [],
  isOpenModal: false,
  isOpenFeedbackModal: false
}

export const initialState: ErrorReportState = immutable.Map(intialStateFields)

const reducer: Reducer<ErrorReportState> = (state = initialState, action: ApiAction): ErrorReportState => {
  switch (action.type) {
    case ErrorReportActionType.STORE_REQUEST:
      const currentLastRequests = state.get('lastRequests')
      if (currentLastRequests.length === 10) {
        currentLastRequests.shift()
      }
      return state.set('lastRequests', [...state.get('lastRequests'), { timestamp: Date.now(), ...action.payload }])
    case ErrorReportActionType.ADD_ATTACHMENTS_SUCCESS:
      return state.set('uploads', [...state.get('uploads'), (action.payload as any).upload.token])
    case ErrorReportActionType.CREATE_ERROR_REPORT_REQUEST:
      return state.set('isOpenFeedbackModal', true)
    case LOCATION_CHANGE:
      return state.set('isOpenModal', false)
  }

  if (failureRegexp.test(action.type) && action.status === 500) {
    return state
      .set('lastError', {
        message: action.payload,
        requestId: action.headers && action.headers['x-request-id'],
        ...(action.error ? action.error : {})
      } as ErrorReportError)
      .set('isOpenModal', true)
  }

  return state
}

export default reducer
