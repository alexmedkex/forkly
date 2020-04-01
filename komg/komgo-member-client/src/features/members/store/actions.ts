import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { allProducts } from '@komgo/products'
import lodash from 'lodash'

import { HttpRequest } from '../../../utils/http'
import { MemberState, MemberActionType } from '../store/types'
import { REGISTRY_BASE_ENDPOINT } from '../../../utils/endpoints'
import { IProduct } from '@komgo/products'

export type MemberActionThunk = ThunkAction<Action, MemberState, HttpRequest>

export const fetchMembers: ActionCreator<MemberActionThunk> = (params?: {}) => (dispatch, _, api): Action => {
  return dispatch(
    api.get(`${REGISTRY_BASE_ENDPOINT}/registry/cache?companyData=${encodeURIComponent(JSON.stringify({}))}`, {
      type: MemberActionType.FetchMembersRequest,
      onSuccess: MemberActionType.FetchMembersSuccess,
      onError: MemberActionType.FetchMembersFailure,
      params
    })
  )
}

export const updateProduct: ActionCreator<MemberActionThunk> = (memberStaticId: string, products: string[]) => (
  dispatch,
  _,
  api
): Action => {
  const productByKey = lodash.keyBy(allProducts, 'productId')
  const memberProducts: IProduct[] = products.map(productId => productByKey[productId])

  return dispatch({
    type: MemberActionType.UpdateMemberProducts,
    payload: { memberStaticId, memberProducts }
  })
}
