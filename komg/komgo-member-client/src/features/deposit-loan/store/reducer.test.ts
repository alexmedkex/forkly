import { fromJS, Map } from 'immutable'

import reducer, { initialState } from './reducer'
import {
  buildFakeDepositLoan,
  buildFakeShareDepositLoan,
  buildFakeDisclosedDepositLoanSummary,
  buildFakeDisclosedDepositLoan
} from '@komgo/types'
import { CreditAppetiteDepositLoanFeature, DepositLoanActionType } from './types'

describe('Deposit Loan Reducer', () => {
  const deposit1 = buildFakeDepositLoan({ staticId: '123' })
  const deposit2 = { ...buildFakeDepositLoan({ staticId: '1234' }), sharedWith: [buildFakeShareDepositLoan()] }

  it('should return default state', () => {
    const expected = initialState
    const invalidAction = { type: 'FOO', payload: ['bar'] }
    const actual = reducer(initialState, invalidAction)
    expect(actual).toEqual(expected)
  })

  it('should set state when FETCH_DEPOSITS_LOANS_SUCCESS is dispatched and state is initial', () => {
    const data = [deposit1, deposit2]
    const action = {
      type: DepositLoanActionType.FetchDepositsLoansSuccess,
      payload: data,
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('byId')
        .toJS()
    ).toEqual({ '123': deposit1, '1234': deposit2 })
  })

  it('should match snapshot when FETCH_DEPOSITS_LOANS_SUCCESS is dispatched and state is initial', () => {
    const data = [deposit1, deposit2]
    const action = {
      type: DepositLoanActionType.FetchDepositsLoansSuccess,
      payload: data,
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialState, action)

    expect(actual).toMatchSnapshot()
  })

  it('should set state when FETCH_DEPOSITS_LOANS_SUCCESS is dispatched and state is not innitial', () => {
    const data = [deposit1, deposit2]
    const initialData = fromJS({
      deposit: fromJS({
        byId: Map(fromJS({ '123': deposit1 })),
        summariesById: Map(),
        disclosedById: Map(),
        requestsById: Map()
      })
    })
    const action = {
      type: DepositLoanActionType.FetchDepositsLoansSuccess,
      payload: data,
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('byId')
        .toJS()
    ).toEqual({ '123': deposit1, '1234': deposit2 })
  })

  it('should set state when FETCH_DEPOSITS_LOANS_SUCCESS is dispatched and add shared info to current object', () => {
    const deposit1WithSharedData = {
      ...deposit1,
      sharedWith: [buildFakeShareDepositLoan()]
    }
    const initialData = fromJS({
      deposit: fromJS({
        byId: Map(fromJS({ '123': deposit1 })),
        summariesById: Map(),
        disclosedById: Map(),
        requestsById: Map()
      })
    })
    const action = {
      type: DepositLoanActionType.FetchDepositsLoansSuccess,
      payload: [deposit1WithSharedData],
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('byId')
        .toJS()
    ).toEqual({ '123': deposit1WithSharedData })
  })

  it('should set state when REMOVE_DEPOSIT_LOAN_SUCCESS is dispatched', () => {
    const initialData = fromJS({
      deposit: fromJS({
        byId: Map(fromJS({ '123': deposit1, '1234': deposit2 })),
        summariesById: Map(),
        disclosedById: Map(),
        requestsById: Map()
      })
    })
    const action = {
      type: DepositLoanActionType.RemoveDepositLoanSuccess,
      payload: '1234',
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('byId')
        .toJS()
    ).toEqual({ '123': deposit1 })
  })

  it('should set state when REMOVE_DEPOSIT_LOAN_SUCCESS is dispatched and id does not exists', () => {
    const initialData = fromJS({
      deposit: fromJS({
        byId: Map(fromJS({ '123': deposit1 })),
        summariesById: Map(),
        disclosedById: Map(),
        requestsById: Map()
      })
    })
    const action = {
      type: DepositLoanActionType.RemoveDepositLoanSuccess,
      payload: '1888234',
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('byId')
        .toJS()
    ).toEqual({ '123': deposit1 })
  })

  it('should set state when GET_DEPOSIT_LOAN_SUCCESS is dispatched and state is initial', () => {
    const action = {
      type: DepositLoanActionType.GetDepositLoanSuccess,
      payload: deposit1,
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('byId')
        .toJS()
    ).toEqual({ '123': deposit1 })
  })

  it('should set state when GET_DEPOSIT_LOAN_SUCCESS is dispatched and state is initial', () => {
    const action = {
      type: DepositLoanActionType.GetDepositLoanSuccess,
      payload: deposit1,
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialState, action)

    expect(actual).toMatchSnapshot()
  })

  it('should set state when FETCH_DISCLOSED_DEPOSIT_LOAN_SUMMARIES_SUCCESS is dispatched and state is initial', () => {
    const fakeSummary = buildFakeDisclosedDepositLoanSummary()
    const action = {
      type: DepositLoanActionType.FetchDisclosedDepositLoanSummariesSuccess,
      payload: [fakeSummary],
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('summaries')
        .toJS()
    ).toEqual([fakeSummary])
  })

  it('should set state when FETCH_DISCLOSED_DEPOSITS_LOANS_FOR_CURRENCY_AND_TENOR_SUCCESS is dispatched and state is initial', () => {
    const fakeDepositLoan = buildFakeDisclosedDepositLoan({ staticId: '123' })
    const action = {
      type: DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorSuccess,
      payload: [fakeDepositLoan],
      feature: CreditAppetiteDepositLoanFeature.Deposit
    }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditAppetiteDepositLoanFeature.Deposit)
        .get('disclosedById')
        .toJS()
    ).toEqual({ '123': fakeDepositLoan })
  })
})
