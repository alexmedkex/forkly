import { buildFakeReceivablesDiscountingInfo, RDStatus } from '@komgo/types'
import { history } from '../../../store'
import {
  bankCreateQuote,
  bankDeclineRFP,
  bankSubmitQuote,
  createRequestForProposal,
  fetchDiscountingRequestPageData,
  fetchRFPSummaries,
  traderAcceptQuote,
  fetchHistoryForTrade,
  fetchRDRequesForProposalMembersData
} from './actions'
import { ReceivableDiscountingActionType } from './types'
import { TradeActionType } from '../../trades/store/types'
import { CreditLineActionType } from '../../credit-line/store/types'
import { fakeTrade } from '../../letter-of-credit-legacy/utils/faker'
import { ReceivableDiscountingApplicationActionType } from './application/types'

describe('Receivable discounting actions', () => {
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

  describe('createRequestForProposal', () => {
    const postRequestForProposalEndpoint = '/receivable-finance/v0/request-for-proposal/request'

    it('calls api.post with the correct arguments', () => {
      const testData = { rdId: '1', participantsStaticIds: ['2'] }
      createRequestForProposal(testData)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(postRequestForProposalEndpoint)

      expect(config.data).toEqual(testData)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.onError(null)).toEqual({
        type: ReceivableDiscountingActionType.CREATE_REQUEST_FOR_PROPOSAL_FAILURE,
        payload: null
      })
    })

    it('redirects to RD dashboard for seller', () => {
      const testData = { rdId: '1', participantsStaticIds: ['2'] }
      createRequestForProposal(testData)(dispatchMock, null, apiMock)
      const [_, config] = apiMock.post.mock.calls[0]

      config.onSuccess.afterHandler()

      expect(history.location.pathname).toBe('/receivable-discounting')
    })
  })

  describe('fetchRFPSummaries', () => {
    const testRdId = '123'
    const fetchDiscountingRequestQuotesEndpoint = `/receivable-finance/v0/rd/${testRdId}/request-for-proposal`

    it('calls api.get with the correct arguments', () => {
      fetchRFPSummaries(testRdId)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(apiMock.get).toHaveBeenCalledTimes(1)
      expect(endpoint).toEqual(fetchDiscountingRequestQuotesEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_FAILURE)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS)
      expect(config.onSuccess.rdId).toBe(testRdId)
      expect(config.type).toEqual(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_REQUEST)
    })
  })

  describe('createQuote', () => {
    const postCreateQuoteEndpoint = '/receivable-finance/v0/quote'

    it('calls api.post with the correct arguments', () => {
      const testData = { test: 123 }
      bankCreateQuote(testData)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(postCreateQuoteEndpoint)

      expect(config.onError).toEqual(ReceivableDiscountingActionType.CREATE_QUOTE_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess('Test')).toEqual({
        payload: 'Test',
        type: ReceivableDiscountingActionType.CREATE_QUOTE_SUCCESS
      })
    })
  })

  describe('bankSubmitQuote', () => {
    const postCreateQuoteEndpoint = '/receivable-finance/v0/request-for-proposal/submit-quote'

    it('calls api.post with the correct arguments', () => {
      const testData = { test: 123 }
      bankSubmitQuote(testData)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(postCreateQuoteEndpoint)

      expect(config.onError).toEqual(ReceivableDiscountingActionType.SUBMIT_QUOTE_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.SUBMIT_QUOTE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('bankDeclineRFP', () => {
    const postDeclineRequestEndpoint = '/receivable-finance/v0/request-for-proposal/reject'

    it('calls api.post with the correct arguments', () => {
      const testData = { test: 123 }
      bankDeclineRFP(testData)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(postDeclineRequestEndpoint)

      expect(config.onError).toEqual(ReceivableDiscountingActionType.REJECT_RFP_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.REJECT_RFP_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('traderAcceptQuote', () => {
    const postCreateQuoteEndpoint = '/receivable-finance/v0/request-for-proposal/accept-quote'

    it('calls api.post with the correct arguments', () => {
      const testData = { test: 123 }
      traderAcceptQuote(testData)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(postCreateQuoteEndpoint)

      expect(config.onError).toEqual(ReceivableDiscountingActionType.ACCEPT_QUOTE_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.ACCEPT_QUOTE_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('fetchDiscountingRequestPageData', () => {
    const testRdId = '123'
    const testParticipantId = '1234'
    const fetchDiscountingRequestQuotesEndpoint = `/receivable-finance/v0/rd/${testRdId}/request-for-proposal`
    const fetchSingleDiscountingRequestQuotesEndpoint = `/receivable-finance/v0/rd/${testRdId}/request-for-proposal/${testParticipantId}`
    const fetchDiscountingRequestEndpoint = `/receivable-finance/v0/info/rd/${testRdId}`
    const fakeRd = mocks => ({
      ...buildFakeReceivablesDiscountingInfo(),
      ...mocks
    })

    it('calls fetchDiscountingRequest', () => {
      fetchDiscountingRequestPageData(testRdId, testParticipantId)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(apiMock.get).toHaveBeenCalledTimes(1)
      expect(endpoint).toEqual(fetchDiscountingRequestEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_FAILURE)
      expect(config.onSuccess(undefined as any).type).toEqual(
        ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS
      )
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST)
      expect(
        config.onSuccess(fakeRd({ status: RDStatus.Requested })).afterHandler({ dispatch: dispatchMock })
      ).toBeFalsy()
    })

    it('calls fetchRFPSummaries for trader by default', () => {
      fetchDiscountingRequestPageData(testRdId, testParticipantId)(dispatchMock, null, apiMock)

      const [_, conf] = apiMock.get.mock.calls[0]
      conf.onSuccess(fakeRd({ status: RDStatus.QuoteAccepted })).afterHandler({ dispatch: jest.fn() })
      const [endpoint, config] = apiMock.get.mock.calls[1]

      expect(apiMock.get).toHaveBeenCalledTimes(2)
      expect(endpoint).toEqual(fetchDiscountingRequestQuotesEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_FAILURE)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_SUCCESS)
      expect(config.onSuccess.rdId).toBe(testRdId)
      expect(config.type).toEqual(ReceivableDiscountingActionType.FETCH_RFP_SUMMARY_REQUEST)
    })

    it('calls fetchSingleRFPSummaries for bank', () => {
      fetchDiscountingRequestPageData(testRdId, testParticipantId, true)(dispatchMock, null, apiMock)

      const [_, conf] = apiMock.get.mock.calls[0]
      conf.onSuccess(fakeRd({ status: RDStatus.QuoteAccepted })).afterHandler({ dispatch: jest.fn() })
      const [endpoint, config] = apiMock.get.mock.calls[1]

      expect(apiMock.get).toHaveBeenCalledTimes(2)
      expect(endpoint).toEqual(fetchSingleDiscountingRequestQuotesEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_FAILURE)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_SUCCESS)
      expect(config.onSuccess.rdId).toBe(testRdId)
      expect(config.type).toEqual(ReceivableDiscountingActionType.FETCH_PARTICIPANT_RFP_SUMMARY_REQUEST)
    })

    it('Does not fetch summaries if status is requested', () => {
      fetchDiscountingRequestPageData(testRdId, testParticipantId, true)(dispatchMock, null, apiMock)

      const [_, conf] = apiMock.get.mock.calls[0]
      conf.onSuccess(fakeRd({ status: RDStatus.Requested })).afterHandler({ dispatch: jest.fn() })

      expect(apiMock.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('fetchRDRequesForProposalMembersData', () => {
    const testRdId = '123'
    const fakeRd = buildFakeReceivablesDiscountingInfo()

    it('should load RD info, referenced trade and credit appetitte', () => {
      fetchRDRequesForProposalMembersData(testRdId)(dispatchMock, null, apiMock)

      const [_1, config1] = apiMock.get.mock.calls[0]
      expect(config1.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST)
      config1.onSuccess(fakeRd).afterHandler({ dispatch: jest.fn() })
      const [_2, config2] = apiMock.get.mock.calls[1]
      expect(config2.type).toEqual(TradeActionType.TRADES_REQUEST)
      config2.onSuccess({ items: [fakeTrade()] }).afterHandler({ dispatch: jest.fn() })
      const [_3, config3] = apiMock.get.mock.calls[2]
      expect(config3.type).toEqual(CreditLineActionType.FetchDisclosedCreditLinesForCounterpartyRequest)

      expect(apiMock.get).toHaveBeenCalledTimes(3)
    })

    it('should throw an error if the trade doesnt exist', () => {
      fetchRDRequesForProposalMembersData(testRdId)(dispatchMock, null, apiMock)

      const [_1, config1] = apiMock.get.mock.calls[0]
      expect(config1.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST)
      config1.onSuccess(fakeRd).afterHandler({ dispatch: jest.fn() })
      const [_2, config2] = apiMock.get.mock.calls[1]
      expect(config2.type).toEqual(TradeActionType.TRADES_REQUEST)

      try {
        config2.onSuccess({ items: [] }).afterHandler({ dispatch: jest.fn() })
        fail('Expected failure')
      } catch (e) {
        expect(apiMock.get).toHaveBeenCalledTimes(2)
      }
    })
  })

  describe('fetchHistoryForTrade', () => {
    const testSourceId = '123'
    const fetchHistoryForTradeEndpoint = `/receivable-finance/v0/trade/${testSourceId}/history`

    it('calls api.get with the correct arguments', () => {
      fetchHistoryForTrade(testSourceId)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(apiMock.get).toHaveBeenCalledTimes(1)
      expect(endpoint).toEqual(fetchHistoryForTradeEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_FAILURE)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_SUCCESS)
      expect(config.onSuccess.sourceId).toBe(testSourceId)
      expect(config.type).toEqual(ReceivableDiscountingActionType.FETCH_TRADE_HISTORY_REQUEST)
    })
  })
})
