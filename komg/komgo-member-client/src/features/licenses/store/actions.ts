import { ActionCreator, Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { HttpRequest } from '../../../utils/http'

import { LicenseActionType, LicenseState, ICustomer } from './types'

import { PRODUCTS_ENDPOINT } from '../../../utils/endpoints'
import { ToastContainerIds } from '../../../utils/toast'
import { toast } from 'react-toastify'
import { updateProduct } from '../../members/store/actions'

type ActionThunk = ThunkAction<void, LicenseState, HttpRequest>

export const enableLicense: ActionCreator<ActionThunk> = (
  customerName: string,
  memberStaticId: string,
  productId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.put(`${PRODUCTS_ENDPOINT}/customers/${memberStaticId}/products/${productId}`, {
      type: LicenseActionType.ENABLE_LICENSE_REQUEST,
      onSuccess: (customer: ICustomer) => {
        toast.success(`${productId} license has been given to "${customerName}"`, {
          containerId: ToastContainerIds.Default
        })
        updateProduct(memberStaticId, customer.products)(dispatch, _ as any, api)

        return { type: LicenseActionType.ENABLE_LICENSE_SUCCESS, payload: customer }
      },
      onError: LicenseActionType.ENABLE_LICENSE_FAILURE
    })
  )
}

export const disableLicense: ActionCreator<ActionThunk> = (
  customerName: string,
  memberStaticId: string,
  productId: string
) => (dispatch, _, api): Action => {
  return dispatch(
    api.delete(`${PRODUCTS_ENDPOINT}/customers/${memberStaticId}/products/${productId}`, {
      type: LicenseActionType.DISABLE_LICENSE_REQUEST,
      onSuccess: (customer: ICustomer) => {
        toast.success(`${productId} license has been removed from "${customerName}"`, {
          containerId: ToastContainerIds.Default
        })
        updateProduct(memberStaticId, customer.products)(dispatch, _ as any, api)

        return { type: LicenseActionType.DISABLE_LICENSE_SUCCESS, payload: customer }
      },
      onError: LicenseActionType.DISABLE_LICENSE_FAILURE
    })
  )
}
