import * as React from 'react'
import { v4 } from 'uuid'
import { getTemplateBinding, fetchTemplateBindings } from './actions'
import { EditorTemplateBindingsActionType } from './types'
import { stringify } from 'qs'
import { compressToBase64 } from 'lz-string'

describe('template bindings actions', () => {
  describe('getTemplateBinding', () => {
    let dispatchMock: any
    let apiMock: any
    let getStateMock: any
    const dummyAction = { type: 'test' }

    beforeEach(() => {
      dispatchMock = jest.fn()
      apiMock = {
        post: jest.fn(() => dummyAction),
        get: jest.fn(() => dummyAction)
      }
      getStateMock = jest.fn()
    })
    it('hands the api middleware the correct arguments', () => {
      const templateBindingId = v4()
      getTemplateBinding(templateBindingId)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/template/v0/templatebindings/${templateBindingId}`)

      expect(config.type).toEqual(EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_REQUEST)
      expect(config.onError).toEqual(EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_FAILURE)
      expect(config.onSuccess.type).toEqual(EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })
  describe('fetchTemplateBindings', () => {
    let dispatchMock: any
    let apiMock: any
    let getStateMock: any
    const dummyAction = { type: 'test' }

    beforeEach(() => {
      dispatchMock = jest.fn()
      apiMock = {
        post: jest.fn(() => dummyAction),
        get: jest.fn(() => dummyAction)
      }
      getStateMock = jest.fn()
    })

    it('calls api.get with compressed filter', () => {
      const filter = {
        query: {
          staticId: { $in: [v4()] },
          projection: undefined,
          options: { sort: { updateAt: -1 } }
        }
      }

      const params = { filter }

      fetchTemplateBindings(params)(dispatchMock, getStateMock, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('/template/v0/templatebindings', {
        onError: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_FAILURE,
        onSuccess: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
        type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_REQUEST,
        params: { filter: compressToBase64(stringify(filter)) }
      })
    })
  })
})
