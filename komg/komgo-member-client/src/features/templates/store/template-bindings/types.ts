import { ITemplateBinding } from '@komgo/types'
import { Map, List } from 'immutable'
import { ImmutableMap } from '../../../../utils/types'
import { Action } from 'redux'

export enum EditorTemplateBindingsActionType {
  GET_TEMPLATE_BINDING_REQUEST = '@@template-bindings/GET_TEMPLATE_BINDING_REQUEST',
  GET_TEMPLATE_BINDING_SUCCESS = '@@template-bindings/GET_TEMPLATE_BINDING_SUCCESS',
  GET_TEMPLATE_BINDING_FAILURE = '@@template-bindings/GET_TEMPLATE_BINDING_FAILURE',
  FETCH_TEMPLATE_BINDINGS_REQUEST = '@@template-bindings/FETCH_TEMPLATE_BINDINGS_REQUEST',
  FETCH_TEMPLATE_BINDINGS_SUCCESS = '@@template-bindings/FETCH_TEMPLATE_BINDINGS_SUCCESS',
  FETCH_TEMPLATE_BINDINGS_FAILURE = '@@template-bindings/FETCH_TEMPLATE_BINDINGS_FAILURE'
}

export interface GetTemplateBindingsSuccessAction extends Action {
  type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS
  payload: ITemplateBinding
}

export interface FetchTemplateBindingsSuccessAction extends Action {
  type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS
  payload: { limit: number; skip: number; total: number; items: ITemplateBinding[] }
}

export interface TemplateBindingsStateProperties {
  byStaticId: Map<string, Map<keyof ITemplateBinding, any>>
  staticIds: List<string>
  total: number
}

export type EditorTemplateBindingsState = ImmutableMap<TemplateBindingsStateProperties>
