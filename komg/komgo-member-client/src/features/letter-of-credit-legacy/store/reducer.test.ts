import { LetterOfCreditAction, LetterOfCreditActionType } from '../../letter-of-credit-legacy/store/types'
import reducer from '../../letter-of-credit-legacy/store/reducer'
import { fromJS } from 'immutable'
import {
  fakeLetterOfCredit,
  fakeLetterOfCreditWithLegacyVaktIdOnly,
  fakeLetterOfCreditWithLegacyVaktId
} from '../../letter-of-credit-legacy/utils/faker'
import { ILetterOfCredit } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import { mockDate } from '../../letter-of-credit-legacy/utils/faker'
import { TradeActionType } from '../../trades/store/types'
import { TradeSource } from '@komgo/types'

let iLetterOfCredits: ILetterOfCredit[]

describe('LetterOfCredit reducer', () => {
  beforeEach(() => {
    mockDate().freeze('Tue Nov 13 2018 00:00:00 GMT+0000 (UTC)')
    iLetterOfCredits = [
      fakeLetterOfCredit({ _id: '5bc73b31ce857d15713fa47e', reference: 'LC-ME-121' }),
      fakeLetterOfCredit({ _id: '5bc73b1d5811f546c08ecd05', reference: 'LC-ME-123' }),
      fakeLetterOfCredit({ _id: '5bc73b1d5811f546c08ecc15', reference: 'LC-ME-122' })
    ]
  })

  afterEach(() => {
    mockDate().restore()
  })

  describe('defaults', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined as any, { type: 'NONE' })).toMatchSnapshot()
    })
  })

  describe(LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS, () => {
    it('returns a list of letters of credit', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
        payload: iLetterOfCredits
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('uses vaktId as a sourceId if not provided', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
        payload: [
          fakeLetterOfCreditWithLegacyVaktIdOnly({
            vaktId: 'vakt123456',
            sourceId: undefined
          })
        ]
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('uses sourceId if provided', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
        payload: [
          fakeLetterOfCreditWithLegacyVaktId({
            vaktId: 'vakt123456',
            sourceId: 'source123456'
          })
        ]
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
  })

  describe(LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS, () => {
    it('returns a letter of credit', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
        payload: fakeLetterOfCredit()
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('uses vaktId as a sourceId if not provided', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
        payload: fakeLetterOfCreditWithLegacyVaktIdOnly({
          vaktId: 'vakt123456',
          sourceId: undefined
        })
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
    it('uses sourceId if provided', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
        payload: fakeLetterOfCreditWithLegacyVaktId({
          vaktId: 'vakt123456',
          sourceId: 'source123456'
        })
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
  })

  describe.skip(LetterOfCreditActionType.SORT_LETTERS_OF_CREDIT, () => {
    it('returns a list of letters of credit ordered by a column', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.SORT_LETTERS_OF_CREDIT,
        payload: {
          column: 'reference',
          direction: 'ascending',
          companyStaticId: '123',
          trades: [],
          tasks: []
        }
      }
      const state = reducer(
        fromJS({
          byId: iLetterOfCredits.reduce((memo, letter: ILetterOfCredit) => {
            return {
              ...memo,
              [letter._id!]: letter
            }
          }, {}),
          ids: iLetterOfCredits.map(l => l._id)
        }),
        action
      )
      expect(state.get('ids').toJS()).toEqual([
        '5bc73b31ce857d15713fa47e',
        '5bc73b1d5811f546c08ecc15',
        '5bc73b1d5811f546c08ecd05'
      ])
    })
  })

  describe(LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE, () => {
    it('returns an error received', () => {
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE,
        payload: 'boom'
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
  })
  describe(LetterOfCreditActionType.CLEAR_ERROR, () => {
    it('clears the error', () => {
      const clearErrorAction: LetterOfCreditAction = {
        type: LetterOfCreditActionType.CLEAR_ERROR
      }

      const addErrorAction: LetterOfCreditAction = {
        type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE,
        payload: 'boom'
      }
      let state = reducer(undefined as any, addErrorAction)

      state = reducer(state, clearErrorAction)

      expect(state.get('error')).toBeNull()
    })
  })
  describe(LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_SUCCESS, () => {
    it('adds the limited data to the list of letters of credit', () => {
      const response = { _id: '123', reference: 'bob' }
      const action: LetterOfCreditAction = {
        type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_SUCCESS,
        payload: response
      }
      const state = reducer(undefined as any, action)
      expect(state).toMatchSnapshot()
    })
  })
  describe('errors', () => {
    it(`sets error on ${LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE}`, () => {
      const action = { type: LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE, payload: 'hi' }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual('hi')
    })
    it(`sets error on ${LetterOfCreditActionType.LETTERS_OF_CREDIT_FAILURE}`, () => {
      const action = { type: LetterOfCreditActionType.LETTERS_OF_CREDIT_FAILURE, payload: 'test' }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual('test')
    })
    it(`sets error on ${LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE}`, () => {
      const action = { type: LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE, payload: 'k' }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual('k')
    })
    it(`does not set error on other feature error`, () => {
      const action = { type: TradeActionType.TRADE_FAILURE, payload: 'k' }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toBeNull()
    })
  })
})
