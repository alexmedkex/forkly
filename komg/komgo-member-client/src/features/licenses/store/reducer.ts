import { Reducer } from 'redux'
import { fromJS, List, Map } from 'immutable'
import { ICustomer, IProduct, LicenseActions, LicenseActionType, LicenseState, LicenseStateProperties } from './types'

const initialLicenseState: LicenseStateProperties = {
  products: List<IProduct>(),
  customers: List<ICustomer>()
}

export const initialState: LicenseState = Map(initialLicenseState)

const licensesReducer: Reducer<LicenseState> = (
  state: LicenseState = initialState,
  action: LicenseActions
): LicenseState => {
  const customers = state.get('customers').toJS()
  switch (action.type) {
    case LicenseActionType.ENABLE_LICENSE_SUCCESS:
    case LicenseActionType.DISABLE_LICENSE_SUCCESS:
      const newCustomers = customers.map(customer => {
        if (action.payload.memberStaticId === customer.memberStaticId) {
          return {
            ...customer,
            products: action.payload.products
          }
        }
        return customer
      })
      return state.set('customers', fromJS(newCustomers))
    default:
      return state
  }
}

export default licensesReducer
