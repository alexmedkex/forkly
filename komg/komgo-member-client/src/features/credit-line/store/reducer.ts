import { fromJS, Map } from 'immutable'
import { Reducer, AnyAction } from 'redux'

import { CreditLineActionType, CreditLinesState, CreditLineType } from './types'
import { ICreditLineResponse } from '@komgo/types'
import { findFeature } from '../utils/creditAppetiteTypes'

export const initialState: CreditLinesState = fromJS({
  riskCover: fromJS({
    creditLinesById: Map(),
    disclosedCreditLineSummariesById: Map(),
    disclosedCreditLinesById: Map(),
    requestsById: Map()
  }),
  bankLine: fromJS({
    creditLinesById: Map(),
    disclosedCreditLineSummariesById: Map(),
    disclosedCreditLinesById: Map(),
    requestsById: Map()
  })
})

const reducer: Reducer<CreditLinesState> = (state: CreditLinesState = initialState, action: AnyAction) => {
  switch (action.type) {
    case CreditLineActionType.FetchCreditLinesSuccess: {
      const feature = findFeature({ productId: action.productId, subProductId: action.subProductId })
      const creditLines = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      const newFeatureState = state.get(feature).set('creditLinesById', fromJS(creditLines))
      return state.set(feature as any, newFeatureState)
    }
    case CreditLineActionType.GetCreditLineSuccess: {
      const data = action.payload as ICreditLineResponse
      const feature = findFeature({ productId: action.productId, subProductId: action.subProductId })
      const newCreditLines = state
        .get(feature)
        .get('creditLinesById')
        .merge({ [data.staticId]: data })
      const newFeatureState = state.get(feature).set('creditLinesById', newCreditLines)
      return state.set(feature, newFeatureState)
    }
    case CreditLineActionType.RemoveCreditLineSuccess: {
      const feature = findFeature({ productId: action.productId, subProductId: action.subProductId })
      const newFeatureCreditLines = state
        .get(feature)
        .get('creditLinesById')
        .delete(action.payload)
      const newRiskCover = state.get(feature).set('creditLinesById', newFeatureCreditLines)
      return state.set(feature, newRiskCover)
    }
    case CreditLineActionType.FetchDisclosedCreditLineSummariesSuccess: {
      const feature = findFeature({ productId: action.productId, subProductId: action.subProductId })
      const disclosedCreditLineSummariesById = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item._id]: item
        }),
        {}
      )
      return state.setIn([feature, 'disclosedCreditLineSummariesById'], fromJS(disclosedCreditLineSummariesById))
    }
    case CreditLineActionType.FetchDisclosedCreditLinesForCounterpartySuccess: {
      const feature = findFeature({ productId: action.productId, subProductId: action.subProductId })
      const disclosedCreditLinesById = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      return state.setIn([feature, 'disclosedCreditLinesById'], fromJS(disclosedCreditLinesById))
    }
    case CreditLineActionType.FetchRequestsSuccess: {
      const feature = findFeature({ productId: action.productId, subProductId: action.subProductId })
      const requestsById = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      return state.setIn([feature, 'requestsById'], fromJS(requestsById))
    }
    default:
      return state
  }
}

export default reducer
