import { IReceivablesDiscountingInfo } from '@komgo/types'
import { fromJS, List, Map } from 'immutable'
import { AnyAction, Reducer } from 'redux'
import { ReceivableDiscountingApplicationState, ReceivableDiscountingApplicationActionType } from './types'

export const initialReceivableDiscountingApplicationState: ReceivableDiscountingApplicationState = fromJS({
  byId: Map(),
  historyById: Map(),
  error: null,
  ids: List()
})

const receivableDiscountingFailureRegexp = /@@receivable-discounting\/(.*)FAILURE$/

const reducer: Reducer<ReceivableDiscountingApplicationState> = (
  state: ReceivableDiscountingApplicationState = initialReceivableDiscountingApplicationState,
  action: AnyAction
): ReceivableDiscountingApplicationState => {
  switch (action.type) {
    case ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS:
      const update = action.payload.items.reduce(
        (memo: any, item: IReceivablesDiscountingInfo) => ({
          ...memo,
          [item.rd.staticId]: item
        }),
        {}
      )
      const rds = state.get('byId').mergeDeep(fromJS(update))
      const ids = action.payload.items.map((item: IReceivablesDiscountingInfo) => item.rd.staticId)
      return state
        .set('byId', rds)
        .set('ids', fromJS(ids))
        .set('error', null)

    case ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS: {
      const discountingMap = state.get('byId').mergeDeep(
        fromJS({
          [action.payload.rd.staticId]: action.payload
        })
      )

      return state.set('byId', discountingMap).set('error', null)
    }
    case ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS: {
      // Needing to use the following structure in order to get the supportingInformation to work
      // Merge Deep does not clear out the data as it is an array.
      // SEE : https://github.com/immutable-js/immutable-js/issues/1452
      const update = state.get('historyById').set(action.rdId, fromJS(action.payload))

      return state.set('historyById', update)
    }

    case ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_SUCCESS: {
      // Needing to use the following structure in order to get the supportingInformation to work
      // Merge Deep does not clear out the data as it is an array.
      // SEE : https://github.com/immutable-js/immutable-js/issues/1452
      const discountingMap = state
        .get('byId')
        .set(action.rdId, fromJS({ ...state.get('byId').toJS()[action.rdId], rd: action.payload }))

      const stateUpdated = state.set('byId', discountingMap).set('error', null)

      return stateUpdated
    }

    default:
      return reduceError(state, action)
  }
}

const reduceError: Reducer<ReceivableDiscountingApplicationState> = (
  state: ReceivableDiscountingApplicationState,
  action: AnyAction
): ReceivableDiscountingApplicationState => {
  // Needs to be right at the end of the reducer
  const match = receivableDiscountingFailureRegexp.exec(action.type)
  if (match) {
    return state.set('error', action.payload)
  }

  return state
}

export default reducer
