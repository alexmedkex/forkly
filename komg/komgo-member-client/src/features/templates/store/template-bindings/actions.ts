import { Action } from 'redux'
import { TEMPLATE_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { EditorTemplateBindingsActionType } from './types'
import { ActionCreator } from 'react-redux'
import { ThunkAction } from 'redux-thunk'
import { ApplicationState } from '../../../../store/reducers'
import { HttpRequest } from '../../../../utils/http'
import { stringify } from 'qs'
import { compressToBase64 } from 'lz-string'
import { Product, SubProduct } from '@komgo/types'

export type TemplateBindingActionThunk = ThunkAction<Action, ApplicationState, HttpRequest>

export const getTemplateBinding = (staticId: string, afterHandler?: ActionCreator<TemplateBindingActionThunk>) => (
  dispatch,
  _,
  api
): Action =>
  dispatch(
    api.get(`${TEMPLATE_BASE_ENDPOINT}/templatebindings/${staticId}`, {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_REQUEST,
      onSuccess: {
        type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
        // After handler is for future use
        afterHandler: store => {
          const { dispatch: dispatcher, getState } = store
          return afterHandler && afterHandler()(dispatcher, getState, api)
        }
      },
      onError: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_FAILURE
    })
  )
export interface FindByProductAndSubProduct {
  filter: { query: { product: Product; subProduct: SubProduct } }
}
export const fetchTemplateBindings = (params?: any) => (dispatch, _, api): Action => {
  params =
    params && params.hasOwnProperty('filter')
      ? { ...params, filter: compressToBase64(stringify(params.filter)) }
      : params

  return dispatch(
    api.get(`${TEMPLATE_BASE_ENDPOINT}/templatebindings`, {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_REQUEST,
      onSuccess: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      onError: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_FAILURE,
      params
    })
  )
}
