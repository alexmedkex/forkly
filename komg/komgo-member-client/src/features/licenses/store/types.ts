import { List } from 'immutable'
import { ImmutableMap } from '../../../utils/types'
import { Action } from 'redux'

export enum LicenseActionType {
  ENABLE_LICENSE_REQUEST = '@@licenses/ENABLE_LICENSE_REQUEST',
  ENABLE_LICENSE_SUCCESS = '@@licenses/ENABLE_LICENSE_SUCCESS',
  ENABLE_LICENSE_FAILURE = '@@licenses/ENABLE_LICENSE_FAILURE',
  DISABLE_LICENSE_REQUEST = '@@licenses/DISABLE_LICENSE_REQUEST',
  DISABLE_LICENSE_SUCCESS = '@@licenses/DISABLE_LICENSE_SUCCESS',
  DISABLE_LICENSE_FAILURE = '@@licenses/DISABLE_LICENSE_FAILURE'
}

export interface IProduct {
  productId: string
  productName: string
}

export interface ICustomer {
  memberStaticId: string
  products: string[]
}

export interface ILicense {
  productId: string
  productName: string
  enabled: boolean
}

export interface ICustomerLicenses {
  staticId: string
  x500Name: any
  enabledProductIds: string[]
  licenses: ILicense[]
}

export interface LicenseUpdateAction {
  productId: string
  productName: string
  memberId: string
  memberName: string
  enable: boolean
}

export interface LicenseStateProperties {
  products: List<IProduct>
  customers: List<ICustomer>
}

export type LicenseState = ImmutableMap<LicenseStateProperties>

export interface EnableLicenseRequest extends Action {
  type: LicenseActionType.ENABLE_LICENSE_REQUEST
}

export interface EnableLicenseSuccess extends Action {
  type: LicenseActionType.ENABLE_LICENSE_SUCCESS
  payload: ICustomer
}

export interface EnableLicenseFailure extends Action {
  type: LicenseActionType.ENABLE_LICENSE_FAILURE
  payload: string
}

export interface DisableLicenseRequest extends Action {
  type: LicenseActionType.DISABLE_LICENSE_REQUEST
}

export interface DisableLicenseSuccess extends Action {
  type: LicenseActionType.DISABLE_LICENSE_SUCCESS
  payload: ICustomer
}

export interface DisableLicenseFailure extends Action {
  type: LicenseActionType.DISABLE_LICENSE_FAILURE
  payload: string
}

export type LicenseActions =
  | EnableLicenseRequest
  | EnableLicenseSuccess
  | EnableLicenseFailure
  | DisableLicenseRequest
  | DisableLicenseSuccess
  | DisableLicenseFailure
