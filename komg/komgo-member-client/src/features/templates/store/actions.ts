import { fetchTemplates, getTemplate, TemplateActionThunk } from './templates/actions'
import { fetchTemplateBindings, getTemplateBinding } from './template-bindings/actions'
import { ApplicationState } from '../../../store/reducers'
import { Action, ActionCreator } from 'redux'

export const fetchTemplatesWithTemplateBindings = (params?: any) => (dispatch, getState, api) => {
  const afterHandler = () => (dispatcher, getState, api) => {
    const state: ApplicationState = getState()
    const templateBindingIds = state
      .get('editorTemplates')
      .get('byStaticId')
      .toList()
      .map(t => t.get('templateBindingStaticId'))
      .toSet()

    if (templateBindingIds.size) {
      fetchTemplateBindings({ filter: { query: { staticId: { $in: templateBindingIds } } } })(dispatcher, getState, api)
    }
  }
  fetchTemplates(params, afterHandler)(dispatch, getState, api)
}

export const getTemplateWithTemplateBinding: ActionCreator<TemplateActionThunk> = (
  params: { staticId: string },
  afterHandler?: ActionCreator<TemplateActionThunk>
) => (dispatch, _, api): Action => {
  return getTemplate(params, () => (dispatcher, getState, api) => {
    const templates = getState()
      .get('editorTemplates')
      .get('byStaticId')
    const templateBidingId = templates.get(params.staticId).get('templateBindingStaticId')
    return getTemplateBinding(templateBidingId)(dispatcher, getState, api)
  })(dispatch, _, api)
}
