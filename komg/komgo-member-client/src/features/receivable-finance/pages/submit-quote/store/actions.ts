import { ActionCreator } from 'react-redux'
import { Action } from 'redux'

import {
  ReceivableDiscountingActionThunk,
  fetchDiscountingRequest
} from '../../../../receivable-discounting-legacy/store/application/actions'
import { fetchCreditLines } from '../../../../credit-line/store/actions'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'

export const fetchRDRequesForSubmitQuote: ActionCreator<ReceivableDiscountingActionThunk> = (rdId: string) => (
  dispatch,
  _,
  api
): Action => {
  fetchCreditLines(Products.TradeFinance, SubProducts.ReceivableDiscounting)(dispatch, _ as any, api)
  return fetchDiscountingRequest(rdId)(dispatch, _, api)
}
