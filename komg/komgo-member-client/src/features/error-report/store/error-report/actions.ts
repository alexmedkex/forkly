import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { ZENDESK_BASE_URL } from '../../../../utils/endpoints'

import { ErrorReportActionType, ErrorReportInterface, StoreRequest, ErrorReportRequest } from '../types'

export type ActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const createTicket: ActionCreator<ActionThunk> = (token: string, report: ErrorReportInterface) => (
  dispatch: any,
  getState: () => ApplicationState,
  api: any
) => {
  const uploads = report.comment.uploads
  if (!!uploads.length) {
    return Object.keys(uploads).forEach((key: string) =>
      dispatch(
        api.post(`${ZENDESK_BASE_URL}/api/v2/uploads.json?filename=${uploads[key].name}&token=`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/binary'
          },
          data: uploads[key],
          type: ErrorReportActionType.ADD_ATTACHMENTS_REQUEST,
          onSuccess: {
            type: ErrorReportActionType.ADD_ATTACHMENTS_SUCCESS,
            afterHandler: store => {
              const uploadsTokens = store
                .getState()
                .get('errorReport')
                .get('uploads')
              if (uploadsTokens.length === uploads.length) {
                return dispatch(
                  api.post(`${ZENDESK_BASE_URL}/api/v2/requests.json`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: {
                      request: {
                        ...report,
                        comment: { ...report.comment, uploads: uploadsTokens }
                      }
                    },
                    type: ErrorReportActionType.CREATE_ERROR_REPORT_REQUEST,
                    onSuccess: ErrorReportActionType.CREATE_ERROR_REPORT_SUCCESS,
                    onError: ErrorReportActionType.CREATE_ERROR_REPORT_FAILURE
                  })
                )
              }
            }
          },
          onError: ErrorReportActionType.CREATE_ERROR_REPORT_FAILURE
        })
      )
    )
  }

  return dispatch(
    api.post(`${ZENDESK_BASE_URL}/api/v2/requests.json`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        request: {
          ...report,
          comment: { ...report.comment, uploads: [] }
        }
      },
      type: ErrorReportActionType.CREATE_ERROR_REPORT_REQUEST,
      onSuccess: ErrorReportActionType.CREATE_ERROR_REPORT_SUCCESS,
      onError: ErrorReportActionType.CREATE_ERROR_REPORT_FAILURE
    })
  )
}

export const storeRequest: ActionCreator<StoreRequest> = (request: ErrorReportRequest) => ({
  type: ErrorReportActionType.STORE_REQUEST,
  payload: request
})
