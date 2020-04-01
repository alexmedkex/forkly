jest.mock('../../../store/history', () => ({
  history: {
    push: jest.fn()
  }
}))
jest.mock('../utils/mailTo', () => ({
  openDefaultMailClientWithDataPopulated: jest.fn()
}))
import {
  createCreditLine,
  fetchCreditLines,
  getCreditLine,
  fetchDisclosedCreditLineSummaries,
  removeCreditLine,
  createRequestInformation,
  fetchReceivedRequests,
  declineRequests
} from './actions'
import { buildFakeRiskCover } from '@komgo/types'
import { CreditLineActionType } from './types'
import { history } from '../../../store/history'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { openDefaultMailClientWithDataPopulated } from '../utils/mailTo'

describe('Risk Cover Actions', () => {
  let dispatchMock: any
  let apiMock: any
  let getStateMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction),
      delete: jest.fn(() => dummyAction)
    }
    getStateMock = jest.fn()
  })

  describe('createRiskCover', () => {
    it('should return appropriate params when calling action', () => {
      const fakeRiskCover = buildFakeRiskCover({
        context: { productId: Products.TradeFinance, subProductId: SubProducts.ReceivableDiscounting }
      })
      createCreditLine(fakeRiskCover, 'Test name')(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(
        `/credit-lines/v0/credit-lines/product/${fakeRiskCover.context.productId}/sub-product/${
          fakeRiskCover.context.subProductId
        }`
      )

      expect(config.onError).toEqual(CreditLineActionType.CreateCreditLineFailure)
      expect(config.onSuccess('Test name').type).toEqual(CreditLineActionType.CreateCreditLineSuccess)
    })
  })

  describe('fetchCreditLines', () => {
    it('should return appropriate params when calling action', () => {
      fetchCreditLines(Products.TradeFinance, SubProducts.ReceivableDiscounting)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(
        `/credit-lines/v0/credit-lines/product/${Products.TradeFinance}/sub-product/${
          SubProducts.ReceivableDiscounting
        }`
      )

      expect(config.onError).toEqual(CreditLineActionType.FetchCreditLinesFailure)
      expect(config.onSuccess.type).toEqual(CreditLineActionType.FetchCreditLinesSuccess)
    })
  })

  describe('getCreditLine', () => {
    it('should return appropriate params when calling action', () => {
      getCreditLine('123', Products.TradeFinance, SubProducts.ReceivableDiscounting)(
        dispatchMock,
        getStateMock,
        apiMock
      )

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/credit-lines/123')

      expect(config.onError).toEqual(CreditLineActionType.GetCreditLineFailure)
      expect(config.onSuccess.type).toEqual(CreditLineActionType.GetCreditLineSuccess)
    })
  })

  describe('fetchReceivedRequests', () => {
    it('should return appropriate params when calling action', () => {
      fetchReceivedRequests(Products.TradeFinance, SubProducts.ReceivableDiscounting)(
        dispatchMock,
        getStateMock,
        apiMock
      )

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(
        `/credit-lines/v0/requests/received/product/${Products.TradeFinance}/sub-product/${
          SubProducts.ReceivableDiscounting
        }`
      )

      expect(config.type).toEqual(CreditLineActionType.FetchRequestsRequest)
      expect(config.onError).toEqual(CreditLineActionType.FetchRequestsFailure)
      expect(config.onSuccess.type).toEqual(CreditLineActionType.FetchRequestsSuccess)
    })
  })

  describe('declineRequests', () => {
    it('should return appropriate params when calling action', () => {
      declineRequests(Products.TradeFinance, SubProducts.ReceivableDiscounting, 'buyer123', ['123'])(
        dispatchMock,
        getStateMock,
        apiMock
      )

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/requests/tradeFinance/sub-product/rd/buyer123/decline')

      expect(config.data).toEqual(['123'])
      expect(config.type).toEqual(CreditLineActionType.DeclineAllRequestsRequest)
      expect(config.onError).toEqual(CreditLineActionType.DeclineAllRequestsFailure)
      expect(config.onSuccess().type).toEqual(CreditLineActionType.DeclineAllRequestsSuccess)
      expect(history.push).toHaveBeenCalledWith('/risk-cover')
    })
  })

  describe('fetchDisclosedCreditLineSummaries', () => {
    it('should return appropriate params when calling action', () => {
      fetchDisclosedCreditLineSummaries('tradeFinance', 'rd')(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/disclosed-credit-lines/product/tradeFinance/sub-product/rd/summary')

      expect(config.onError).toEqual(CreditLineActionType.FetchDisclosedCreditLineSummariesFailure)
      expect(config.onSuccess.type).toEqual(CreditLineActionType.FetchDisclosedCreditLineSummariesSuccess)
      expect(config.type).toEqual(CreditLineActionType.FetchDisclosedCreditLineSummariesRequest)
    })
  })

  describe('removeRiskCover', () => {
    it('should return appropriate params when calling action', () => {
      const fakeRiskCover = buildFakeRiskCover({ staticId: '123' })
      removeCreditLine(fakeRiskCover)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.delete.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/credit-lines/123')

      expect(config.onError).toEqual(CreditLineActionType.RemoveCreditLineFailure)
      expect(config.onSuccess().type).toBe(CreditLineActionType.RemoveCreditLineSuccess)
      expect(config.onSuccess().payload).toBe('123')
      expect(config.type).toEqual(CreditLineActionType.RemoveCreditLineRequest)
    })
  })

  describe('createRequestInformation', () => {
    it('should return appropriate params when calling action', () => {
      const data = {
        context: {
          productId: 'tradeFinance',
          subProductId: 'rd'
        },
        comment: 'test',
        counterpartyStaticId: '123',
        companyIds: ['1234']
      }
      createRequestInformation(data)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(
        `/credit-lines/v0/requests/product/${data.context.productId}/sub-product/${data.context.subProductId}`
      )

      expect(config.onError).toEqual(CreditLineActionType.CreateReqInformationFailure)
      expect(config.onSuccess().type).toBe(CreditLineActionType.CreateReqInformationSuccess)
      expect(config.type).toEqual(CreditLineActionType.CreateReqInformationRequest)
      expect(config.data).toEqual(data)
    })

    it('should return appropriate params when calling action', () => {
      const data = {
        context: {
          productId: 'tradeFinance',
          subProductId: 'rd'
        },
        comment: 'test',
        counterpartyStaticId: '123',
        companyIds: ['1234']
      }
      const mailTo = {
        email: '',
        body: 'test',
        subject: 'test'
      }
      createRequestInformation(data, mailTo)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      config.onSuccess()

      expect(openDefaultMailClientWithDataPopulated).toHaveBeenCalledWith(mailTo)
    })
  })
})
