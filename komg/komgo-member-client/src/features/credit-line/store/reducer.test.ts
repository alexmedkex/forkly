import reducer, { initialState } from './reducer'
import { buildFakeRiskCover, buildFakeRiskCoverSharedCreditLine } from '@komgo/types'
import { CreditLineActionType, CreditLineType } from './types'
import { fromJS, Map } from 'immutable'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'

describe('Risk Cover Reducer', () => {
  const firstRiskCover = buildFakeRiskCover({
    staticId: '123',
    counterpartyStaticId: '123',
    context: { productId: Products.TradeFinance, subProductId: SubProducts.ReceivableDiscounting }
  })
  const secondRiskCover = buildFakeRiskCover({
    staticId: '1234',
    counterpartyStaticId: '1234',
    context: { productId: Products.TradeFinance, subProductId: SubProducts.ReceivableDiscounting }
  })
  const disclosedCreditLine = {
    counterpartyStaticId: '123',
    lowestFee: 2,
    availabilityCount: 3,
    appetiteCount: 4,
    _id: '11'
  }
  const receivedRequest = {
    deletedAt: null,
    _id: '5d0233fc449a5c3bd2959015',
    staticId: '123',
    requestType: 'RECEIVED',
    context: { productId: 'tradeFinance', subProductId: 'rd' },
    counterpartyStaticId: '0b5ad248-6159-47ca-9ac7-610c22877186',
    companyStaticId: 'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85',
    comment: 'This is a custom comment 1',
    status: 'PENDING',
    createdAt: '2019-06-10T15:22:29.738Z',
    updatedAt: '2019-06-10T15:22:29.738Z'
  }

  const defaultFeature = {
    productId: Products.TradeFinance,
    subProductId: SubProducts.ReceivableDiscounting
  }

  it('should return default state', () => {
    const expected = initialState
    const invalidAction = { type: 'FOO', payload: ['bar'] }
    const actual = reducer(initialState, invalidAction)
    expect(actual).toEqual(expected)
  })

  it('should set state when FETCH_CREDIT_LINES_SUCCESS is dispatched and state is initial', () => {
    const riskCoverData = [firstRiskCover, secondRiskCover]
    const action = { type: CreditLineActionType.FetchCreditLinesSuccess, payload: riskCoverData, ...defaultFeature }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': firstRiskCover, '1234': secondRiskCover })
  })

  it('should match snapshot when FETCH_CREDIT_LINES_SUCCESS is dispatched and state is initial', () => {
    const riskCoverData = [firstRiskCover, secondRiskCover]
    const action = { type: CreditLineActionType.FetchCreditLinesSuccess, payload: riskCoverData, ...defaultFeature }
    const actual = reducer(initialState, action)

    expect(actual).toMatchSnapshot()
  })

  it('should set state when FETCH_CREDIT_LINES_SUCCESS is dispatched', () => {
    const riskCoverData = [firstRiskCover, secondRiskCover]
    const initialData = fromJS({
      riskCover: fromJS({
        creditLinesById: Map(fromJS({ '123': firstRiskCover })),
        disclosedCreditLineSummariesById: Map(),
        disclosedCreditLinesById: Map(),
        requestsById: Map()
      })
    })
    const action = { type: CreditLineActionType.FetchCreditLinesSuccess, payload: riskCoverData, ...defaultFeature }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': firstRiskCover, '1234': secondRiskCover })
  })

  it('should set state when FETCH_CREDIT_LINES_SUCCESS is dispatched and add shared info to current object', () => {
    const emptySharedRiskCoverData = { ...firstRiskCover, sharedCreditLines: [] }
    const withSharedRiskCoverData = {
      ...emptySharedRiskCoverData,
      sharedCreditLines: [buildFakeRiskCoverSharedCreditLine()]
    }
    const initialData = fromJS({
      riskCover: fromJS({
        creditLinesById: Map(fromJS({ '123': emptySharedRiskCoverData })),
        disclosedCreditLineSummariesById: Map(),
        disclosedCreditLinesById: Map(),
        requestsById: Map()
      })
    })
    const action = {
      type: CreditLineActionType.FetchCreditLinesSuccess,
      payload: [withSharedRiskCoverData],
      ...defaultFeature
    }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': withSharedRiskCoverData })
    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toMatchSnapshot()
  })

  it('should set state when GET_CREDIT_LINE_SUCCESS is dispatched and state is initial', () => {
    const action = { type: CreditLineActionType.GetCreditLineSuccess, payload: firstRiskCover, ...defaultFeature }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': firstRiskCover })
  })

  it('should to match snapshot when GET_RISK_COVER_SUCCESS is dispatched and state is initial', () => {
    const action = { type: CreditLineActionType.GetCreditLineSuccess, payload: firstRiskCover, ...defaultFeature }
    const actual = reducer(initialState, action)

    expect(actual).toMatchSnapshot()
  })

  it('should set state when GET_RISK_COVER_SUCCESS is dispatched and add shared info to current object', () => {
    const emptySharedRiskCoverData = { ...firstRiskCover, sharedCreditLines: [] }
    const withSharedRiskCoverData = {
      ...emptySharedRiskCoverData,
      sharedCreditLines: [buildFakeRiskCoverSharedCreditLine()]
    }
    const initialData = fromJS({
      riskCover: fromJS({
        creditLinesById: Map(fromJS({ '123': emptySharedRiskCoverData })),
        disclosedCreditLineSummariesById: Map(),
        disclosedCreditLinesById: Map(),
        requestsById: Map()
      })
    })
    const action = {
      type: CreditLineActionType.GetCreditLineSuccess,
      payload: withSharedRiskCoverData,
      ...defaultFeature
    }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': withSharedRiskCoverData })
    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toMatchSnapshot()
  })

  it('should set state when GET_RISK_COVER_SUCCESS is dispatched and add shared info to current object after two actions', () => {
    const emptySharedRiskCoverData = { ...firstRiskCover, sharedCreditLines: [] }
    const withSharedRiskCoverData = {
      ...emptySharedRiskCoverData,
      sharedCreditLines: [buildFakeRiskCoverSharedCreditLine()]
    }

    const emptySharedAction = {
      type: CreditLineActionType.GetCreditLineSuccess,
      payload: emptySharedRiskCoverData,
      ...defaultFeature
    }
    const withSharedAction = {
      type: CreditLineActionType.GetCreditLineSuccess,
      payload: withSharedRiskCoverData,
      ...defaultFeature
    }

    const firstState = reducer(initialState, withSharedAction)
    const secondState = reducer(firstState, emptySharedAction)

    expect(
      secondState
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toMatchSnapshot()
  })

  it('should set state when FETCH_DISCLOSED_CREDIT_LINE_SUMMARIES_SUCCESS is dispatched and state is initial', () => {
    const action = {
      type: CreditLineActionType.FetchDisclosedCreditLineSummariesSuccess,
      payload: [disclosedCreditLine],
      ...defaultFeature
    }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('disclosedCreditLineSummariesById')
        .toJS()
    ).toEqual({ '11': disclosedCreditLine })
  })

  it('should to match snapshot when FETCH_DISCLOSED_CREDIT_LINE_SUMMARIES_SUCCESS is dispatched and state is initial', () => {
    const action = {
      type: CreditLineActionType.FetchDisclosedCreditLineSummariesSuccess,
      payload: [disclosedCreditLine],
      ...defaultFeature
    }
    const actual = reducer(initialState, action)

    expect(actual).toMatchSnapshot()
  })

  it('should set state when REMOVE_RISK_COVER_SUCCESS is dispatched', () => {
    const initialData = fromJS({
      riskCover: fromJS({
        creditLinesById: Map(fromJS({ '123': firstRiskCover, '1234': secondRiskCover })),
        disclosedCreditLineSummariesById: Map(),
        disclosedCreditLinesById: Map(),
        requestsById: Map()
      })
    })
    const action = { type: CreditLineActionType.RemoveCreditLineSuccess, payload: '1234', ...defaultFeature }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': firstRiskCover })
  })

  it('should set state when REMOVE_RISK_COVER_SUCCESS is dispatched and id does not exists', () => {
    const initialData = fromJS({
      riskCover: fromJS({
        creditLinesById: Map(fromJS({ '123': firstRiskCover, '1234': secondRiskCover })),
        disclosedCreditLineSummariesById: Map(),
        disclosedCreditLinesById: Map(),
        requestsById: Map()
      })
    })
    const action = { type: CreditLineActionType.RemoveCreditLineSuccess, payload: '12347', ...defaultFeature }
    const actual = reducer(initialData, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('creditLinesById')
        .toJS()
    ).toEqual({ '123': firstRiskCover, '1234': secondRiskCover })
  })

  it('should set state when FETCH_REQ_SUCCESS is dispatched', () => {
    const action = {
      type: CreditLineActionType.FetchRequestsSuccess,
      payload: [receivedRequest],
      ...defaultFeature
    }
    const actual = reducer(initialState, action)

    expect(
      actual
        .get(CreditLineType.RiskCover)
        .get('requestsById')
        .toJS()
    ).toEqual({ '123': receivedRequest })
  })
})
