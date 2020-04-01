import * as React from 'react'
import reducer from './reducer'
import { buildFakeLetterOfCredit, IDataLetterOfCredit, LetterOfCreditStatus } from '@komgo/types'
import {
  FetchLettersOfCreditSuccessAction,
  LetterOfCreditActionType,
  ILetterOfCreditWithData,
  TemplateStateProperties,
  GetLetterOfCreditSuccessAction
} from './types'
import { fromJS } from 'immutable'
import { ImmutableMap } from '../../../utils/types'
import { EMPTY_TEMPLATE } from '../../templates/utils/constants'
describe('templated letters of credit reducer', () => {
  let letterOfCredit: ILetterOfCreditWithData
  let updatedLetterOfCredit: ILetterOfCreditWithData
  let otherLetterOfCredit: ILetterOfCreditWithData
  let initialState: ImmutableMap<TemplateStateProperties>

  beforeAll(() => {
    letterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>()
    updatedLetterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>({ status: LetterOfCreditStatus.Issued })

    otherLetterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>({
      staticId: 'other',
      status: LetterOfCreditStatus.Draft
    })
    initialState = reducer(undefined as any, { type: 'any' })
  })
  it('has an empty initial state', () => {
    expect(initialState).toMatchSnapshot()
  })
  describe('FETCH_LETTERS_OF_CREDIT_SUCCESS', () => {
    it('stores a letter of credit successfully', () => {
      const action: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCredit],
          total: 1
        }
      }

      const state = reducer(initialState, action)

      expect(state.get('total')).toEqual(1)
      expect(state.get('byStaticId').get(letterOfCredit.staticId)).toEqual(fromJS(letterOfCredit))
    })
    it('does not store twice if same action seen twice', () => {
      const action: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCredit],
          total: 1
        }
      }

      const state = reducer(initialState, action)
      const updatedState = reducer(state, action)

      expect(updatedState.get('total')).toEqual(1)
      expect(state.get('byStaticId').get(letterOfCredit.staticId)).toEqual(fromJS(letterOfCredit))
    })
    it('stores the update to the lc when seeing a FETCH_LETTERS_OF_CREDIT_SUCCESS action with the same staticId', () => {
      const firstAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCredit],
          total: 1
        }
      }

      const state = reducer(initialState, firstAction)

      const secondAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [updatedLetterOfCredit],
          total: 1
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(1)
      expect(updatedState.get('byStaticId').get(updatedLetterOfCredit.staticId)).toEqual(fromJS(updatedLetterOfCredit))
    })
    it('does not merge the slate object from a FETCH', () => {
      const firstAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCredit],
          total: 1
        }
      }

      const state = reducer(initialState, firstAction)

      const newSlateObject = {}

      const updatedLetterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>()

      updatedLetterOfCredit.templateInstance.template = newSlateObject

      const secondAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [updatedLetterOfCredit],
          total: 1
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(1)
      expect(updatedState.get('byStaticId').get(updatedLetterOfCredit.staticId)).toEqual(fromJS(updatedLetterOfCredit))
    })
    it('adds new lcs without deleting old ones', () => {
      const firstAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCredit],
          total: 1
        }
      }

      const state = reducer(initialState, firstAction)

      const secondAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [otherLetterOfCredit],
          total: 1
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(2)
      expect(updatedState.get('byStaticId').get(otherLetterOfCredit.staticId)).toEqual(fromJS(otherLetterOfCredit))
      expect(updatedState.get('byStaticId').get(letterOfCredit.staticId)).toEqual(fromJS(letterOfCredit))
    })
    it('can add multiple letters of credit in one call', () => {
      const action: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCredit, otherLetterOfCredit],
          total: 2
        }
      }

      const state = reducer(initialState, action)

      expect(state).toMatchSnapshot()
    })
    it('overwrites the template with the one from the server', () => {
      const firstAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [
            {
              ...letterOfCredit,
              templateInstance: { ...letterOfCredit.templateInstance, template: EMPTY_TEMPLATE }
            },
            otherLetterOfCredit
          ],
          total: 2
        }
      }
      const state = reducer(undefined as any, firstAction)

      const updatedLetterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>()

      const [node] = EMPTY_TEMPLATE.document.nodes

      const template = { ...EMPTY_TEMPLATE, document: { ...EMPTY_TEMPLATE.document, nodes: [node] } }

      updatedLetterOfCredit.templateInstance.template = template

      const secondAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [updatedLetterOfCredit, otherLetterOfCredit],
          total: 2
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(2)
      expect(updatedState.get('byStaticId').get(updatedLetterOfCredit.staticId)).toEqual(fromJS(updatedLetterOfCredit))
    })
    it('merges the projection of a letter of credit', () => {
      const letterOfCreditWithEmptyTemplate = {
        ...letterOfCredit,
        status: LetterOfCreditStatus.Requested,
        templateInstance: { ...letterOfCredit.templateInstance, template: EMPTY_TEMPLATE }
      }
      const firstAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCreditWithEmptyTemplate, otherLetterOfCredit],
          total: 2
        }
      }
      const state = reducer(undefined as any, firstAction)

      const letterOfCreditProjection = {
        staticId: letterOfCredit.staticId,
        status: LetterOfCreditStatus.Issued
      } as ILetterOfCreditWithData

      const secondAction: FetchLettersOfCreditSuccessAction = {
        type: LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS,
        payload: {
          limit: 100,
          skip: 0,
          items: [letterOfCreditProjection, otherLetterOfCredit],
          total: 2
        }
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(2)
      expect(updatedState.get('byStaticId').get(letterOfCredit.staticId)).toEqual(
        fromJS({ ...letterOfCreditWithEmptyTemplate, ...letterOfCreditProjection })
      )
    })
  })

  describe('GET_LETTER_OF_CREDIT_SUCCESS', () => {
    it('stores a letter of credit successfully', () => {
      const action: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: letterOfCredit
      }

      const state = reducer(initialState, action)

      expect(state.get('total')).toEqual(1)
      expect(state.get('byStaticId').get(letterOfCredit.staticId)).toEqual(fromJS(letterOfCredit))
    })

    it('does not store twice if same action seen twice', () => {
      const action: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: letterOfCredit
      }

      const state = reducer(undefined as any, action)
      const updatedState = reducer(state, action)

      expect(updatedState.get('total')).toEqual(1)
      expect(state.get('byStaticId').get(letterOfCredit.staticId)).toEqual(fromJS(letterOfCredit))
    })
    it('stores the update to the lc when seeing a GET_LETTER_OF_CREDIT_SUCCESS action with the same staticId', () => {
      const firstAction: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: letterOfCredit
      }
      const state = reducer(undefined as any, firstAction)

      const secondAction: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: updatedLetterOfCredit
      }
      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(1)
      expect(updatedState.get('byStaticId').get(updatedLetterOfCredit.staticId)).toEqual(fromJS(updatedLetterOfCredit))
    })
    it('does not merge the slate object from a GET', () => {
      const firstAction: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: {
          ...letterOfCredit,
          templateInstance: { ...letterOfCredit.templateInstance, template: EMPTY_TEMPLATE }
        }
      }
      const state = reducer(undefined as any, firstAction)

      const updatedLetterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>()

      const [node] = EMPTY_TEMPLATE.document.nodes

      const template = { ...EMPTY_TEMPLATE, document: { ...EMPTY_TEMPLATE.document, nodes: [node] } }

      updatedLetterOfCredit.templateInstance.template = template

      const secondAction: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: updatedLetterOfCredit
      }

      const updatedState = reducer(state, secondAction)

      expect(updatedState.get('total')).toEqual(1)
      expect(updatedState.get('byStaticId').get(updatedLetterOfCredit.staticId)).toEqual(fromJS(updatedLetterOfCredit))
    })
    it('adds new lcs without deleting old ones', () => {
      const firstAction: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: letterOfCredit
      }

      const state = reducer(undefined as any, firstAction)

      const secondAction: GetLetterOfCreditSuccessAction = {
        type: LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS,
        payload: otherLetterOfCredit
      }
      const updatedState = reducer(state, secondAction)

      expect(updatedState).toMatchSnapshot()
    })
  })
})
