import { fromJS } from 'immutable'

import reducer, { initialState } from './reducer'
import { LicenseActionType } from './types'

const product = {
  productId: 'KYC',
  productName: 'KYC'
}
const customer = {
  memberStaticId: 'staticId',
  products: []
}

describe('License Management Reducer', () => {
  it('updates enabled products on ENABLE_LICENSE_SUCCESS', () => {
    const newCustomer = {
      ...customer,
      products: [product]
    }
    const state = initialState.set('customers', fromJS([customer]))
    const newState = reducer(state, {
      type: LicenseActionType.ENABLE_LICENSE_SUCCESS,
      payload: newCustomer
    })

    expect(newState.get('customers')).toEqual(fromJS([newCustomer]))
  })
})
