import { ITemplate } from '@komgo/types'
import { Map, List } from 'immutable'
import { ImmutableMap } from '../../../../utils/types'
import { Action } from 'redux'

export enum EditorTemplatesActionType {
  FETCH_TEMPLATES_REQUEST = '@@templates/FETCH_TEMPLATES_REQUEST',
  FETCH_TEMPLATES_SUCCESS = '@@templates/FETCH_TEMPLATES_SUCCESS',
  FETCH_TEMPLATES_FAILURE = '@@templates/FETCH_TEMPLATES_FAILURE',
  CREATE_TEMPLATE_REQUEST = '@@templates/CREATE_TEMPLATE_REQUEST',
  CREATE_TEMPLATE_SUCCESS = '@@templates/CREATE_TEMPLATE_SUCCESS',
  CREATE_TEMPLATE_FAILURE = '@@templates/CREATE_TEMPLATE_FAILURE',
  UPDATE_TEMPLATE_REQUEST = '@@templates/UPDATE_TEMPLATE_REQUEST',
  UPDATE_TEMPLATE_SUCCESS = '@@templates/UPDATE_TEMPLATE_SUCCESS',
  UPDATE_TEMPLATE_FAILURE = '@@templates/UPDATE_TEMPLATE_FAILURE',
  GET_TEMPLATE_REQUEST = '@@templates/GET_TEMPLATE_REQUEST',
  GET_TEMPLATE_SUCCESS = '@@templates/GET_TEMPLATE_SUCCESS',
  GET_TEMPLATE_FAILURE = '@@templates/GET_TEMPLATE_FAILURE',
  DELETE_TEMPLATE_REQUEST = '@@templates/DELETE_TEMPLATE_REQUEST',
  DELETE_TEMPLATE_SUCCESS = '@@templates/DELETE_TEMPLATE_SUCCESS',
  DELETE_TEMPLATE_FAILURE = '@@templates/DELETE_TEMPLATE_FAILURE'
}

export interface FetchTemplatesSuccessAction extends Action {
  type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS
  payload: { limit: number; skip: number; total: number; items: ITemplate[] }
}

export interface TemplateStateProperties {
  byStaticId: Map<string, Map<keyof ITemplate, any>>
  staticIds: List<string>
  total: number
}

export type EditorTemplatesState = ImmutableMap<TemplateStateProperties>
