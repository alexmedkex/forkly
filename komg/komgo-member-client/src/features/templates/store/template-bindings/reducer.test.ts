import * as React from 'react'
import reducer from './reducer'
import { buildFakeTemplateBinding, Product } from '@komgo/types'
import {
  EditorTemplateBindingsActionType,
  GetTemplateBindingsSuccessAction,
  FetchTemplateBindingsSuccessAction
} from './types'
import { fromJS } from 'immutable'

describe('template bindings reducer', () => {
  it('has an empty initial state', () => {
    const initialState = reducer(undefined as any, { type: 'any' })

    expect(initialState).toMatchSnapshot()
  })
  it('stores the correct data when seeing a GET_TEMPLATE_BINDING_SUCCESS action', () => {
    const templateBinding = buildFakeTemplateBinding()
    const action: GetTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
      payload: templateBinding
    }

    const state = reducer(undefined as any, action)

    expect(state.get('total')).toEqual(1)
    expect(state.get('byStaticId').get(templateBinding.staticId)).toEqual(fromJS(templateBinding))
  })
  it('does not store twice if same action seen twice', () => {
    const templateBinding = buildFakeTemplateBinding()
    const action: GetTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
      payload: templateBinding
    }

    const state = reducer(undefined as any, action)
    const updatedState = reducer(state, action)

    expect(updatedState.get('total')).toEqual(1)
    expect(updatedState.get('byStaticId').get(templateBinding.staticId)).toEqual(fromJS(templateBinding))
  })
  it('stores the update to the template binding when seeing a GET_TEMPLATE_BINDING_SUCCESS action with the same staticId', () => {
    const templateBinding = buildFakeTemplateBinding()
    const firstAction: GetTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
      payload: templateBinding
    }

    const state = reducer(undefined as any, firstAction)

    const updatedTemplateBinding = buildFakeTemplateBinding({ subProductId: 'TEST' as any })
    const secondAction: GetTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
      payload: updatedTemplateBinding
    }

    const updatedState = reducer(state, secondAction)

    expect(updatedState.get('total')).toEqual(1)
    expect(updatedState.get('byStaticId').get(updatedTemplateBinding.staticId)).toEqual(fromJS(updatedTemplateBinding))
  })
  it('adds new template bindings without deleting old ones', () => {
    const templateBinding = buildFakeTemplateBinding()
    const firstAction: GetTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
      payload: templateBinding
    }

    const state = reducer(undefined as any, firstAction)

    const newTemplateBinding = buildFakeTemplateBinding({ staticId: 'other', productId: 'OTHER' as any })
    const secondAction: GetTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.GET_TEMPLATE_BINDING_SUCCESS,
      payload: newTemplateBinding
    }

    const updatedState = reducer(state, secondAction)

    expect(updatedState).toMatchSnapshot()
  })
  it('stores the correct data when it sees a FETCH_TEMPLATE_BINDINGS_SUCCESS action', () => {
    const templateBinding = buildFakeTemplateBinding()
    const action: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [templateBinding],
        total: 1
      }
    }

    const state = reducer(undefined as any, action)

    expect(state.get('total')).toEqual(1)
    expect(state.get('byStaticId').get(templateBinding.staticId)).toEqual(fromJS(templateBinding))
  })
  it('does not store twice if same action seen twice', () => {
    const templateBinding = buildFakeTemplateBinding()
    const action: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [templateBinding],
        total: 1
      }
    }

    const state = reducer(undefined as any, action)
    const updatedState = reducer(state, action)

    expect(updatedState.get('total')).toEqual(1)
    expect(updatedState.get('byStaticId').get(templateBinding.staticId)).toEqual(fromJS(templateBinding))
  })
  it('stores the update to the template when seeing a FETCH_TEMPLATE_BINDINGS_SUCCESS action with the same staticId', () => {
    const templateBinding = buildFakeTemplateBinding()
    const firstAction: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [templateBinding],
        total: 1
      }
    }

    const state = reducer(undefined as any, firstAction)

    const updatedTemplateBinding = buildFakeTemplateBinding({ productId: Product.KYC })
    const secondAction: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [updatedTemplateBinding],
        total: 1
      }
    }

    const updatedState = reducer(state, secondAction)

    expect(updatedState.get('total')).toEqual(1)
    expect(updatedState.get('byStaticId').get(updatedTemplateBinding.staticId)).toEqual(fromJS(updatedTemplateBinding))
  })
  it('adds new template bindings without deleting old ones', () => {
    const templateBinding = buildFakeTemplateBinding()
    const firstAction: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [templateBinding],
        total: 1
      }
    }

    const state = reducer(undefined as any, firstAction)

    const newTemplateBinding = buildFakeTemplateBinding({ staticId: 'other', productId: Product.KYC })
    const secondAction: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [newTemplateBinding],
        total: 1
      }
    }

    const updatedState = reducer(state, secondAction)

    expect(updatedState.get('total')).toEqual(2)
    expect(updatedState.get('byStaticId').get(newTemplateBinding.staticId)).toEqual(fromJS(newTemplateBinding))
    expect(updatedState.get('byStaticId').get(templateBinding.staticId)).toEqual(fromJS(templateBinding))
  })
  it('can add multiple templates in one call', () => {
    const templateBinding1 = buildFakeTemplateBinding()
    const templateBinding2 = buildFakeTemplateBinding({ staticId: 'other', productId: Product.KYC })

    const action: FetchTemplateBindingsSuccessAction = {
      type: EditorTemplateBindingsActionType.FETCH_TEMPLATE_BINDINGS_SUCCESS,
      payload: {
        limit: 100,
        skip: 0,
        items: [templateBinding1, templateBinding2],
        total: 1
      }
    }

    const state = reducer(undefined as any, action)

    expect(state).toMatchSnapshot()
  })
})
