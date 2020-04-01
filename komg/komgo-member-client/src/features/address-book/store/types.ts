import { List } from 'immutable'
import { ImmutableMap } from '../../../utils/types'
import { Action } from 'redux'
import { IMember } from '../../members/store/types'

export enum AddressBookActionType {
  GET_COMPANIES_REQUEST = '@@addressBook/GET_COMPANIESS_REQUEST',
  GET_COMPANIES_SUCCESS = '@@addressBook/GET_COMPANIESS_SUCCESS',
  GET_COMPANIES_FAILURE = '@@addressBook/GET_COMPANIESS_FAILURE',
  GET_COMPANY_REQUEST = '@@addressBook/GET_COMPANY_REQUEST',
  GET_COMPANY_SUCCESS = '@@addressBook/GET_COMPANY_SUCCESS',
  GET_COMPANY_FAILURE = '@@addressBook/GET_COMPANY_FAILURE',
  GENERATE_MEMBER_PACKAGE_REQUEST = '@@addressBook/GENERATE_MEMBER_PACKAGE_REQUEST',
  GENERATE_MEMBER_PACKAGE_SUCCESS = '@@addressBook/GENERATE_MEMBER_PACKAGE_SUCCESS',
  GENERATE_MEMBER_PACKAGE_FAILURE = '@@addressBook/GENERATE_MEMBER_PACKAGE_FAILURE',
  ADD_COMPANY_TO_ENS_REQUEST = '@@addressBook/ADD_COMPANY_TO_ENS_REQUEST',
  ADD_COMPANY_TO_ENS_SUCCESS = '@@addressBook/ADD_COMPANY_TO_ENS_SUCCESS',
  ADD_COMPANY_TO_ENS_FAILURE = '@@addressBook/ADD_COMPANY_TO_ENS_FAILURE',
  CONFIGURE_MQ_REQUEST = '@@addressBook/CONFIGURE_MQ_REQUEST',
  CONFIGURE_MQ_SUCCESS = '@@addressBook/CONFIGURE_MQ_SUCCESS',
  CONFIGURE_MQ_FAILURE = '@@addressBook/CONFIGURE_MQ_FAILURE',
  CREATE_COMPANY_REQUEST = '@@addressBook/CREATE_COMPANY_REQUEST',
  CREATE_COMPANY_SUCCESS = '@@addressBook/CREATE_COMPANY_SUCCESS',
  CREATE_COMPANY_FAILURE = '@@addressBook/CREATE_COMPANY_FAILURE',
  UPDATE_COMPANY_REQUEST = '@@addressBook/UPDATE_COMPANY_REQUEST',
  UPDATE_COMPANY_SUCCESS = '@@addressBook/UPDATE_COMPANY_SUCCESS',
  UPDATE_COMPANY_FAILURE = '@@addressBook/UPDATE_COMPANY_FAILURE',
  DeleteCompanyByIdSuccess = '@@addressBook/DELETE_COMPANY_BY_ID_SUCCESS'
}

export interface AddressBookStateProperties {
  companies: List<IMember>
}

export type AddressBookState = ImmutableMap<AddressBookStateProperties>

export interface GetCompaniesRequest extends Action {
  type: AddressBookActionType.GET_COMPANIES_SUCCESS
  payload: IMember[]
}
export interface GetCompanyRequest extends Action {
  type: AddressBookActionType.GET_COMPANY_SUCCESS
  payload: IMember
}
export interface GenerateMemberPackageRequest extends Action {
  type: AddressBookActionType.GENERATE_MEMBER_PACKAGE_SUCCESS
  payload: IMember
}
export interface AddCompanyToENSRequest extends Action {
  type: AddressBookActionType.ADD_COMPANY_TO_ENS_SUCCESS
  payload: IMember
}
export interface ConfigureMQRequest extends Action {
  type: AddressBookActionType.CONFIGURE_MQ_SUCCESS
  payload: IMember
}

export interface CreateCompanyRequest extends Action {
  type: AddressBookActionType.CREATE_COMPANY_SUCCESS
  payload: IMember
}
export interface UpdateCompanyRequest extends Action {
  type: AddressBookActionType.UPDATE_COMPANY_SUCCESS
  payload: IMember
}

export interface DeleteCompanyByIdSuccess extends Action {
  type: AddressBookActionType.DeleteCompanyByIdSuccess
  payload: { id: string }
}

export type AddressBookActions =
  | GetCompaniesRequest
  | GetCompanyRequest
  | CreateCompanyRequest
  | UpdateCompanyRequest
  | GenerateMemberPackageRequest
  | AddCompanyToENSRequest
  | ConfigureMQRequest
  | DeleteCompanyByIdSuccess
