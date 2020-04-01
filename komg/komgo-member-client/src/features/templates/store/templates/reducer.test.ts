import reducer from './reducer'
import { EditorTemplatesActionType, FetchTemplatesSuccessAction } from './types'
import { fromJS } from 'immutable'
import { buildFakeTemplate } from '@komgo/types'
import { EMPTY_TEMPLATE } from '../../utils/constants'

describe('templates reducer', () => {
  it('has an empty initial state', () => {
    const initialState = reducer(undefined as any, { type: 'any' })

    expect(initialState).toMatchSnapshot()
  })

  describe('FETCH_TEMPLATES_SUCCESS', () => {
    it('stores the correct data when seeing a FETCH_TEMPLATES_SUCCESS action', () => {
      const template = buildFakeTemplate()
      const action: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template],
          total: 1
        }
      }

      const state = reducer(undefined as any, action)

      expect(state.get('total')).toEqual(1)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(fromJS(template))
    })
    it('does not store twice if same action seen twice', () => {
      const template = buildFakeTemplate()
      const action: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template],
          total: 1
        }
      }

      const state = reducer(undefined as any, action)
      const updatedState = reducer(state, action)

      expect(updatedState.get('total')).toEqual(1)
      expect(updatedState.get('byStaticId').get(template.staticId)).toEqual(fromJS(template))
    })
    it('stores the update to the template when seeing a FETCH_TEMPLATES_SUCCESS action with the same staticId', () => {
      const template = buildFakeTemplate()
      const firstAction: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template],
          total: 1
        }
      }

      const state = reducer(undefined as any, firstAction)

      const updatedTemplate = buildFakeTemplate({ commodity: 'GRASS' })
      const secondAction: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [updatedTemplate],
          total: 1
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(1)
      expect(updatedState.get('byStaticId').get(updatedTemplate.staticId)).toEqual(fromJS(updatedTemplate))
    })

    // TODO LS we need to use mergeDeepWith to reactivate this one
    it.skip('adds new templates without deleting old ones', () => {
      const template = buildFakeTemplate()
      const firstAction: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template],
          total: 1
        }
      }

      const state = reducer(undefined as any, firstAction)

      const newTemplate = buildFakeTemplate({ staticId: 'other', commodity: 'GRASS' })
      const secondAction: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [newTemplate],
          total: 1
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(2)
      expect(updatedState.get('byStaticId').get(newTemplate.staticId)).toEqual(fromJS(newTemplate))
      expect(updatedState.get('byStaticId').get(template.staticId)).toEqual(fromJS(template))
    })
    it('can add multiple templates in one call', () => {
      const template1 = buildFakeTemplate()
      const template2 = buildFakeTemplate({ staticId: 'other', commodity: 'GRASS' })

      const action: FetchTemplatesSuccessAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template1, template2],
          total: 1
        }
      }

      const state = reducer(undefined as any, action)

      expect(state).toMatchSnapshot()
    })
  })

  describe('CREATE_TEMPLATE_SUCCESS', () => {
    it('stores a template', () => {
      const template = buildFakeTemplate()
      const action = {
        type: EditorTemplatesActionType.CREATE_TEMPLATE_SUCCESS,
        payload: template
      }

      const state = reducer(undefined as any, action)
      const expectedTemplate = state
        .get('byStaticId')
        .get(template.staticId)
        .toJS()
      expect(expectedTemplate).toEqual(template)
    })
  })

  describe('GET_TEMPLATE_SUCCESS', () => {
    it('stores a template', () => {
      const template = buildFakeTemplate()
      const action = {
        type: EditorTemplatesActionType.GET_TEMPLATE_SUCCESS,
        payload: template
      }

      const state = reducer(undefined as any, action)
      const expectedTemplate = state
        .get('byStaticId')
        .get(template.staticId)
        .toJS()
      expect(expectedTemplate).toEqual(template)
    })
    it('stores an already loaded template', () => {
      let state
      const template = buildFakeTemplate({ template: EMPTY_TEMPLATE as any })
      const initialAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template, buildFakeTemplate({ staticId: 'b3eb8171-247a-4e05-9ddf-ebfd02aaa10a' })],
          total: 2
        }
      }

      state = reducer(undefined as any, initialAction)
      expect(state.get('byStaticId').size).toEqual(initialAction.payload.items.length)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(fromJS(template))

      // remove some leaves from the template data structure
      const update = {
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              data: {},
              nodes: [
                {
                  object: 'text',
                  text: 'Empty Template',
                  marks: [{ object: 'mark', type: 'bold', data: {} }]
                }
              ]
            }
          ]
        }
      }

      template.template = update

      const action = {
        type: EditorTemplatesActionType.GET_TEMPLATE_SUCCESS,
        payload: template
      }

      state = reducer(state as any, action)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(
        fromJS({
          ...template,
          template: update
        })
      )
      expect(state.get('total')).toEqual(initialAction.payload.items.length)
    })
  })

  describe('DELETE_TEMPLATE_SUCCESS', () => {
    it('deletes a template', () => {
      let state
      const template = buildFakeTemplate()
      const initialAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template, buildFakeTemplate({ staticId: 'b3eb8171-247a-4e05-9ddf-ebfd02aaa10a' })],
          total: 2
        }
      }

      state = reducer(undefined as any, initialAction)
      expect(state.get('byStaticId').size).toEqual(initialAction.payload.items.length)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(fromJS(template))

      const action = {
        type: EditorTemplatesActionType.DELETE_TEMPLATE_SUCCESS,
        meta: {
          url: `templates/v0/templates/${template.staticId}`
        }
      }

      state = reducer(state as any, action)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(undefined)
      expect(state.get('total')).toEqual(initialAction.payload.items.length - 1)
    })
  })

  // TODO LS to use this approach we need to pass the data in the meta src/utils/http.ts which could lead to a major refactor
  describe.skip('UPDATE_TEMPLATE_SUCCESS', () => {
    it('updates a template', () => {
      let state
      const template = buildFakeTemplate({ template: EMPTY_TEMPLATE as any })
      const initialAction = {
        type: EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [template, buildFakeTemplate({ staticId: 'b3eb8171-247a-4e05-9ddf-ebfd02aaa10a' })],
          total: 2
        }
      }

      state = reducer(undefined as any, initialAction)
      expect(state.get('byStaticId').size).toEqual(initialAction.payload.items.length)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(fromJS(template))

      // remove some leaves from the template data structure
      const update = {
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: [
            {
              object: 'block',
              type: 'paragraph',
              data: {},
              nodes: [
                {
                  object: 'text',
                  text: 'Empty Template',
                  marks: [{ object: 'mark', type: 'bold', data: {} }]
                }
              ]
            }
          ]
        }
      }

      template.template = update

      const action = {
        type: EditorTemplatesActionType.UPDATE_TEMPLATE_SUCCESS,
        meta: {
          url: `templates/v0/templates/${template.staticId}`,
          params: template
        }
      }

      state = reducer(state as any, action)
      expect(state.get('byStaticId').get(template.staticId)).toEqual(
        fromJS({
          ...template,
          template: update
        })
      )
      expect(state.get('total')).toEqual(initialAction.payload.items.length)
    })
  })
})
