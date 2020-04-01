import * as immutable from 'immutable'
import { Reducer } from 'redux'

import { TemplateAction, TemplateActionType, TemplateState, TemplateStateFields, Template } from '../types'

export const intialStateFields: TemplateStateFields = { templates: [], error: null }

export const initialState: TemplateState = immutable.Map(intialStateFields)

const reducer: Reducer<TemplateState> = (state = initialState, action: TemplateAction): TemplateState => {
  switch (action.type) {
    case TemplateActionType.FETCH_TEMPLATE_SUCCESS: {
      const templates = state.get('templates')
      return state.set('templates', action.payload)
    }
    case TemplateActionType.FETCH_TEMPLATE_ERROR: {
      return state.set('error', action.error)
    }
    case TemplateActionType.CREATE_TEMPLATE_SUCCESS: {
      const templates = state.get('templates')
      return state.set('templates', [...templates, action.payload])
    }
    case TemplateActionType.CREATE_TEMPLATE_ERROR: {
      return state.set('error', action.error)
    }
    case TemplateActionType.UPDATE_TEMPLATE_SUCCESS: {
      const templates = state.get('templates')
      return state.set(
        'templates',
        templates.map((template: Template) => {
          return template.id === action.payload.id ? { ...template, ...action.payload } : template
        })
      )
    }
    case TemplateActionType.UPDATE_TEMPLATE_ERROR: {
      return state.set('error', action.error)
    }
    case TemplateActionType.DELETE_TEMPLATE_SUCCESS: {
      const templates = state.get('templates')
      return state.set('templates', templates.filter((template: Template) => template.id !== action.payload))
    }
    case TemplateActionType.DELETE_TEMPLATE_ERROR: {
      return state.set('error', action.error)
    }
    default:
      return state
  }
}

export default reducer
