import reducer, { initialQuoteState } from './reducer'
import { QuoteActionType, QuoteAction, FetchHistorySucceeded } from './types'
import { fromJS } from 'immutable'
import { IQuote, buildFakeQuote } from '@komgo/types'
import { fakeAgreedTermsHistory } from '../../utils/faker'

describe('Quote reducer', () => {
  describe('defaults', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined as any, { type: 'NONE' })).toMatchSnapshot()
    })
  })

  describe(QuoteActionType.UPDATE_QUOTE_SUCCESS, () => {
    it('merges the action payload with the corresponding Quote, updating existing data', () => {
      const mockQuote = buildFakeQuote()
      const payload: IQuote = {
        ...mockQuote,
        advanceRate: 10
      }
      delete payload.staticId

      const action: QuoteAction = {
        type: QuoteActionType.UPDATE_QUOTE_SUCCESS,
        payload
      }
      const prevState = initialQuoteState.set('byId', fromJS({ [mockQuote.staticId]: mockQuote }))

      const state = reducer(prevState, action)

      const quote = state.get('byId').toJS()[mockQuote.staticId]
      expect(quote).toEqual(
        expect.objectContaining({
          staticId: mockQuote.staticId,
          advanceRate: 10
        })
      )
    })
  })

  describe(QuoteActionType.FETCH_QUOTE_SUCCESS, () => {
    it('merges the action payload with the corresponding Quote, updating existing data', () => {
      const mockQuote = buildFakeQuote()

      const action = {
        type: QuoteActionType.FETCH_QUOTE_SUCCESS,
        payload: mockQuote
      }
      const prevState = initialQuoteState.set('byId', fromJS({ [mockQuote.staticId]: mockQuote }))

      const state = reducer(prevState, action)

      const quote = state.get('byId').toJS()[mockQuote.staticId]
      expect(quote).toEqual(
        expect.objectContaining({
          staticId: mockQuote.staticId,
          advanceRate: 10
        })
      )
    })
  })

  describe(QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS, () => {
    it('merges the action payload with the corresponding Quote history, updating existing data', () => {
      const mockQuoteHistory = fakeAgreedTermsHistory()

      const action: FetchHistorySucceeded = {
        type: QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS,
        payload: mockQuoteHistory,
        quoteId: 'quoteId'
      }
      const prevState = initialQuoteState.set('historyById', fromJS({ [action.quoteId]: mockQuoteHistory }))

      const state = reducer(prevState, action)

      const quoteHistory = state.get('historyById').toJS()[action.quoteId]
      expect(quoteHistory).toEqual(mockQuoteHistory)
    })
  })

  describe('errors', () => {
    it(`sets error on ${QuoteActionType.UPDATE_QUOTE_FAILURE}`, () => {
      const action = {
        type: QuoteActionType.UPDATE_QUOTE_FAILURE,
        payload: 'hi'
      }

      const state = reducer(undefined as any, action)

      expect(state.get('error')).toEqual('hi')
    })
  })
})
