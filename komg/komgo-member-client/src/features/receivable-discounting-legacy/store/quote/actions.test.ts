import { buildFakeQuoteBase } from '@komgo/types'
import { updateAcceptedQuote, fetchSingleQuote, fetchHistoryForAgreedTerms } from './actions'
import { QuoteActionType } from './types'
describe('Quote actions', () => {
  let dispatchMock: any
  let apiMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction),
      put: jest.fn(() => dummyAction)
    }
  })

  describe('updateAcceptedQuote', () => {
    const mockQuoteId = 'quote123'
    const updateQuoteEndpoint = `/receivable-finance/v0/quote/${mockQuoteId}`
    const getQuoteHistoryEndpoint = `/receivable-finance/v0/quote/${mockQuoteId}/history`
    const shareQuoteEndpoint = `/receivable-finance/v0/quote/${mockQuoteId}/share`

    it('calls api.post with the correct arguments', () => {
      const mockQuoteBase = buildFakeQuoteBase()
      updateAcceptedQuote(mockQuoteBase, mockQuoteId)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual(updateQuoteEndpoint)

      expect(config.data).toEqual(mockQuoteBase)
      expect(config.onSuccess.type).toEqual(QuoteActionType.UPDATE_QUOTE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.onError).toEqual(QuoteActionType.UPDATE_QUOTE_FAILURE)
    })

    it('shares the updated Quote and gets the history on success', () => {
      const mockQuoteBase = buildFakeQuoteBase()
      updateAcceptedQuote(mockQuoteBase, mockQuoteId)(dispatchMock, null, apiMock)

      const [_, updateConf] = apiMock.put.mock.calls[0]

      updateConf.onSuccess.afterHandler({ dispatch: dispatchMock })

      const [historyEndpoint, historyConf] = apiMock.get.mock.calls[0]
      const [shareEndpoint, shareConf] = apiMock.post.mock.calls[0]

      expect(historyEndpoint).toEqual(getQuoteHistoryEndpoint)
      expect(historyConf.type).toEqual(QuoteActionType.FETCH_QUOTE_HISTORY_REQUEST)
      expect(historyConf.onError).toEqual(QuoteActionType.FETCH_QUOTE_HISTORY_FAILURE)
      expect(historyConf.onSuccess.type).toEqual(QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS)

      expect(shareEndpoint).toEqual(shareQuoteEndpoint)
      expect(shareConf.type).toEqual(QuoteActionType.SHARE_QUOTE_REQUEST)
      expect(shareConf.onError).toEqual(QuoteActionType.SHARE_QUOTE_FAILURE)
      expect(shareConf.onSuccess).toEqual(QuoteActionType.SHARE_QUOTE_SUCCESS)
    })
  })

  describe('fetchSingleQuote', () => {
    const mockQuoteId = 'quote123'
    const updateQuoteEndpoint = `/receivable-finance/v0/quote/${mockQuoteId}`

    it('calls api.get with the correct arguments', () => {
      fetchSingleQuote(mockQuoteId)(dispatchMock, null, apiMock)

      const [endpoint] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(updateQuoteEndpoint)

      expect(apiMock.get).toHaveBeenCalledWith(updateQuoteEndpoint, {
        onError: QuoteActionType.FETCH_QUOTE_FAILURE,
        onSuccess: QuoteActionType.FETCH_QUOTE_SUCCESS,
        type: QuoteActionType.FETCH_QUOTE_REQUEST
      })
    })
  })

  describe('fetchHistoryForAgreedTerms', () => {
    const mockQuoteId = 'quote123'
    const updateQuoteEndpoint = `/receivable-finance/v0/quote/${mockQuoteId}/history`

    it('calls api.get with the correct arguments', () => {
      fetchHistoryForAgreedTerms(mockQuoteId)(dispatchMock, null, apiMock)

      const [endpoint] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(updateQuoteEndpoint)

      expect(apiMock.get).toHaveBeenCalledWith(updateQuoteEndpoint, {
        onError: QuoteActionType.FETCH_QUOTE_HISTORY_FAILURE,
        onSuccess: {
          type: QuoteActionType.FETCH_QUOTE_HISTORY_SUCCESS,
          quoteId: mockQuoteId
        },
        type: QuoteActionType.FETCH_QUOTE_HISTORY_REQUEST
      })
    })
  })
})
