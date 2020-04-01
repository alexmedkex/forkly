import { ThunkAction } from 'redux-thunk'
import { toast } from 'react-toastify'
import { Action, ActionCreator } from 'redux'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { EditorTemplatesActionType } from './types'
import { TEMPLATE_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { ITemplate, ITemplateBase } from '@komgo/types'
import { ToastContainerIds } from '../../../../utils/toast'

export type TemplateActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const fetchTemplates: ActionCreator<TemplateActionThunk> = (
  params: { polling?: boolean },
  afterHandler?: ActionCreator<TemplateActionThunk>
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TEMPLATE_BASE_ENDPOINT}/templates`, {
      type: EditorTemplatesActionType.FETCH_TEMPLATES_REQUEST,
      onSuccess: {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(params)(dispatcher, getState, api)
        }
      },
      onError: EditorTemplatesActionType.FETCH_TEMPLATES_FAILURE,
      params
    })
  )
}

export const createTemplate: ActionCreator<TemplateActionThunk> = (
  template: ITemplateBase,
  afterHandler?: ActionCreator<TemplateActionThunk>
) => (dispatch, _, api): Action => {
  return dispatch(
    api.post(`${TEMPLATE_BASE_ENDPOINT}/templates`, {
      type: EditorTemplatesActionType.CREATE_TEMPLATE_REQUEST,
      onSuccess: {
        type: EditorTemplatesActionType.CREATE_TEMPLATE_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(template)(dispatcher, getState, api)
        }
      },
      onError: EditorTemplatesActionType.CREATE_TEMPLATE_FAILURE,
      data: template
    })
  )
}

export const updateTemplate: ActionCreator<TemplateActionThunk> = (
  template: ITemplate,
  afterHandler?: ActionCreator<TemplateActionThunk>
) => (dispatch, _, api): Action => {
  const errorHandler = (type: EditorTemplatesActionType, responseObj: any) => {
    const error = responseObj.response.data
    toast.error(error.message || 'Something went wrong. Try again later', { containerId: ToastContainerIds.Custom })
    return {
      type,
      payload: error,
      status: responseObj.response && responseObj.response.status,
      error,
      headers: responseObj.response && responseObj.response.headers
    }
  }

  return dispatch(
    api.put(`${TEMPLATE_BASE_ENDPOINT}/templates/${template.staticId}`, {
      type: EditorTemplatesActionType.UPDATE_TEMPLATE_REQUEST,
      onSuccess: {
        type: EditorTemplatesActionType.UPDATE_TEMPLATE_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(template)(dispatcher, getState, api)
        }
      },
      onError: (_, response: any) => errorHandler(EditorTemplatesActionType.UPDATE_TEMPLATE_FAILURE, response),
      data: template
    })
  )
}

export const getTemplate: ActionCreator<TemplateActionThunk> = (
  params: { staticId: string },
  afterHandler?: ActionCreator<any>
) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${TEMPLATE_BASE_ENDPOINT}/templates/${params.staticId}`, {
      type: EditorTemplatesActionType.GET_TEMPLATE_REQUEST,
      onSuccess: {
        type: EditorTemplatesActionType.GET_TEMPLATE_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(params)(dispatcher, getState, api)
        }
      },
      onError: EditorTemplatesActionType.GET_TEMPLATE_FAILURE
    })
  )
}

export const deleteTemplate: ActionCreator<TemplateActionThunk> = (
  params: { staticId: string },
  afterHandler?: ActionCreator<any>
) => (dispatch, _, api): Action => {
  return dispatch(
    api.delete(`${TEMPLATE_BASE_ENDPOINT}/templates/${params.staticId}`, {
      type: EditorTemplatesActionType.DELETE_TEMPLATE_REQUEST,
      onSuccess: {
        type: EditorTemplatesActionType.DELETE_TEMPLATE_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler(params)(dispatcher, getState, api)
        }
      },
      onError: EditorTemplatesActionType.DELETE_TEMPLATE_FAILURE
    })
  )
}
