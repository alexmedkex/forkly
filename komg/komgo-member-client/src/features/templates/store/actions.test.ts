import { fetchTemplatesWithTemplateBindings } from './actions'
import { EditorTemplatesActionType } from './templates/types'
import { fromJS } from 'immutable'
import { buildFakeTemplate } from '@komgo/types'
import { EditorTemplateBindingsActionType } from './template-bindings/types'
import { getTemplateWithTemplateBinding } from './actions'

describe('fetchTemplatesWithTemplateBindings', () => {
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

    fetchTemplatesWithTemplateBindings()(dispatchMock, getStateMock, apiMock)
  })

  it('calls api once for fetching templates', () => {
    fetchTemplatesWithTemplateBindings()(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.get.mock.calls[0]

    expect(endpoint).toEqual('/template/v0/templates')

    expect(config.type).toEqual(EditorTemplatesActionType.FETCH_TEMPLATES_REQUEST)
    expect(config.onError).toEqual(EditorTemplatesActionType.FETCH_TEMPLATES_FAILURE)
    expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.FETCH_TEMPLATES_SUCCESS)
  })
  it('contains an afterHandler which calls next endpoint when called', () => {
    const [_, firstConfig] = apiMock.get.mock.calls[0]

    expect(firstConfig.onSuccess.afterHandler).toBeDefined()

    const template = buildFakeTemplate()

    getStateMock = jest.fn().mockImplementation(() =>
      fromJS({
        editorTemplates: {
          byStaticId: {
            [template.staticId]: template
          }
        }
      })
    )

    expect(apiMock.get).toHaveBeenCalledTimes(1)

    firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(apiMock.get).toHaveBeenCalledTimes(2)

    const [endpoint, secondConfig] = apiMock.get.mock.calls[1]

    expect(endpoint).toEqual(`/template/v0/templatebindings`)
    expect(secondConfig.type).toEqual(EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_REQUEST)
    expect(secondConfig.params).toEqual({ filter: expect.objectContaining({}) })
  })
  it('calls the templatebindings endpoint for each unique template binding in the store', () => {
    const [_, firstConfig] = apiMock.get.mock.calls[0]

    expect(firstConfig.onSuccess.afterHandler).toBeDefined()

    const template1 = buildFakeTemplate()
    const template2 = buildFakeTemplate({ staticId: 'different-but-same-binding-id' })
    const template3 = buildFakeTemplate({ staticId: 'different-binding-id', templateBindingStaticId: 'abc' })

    getStateMock = jest.fn().mockImplementation(() =>
      fromJS({
        editorTemplates: {
          byStaticId: {
            [template1.staticId]: template1,
            [template2.staticId]: template2,
            [template3.staticId]: template3
          }
        }
      })
    )

    expect(apiMock.get).toHaveBeenCalledTimes(1)

    firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(apiMock.get).toHaveBeenCalledTimes(2)

    const [endpoint, config] = apiMock.get.mock.calls[1]

    expect(endpoint).toEqual(`/template/v0/templatebindings`)
    expect(config.type).toEqual(EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_REQUEST)
    expect(config.params).toEqual({ filter: expect.objectContaining({}) })
  })
})

describe('getTemplateWithTemplateBinding', () => {
  let dispatchMock: any
  let apiMock: any
  let getStateMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => dummyAction),
      post: jest.fn(() => dummyAction),
      put: jest.fn(() => dummyAction)
    }
    getStateMock = jest.fn()
  })

  it('configures an action', () => {
    const staticId = 'bcfabd1f-f542-4e37-8e86-63a1db0b5005'
    getTemplateWithTemplateBinding({ staticId })(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.get.mock.calls[0]

    expect(endpoint).toEqual(`/template/v0/templates/${staticId}`)

    expect(config.onError).toEqual(EditorTemplatesActionType.GET_TEMPLATE_FAILURE)
    expect(config.params).not.toBeDefined()
    expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.GET_TEMPLATE_SUCCESS)
    expect(config.onSuccess.afterHandler).toBeDefined()
    expect(config.type).toEqual(EditorTemplatesActionType.GET_TEMPLATE_REQUEST)
  })

  it('call the afterHandler', () => {
    const staticId = 'bcfabd1f-f542-4e37-8e86-63a1db0b5005'
    const templateBindingStaticId = '8fa6a6d1-10b9-4ce8-8f7a-c9d56a919245'
    getStateMock = jest.fn(() =>
      fromJS({
        editorTemplates: {
          byStaticId: {
            [staticId]: buildFakeTemplate({ staticId, templateBindingStaticId })
          }
        }
      })
    )
    getTemplateWithTemplateBinding({ staticId })(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.get.mock.calls[0]

    expect(endpoint).toEqual(`/template/v0/templates/${staticId}`)
    expect(config.onSuccess.type).toEqual(EditorTemplatesActionType.GET_TEMPLATE_SUCCESS)

    config.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    const [afterHandlerEndpoint, afterHandlerConfig] = apiMock.get.mock.calls[1]

    expect(afterHandlerEndpoint).toEqual(`/template/v0/templatebindings/${templateBindingStaticId}`)
    expect(afterHandlerConfig.type).toEqual(EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_REQUEST)
    expect(afterHandlerConfig.onSuccess.type).toEqual(EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS)
    expect(afterHandlerConfig.onError).toEqual(EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_FAILURE)
  })
})
