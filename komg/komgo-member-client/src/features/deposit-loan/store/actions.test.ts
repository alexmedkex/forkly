jest.mock('../../toasts/utils', () => ({
  displayToast: jest.fn(),
  TOAST_TYPE: { Ok: 0 }
}))
jest.mock('../../../store/history', () => ({
  history: {
    push: jest.fn()
  }
}))

import { buildFakeDepositLoan, Currency, DepositLoanPeriod, DepositLoanType } from '@komgo/types'

import {
  fetchDepositsLoans,
  removeDepositLoan,
  getDepositLoan,
  createDepositLoan,
  editDepositLoan,
  fetchDisclosedSummaries,
  fetchDisclosedDepositsLoans,
  createRequestInformation
} from './actions'
import { CreditAppetiteDepositLoanFeature, DepositLoanActionType } from './types'
import { displayToast } from '../../toasts/utils'
import { history } from '../../../store/history'

describe('Deposit and Loan Actions', () => {
  let dispatchMock: any
  let apiMock: any
  let getStateMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction),
      delete: jest.fn(() => dummyAction),
      put: jest.fn(() => dummyAction)
    }
    getStateMock = jest.fn()
  })

  describe('fetchDepositsLoans', () => {
    it('should return appropriate params when calling action', () => {
      fetchDepositsLoans(CreditAppetiteDepositLoanFeature.Deposit)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/credit-lines/v0/deposit-loan/deposit`)

      expect(config.onError).toEqual(DepositLoanActionType.FetchDepositsLoansFailure)
      expect(config.onSuccess.type).toEqual(DepositLoanActionType.FetchDepositsLoansSuccess)
      expect(config.type).toEqual(DepositLoanActionType.FetchDepositsLoansRequest)
    })
  })

  describe('removeDepositLoan', () => {
    it('should return appropriate params when calling action', () => {
      const fakeDeposit = buildFakeDepositLoan({ staticId: '123' })
      removeDepositLoan(fakeDeposit, CreditAppetiteDepositLoanFeature.Deposit)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.delete.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/deposit-loan/deposit/123')

      expect(config.onError).toEqual(DepositLoanActionType.RemoveDepositLoanFailure)
      expect(config.onSuccess().type).toBe(DepositLoanActionType.RemoveDepositLoanSuccess)
      expect(config.onSuccess().payload).toBe('123')
      expect(config.type).toEqual(DepositLoanActionType.RemoveDepositLoanRequest)
      expect(displayToast).toHaveBeenCalledWith('USD 3 months has been removed', 0)
    })
  })

  describe('getDepositLoan', () => {
    it('should return appropriate params when calling action', () => {
      getDepositLoan('1234', CreditAppetiteDepositLoanFeature.Deposit)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/credit-lines/v0/deposit-loan/deposit/1234`)

      expect(config.onError).toEqual(DepositLoanActionType.GetDepositLoanFailure)
      expect(config.onSuccess.type).toEqual(DepositLoanActionType.GetDepositLoanSuccess)
      expect(config.type).toEqual(DepositLoanActionType.GetDepositLoanRequest)
    })
  })

  describe('createDepositLoan', () => {
    it('should return appropriate params when calling action', () => {
      const fakeDeposit = buildFakeDepositLoan({ staticId: '123' })
      createDepositLoan(fakeDeposit, CreditAppetiteDepositLoanFeature.Deposit)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/deposit-loan/deposit')

      expect(config.onError).toEqual(DepositLoanActionType.CreateDepositLoanFailure)
      expect(config.onSuccess('123').type).toBe(DepositLoanActionType.CreateDepositLoanSuccess)
      expect(config.type).toEqual(DepositLoanActionType.CreateDepositLoanRequest)
      expect(displayToast).toHaveBeenCalledWith('USD 3 months added', 0)
      expect(history.push).toHaveBeenCalledWith('/deposits/123')
    })
  })

  describe('editDepositLoan', () => {
    it('should return appropriate params when calling action', () => {
      const fakeDeposit = buildFakeDepositLoan({ staticId: '123' })
      editDepositLoan(fakeDeposit, '123', CreditAppetiteDepositLoanFeature.Deposit)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/deposit-loan/deposit/123')

      expect(config.onError).toEqual(DepositLoanActionType.EditDepositLoanFailure)
      expect(config.onSuccess('123').type).toBe(DepositLoanActionType.EditDepositLoanSuccess)
      expect(config.type).toEqual(DepositLoanActionType.EditDepositLoanRequest)
      expect(displayToast).toHaveBeenCalledWith('USD 3 months has been updated', 0)
      expect(history.push).toHaveBeenCalledWith('/deposits/123')
    })
  })

  describe('fetchDisclosedSummaries', () => {
    it('should return appropriate params when calling action', () => {
      fetchDisclosedSummaries(CreditAppetiteDepositLoanFeature.Deposit)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/disclosed-deposit-loans/type/deposit/summary')

      expect(config.onError).toEqual(DepositLoanActionType.FetchDisclosedDepositLoanSummariesFailure)
      expect(config.onSuccess.type).toBe(DepositLoanActionType.FetchDisclosedDepositLoanSummariesSuccess)
      expect(config.type).toEqual(DepositLoanActionType.FetchDisclosedDepositLoanSummariesRequest)
    })
  })

  describe('fetchDisclosedDepositsLoans', () => {
    const params = { currency: Currency.EUR, period: DepositLoanPeriod.Months, periodDuration: 3 }
    it('should return appropriate params when calling action', () => {
      fetchDisclosedDepositsLoans(CreditAppetiteDepositLoanFeature.Deposit, params)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/disclosed-deposit-loans/deposit')
      expect(config.params).toEqual(params)

      expect(config.onError).toEqual(DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorFailure)
      expect(config.onSuccess.type).toBe(DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorSuccess)
      expect(config.type).toEqual(DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorRequest)
    })
  })

  describe('createRequestInformation', () => {
    it('should return appropriate params when calling action', () => {
      const fakeRequest = {
        type: DepositLoanType.Deposit,
        mailTo: false,
        comment: 'Test comment',
        currency: Currency.EUR,
        period: DepositLoanPeriod.Overnight,
        companyIds: ['123']
      }
      createRequestInformation(fakeRequest, CreditAppetiteDepositLoanFeature.Deposit)(
        dispatchMock,
        getStateMock,
        apiMock
      )

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/credit-lines/v0/deposit-loan-requests/deposit')

      expect(config.onError).toEqual(DepositLoanActionType.CreateReqDepositLoanInformationFailure)
      expect(config.onSuccess('123').type).toBe(DepositLoanActionType.CreateReqDepositLoanInformationSuccess)
      expect(config.type).toEqual(DepositLoanActionType.CreateReqDepositLoanInformationRequest)
      expect(displayToast).toHaveBeenCalledWith('Request for information sent', 0)
      expect(history.push).toHaveBeenCalledWith('/deposits')
    })
  })
})
