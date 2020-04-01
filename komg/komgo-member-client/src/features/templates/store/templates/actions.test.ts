import { fetchTemplates, createTemplate, updateTemplate, getTemplate, deleteTemplate } from './actions'
import { EditorTemplatesActionType } from './types'
import { buildFakeTemplate, buildFakeTemplateBase, ITemplate, ITemplateBase } from '@komgo/types'

describe('template actions', () => {
  let dispatchMock: any
  let apiMock: any
  let getStateMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => dummyAction),
      post: jest.fn(() => dummyAction),
      put: jest.fn(() => dummyAction),
      delete: jest.fn(() => dummyAction)
    }
    getStateMock = jest.fn()
  })

  describe('fetchTemplates', () => {
    it('hands the api middleware the correct arguments', () => {
      const params = { filter: { a: 'b' } }
      fetchTemplates(params)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/template/v0/templates')

      expect(config.type).toEqual(EditorTemplatesActionType.FETCH_TEMPLATES_REQUEST)
      expect(config.onError).toEqual(EditorTemplatesActionType.FETCH_TEMPLATES_FAILURE)
      expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.params).toEqual(params)
    })
  })

  describe('createTemplate', () => {
    it('configures an action', () => {
      const template: ITemplateBase = buildFakeTemplateBase()
      createTemplate(template)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/template/v0/templates')

      expect(config.onError).toEqual(EditorTemplatesActionType.CREATE_TEMPLATE_FAILURE)
      expect(config.data).toEqual(template)
      expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.CREATE_TEMPLATE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(EditorTemplatesActionType.CREATE_TEMPLATE_REQUEST)
    })
  })

  describe('updateTemplate', () => {
    it('configures an action', () => {
      const template: ITemplate = buildFakeTemplate()
      updateTemplate(template)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual(`/template/v0/templates/${template.staticId}`)

      // expect(config.onError).toEqual(EditorTemplatesActionType.UPDATE_TEMPLATE_FAILURE)
      expect(config.onError).toBeDefined()
      expect(config.data).toEqual(template)
      expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.UPDATE_TEMPLATE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(EditorTemplatesActionType.UPDATE_TEMPLATE_REQUEST)
    })

    it('onError', () => {
      const template: ITemplate = buildFakeTemplate()
      const error = {
        response: {
          status: '400',
          headers: [],
          data: {
            message: 'a error'
          }
        }
      }

      updateTemplate(template)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual(`/template/v0/templates/${template.staticId}`)
      expect(config.onError(EditorTemplatesActionType.UPDATE_TEMPLATE_FAILURE, error)).toBeDefined()
      expect(config.data).toEqual(template)
      expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.UPDATE_TEMPLATE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(EditorTemplatesActionType.UPDATE_TEMPLATE_REQUEST)
    })
  })

  describe('getTemplate', () => {
    it('configures an action', () => {
      const staticId = 'bcfabd1f-f542-4e37-8e86-63a1db0b5005'
      getTemplate({ staticId })(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/template/v0/templates/${staticId}`)

      expect(config.onError).toEqual(EditorTemplatesActionType.GET_TEMPLATE_FAILURE)
      expect(config.params).not.toBeDefined()
      expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.GET_TEMPLATE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(EditorTemplatesActionType.GET_TEMPLATE_REQUEST)
    })
  })

  describe('deleteTemplate', () => {
    it('configures an action', () => {
      const staticId = 'bcfabd1f-f542-4e37-8e86-63a1db0b5005'
      deleteTemplate({ staticId })(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.delete.mock.calls[0]

      expect(endpoint).toEqual(`/template/v0/templates/${staticId}`)

      expect(config.onError).toEqual(EditorTemplatesActionType.DELETE_TEMPLATE_FAILURE)
      expect(config.params).not.toBeDefined()
      expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.DELETE_TEMPLATE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(EditorTemplatesActionType.DELETE_TEMPLATE_REQUEST)
    })
  })
})
