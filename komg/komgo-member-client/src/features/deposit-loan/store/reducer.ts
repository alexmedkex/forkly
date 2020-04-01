import { fromJS, Map, List } from 'immutable'
import { Reducer, AnyAction } from 'redux'

import { DepositLoanState, DepositLoanActionType, CreditAppetiteDepositLoanFeature } from './types'

export const initialState: DepositLoanState = fromJS({
  [CreditAppetiteDepositLoanFeature.Loan]: fromJS({
    byId: Map(),
    summaries: List(),
    disclosedById: Map(),
    requestsById: Map()
  }),
  [CreditAppetiteDepositLoanFeature.Deposit]: fromJS({
    byId: Map(),
    summaries: List(),
    disclosedById: Map(),
    requestsById: Map()
  })
})

const reducer: Reducer<DepositLoanState> = (state: DepositLoanState = initialState, action: AnyAction) => {
  switch (action.type) {
    case DepositLoanActionType.FetchDepositsLoansSuccess: {
      const { feature } = action
      const items = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      const newFeatureState = state.get(feature).set('byId', fromJS(items))
      return state.set(feature, newFeatureState)
    }
    case DepositLoanActionType.RemoveDepositLoanSuccess: {
      const { feature } = action
      const newFeatureItemsById = state
        .get(feature)
        .get('byId')
        .delete(action.payload)
      const newFeatureItems = state.get(feature).set('byId', newFeatureItemsById)
      return state.set(feature, newFeatureItems)
    }
    case DepositLoanActionType.GetDepositLoanSuccess: {
      const data = action.payload
      const { feature } = action
      const newById = state
        .get(feature)
        .get('byId')
        .merge({ [data.staticId]: data })
      const newFeatureState = state.get(feature).set('byId', newById)
      return state.set(feature, newFeatureState)
    }
    case DepositLoanActionType.FetchDisclosedDepositLoanSummariesSuccess: {
      const { feature } = action
      const newFeatureState = state.get(feature).set('summaries', fromJS(action.payload))
      return state.set(feature, newFeatureState)
    }
    case DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorSuccess: {
      const { feature } = action
      const items = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      const newFeatureState = state.get(feature).set('disclosedById', fromJS(items))
      return state.set(feature, newFeatureState)
    }
    case DepositLoanActionType.FetchReqsDepositLoanSuccess: {
      const { feature } = action
      const items = action.payload.reduce(
        (memo: any, item: any) => ({
          ...memo,
          [item.staticId]: item
        }),
        {}
      )
      const newFeatureState = state.get(feature).set('requestsById', fromJS(items))
      return state.set(feature, newFeatureState)
    }
    default:
      return state
  }
}

export default reducer
