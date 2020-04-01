import { Reducer } from 'redux'
import { List, Map } from 'immutable'
import { AddressBookActions, AddressBookActionType, AddressBookState, AddressBookStateProperties } from './types'
import { IMember } from '../../members/store/types'

const initialLicenseState: AddressBookStateProperties = {
  companies: List<IMember>()
}

export const initialState: AddressBookState = Map(initialLicenseState)

const onboardingReducer: Reducer<AddressBookState> = (
  state: AddressBookState = initialState,
  action: AddressBookActions
): AddressBookState => {
  switch (action.type) {
    case AddressBookActionType.GET_COMPANIES_SUCCESS:
      return state.set('companies', List<IMember>(action.payload))
    case AddressBookActionType.GENERATE_MEMBER_PACKAGE_SUCCESS:
    case AddressBookActionType.ADD_COMPANY_TO_ENS_SUCCESS:
    case AddressBookActionType.CONFIGURE_MQ_SUCCESS:
    case AddressBookActionType.GET_COMPANY_SUCCESS:
    case AddressBookActionType.UPDATE_COMPANY_SUCCESS:
      return state.update('companies', (members: List<IMember>) =>
        members.update(
          members.findIndex((member: IMember) => member.staticId === action.payload.staticId),
          () => action.payload
        )
      )
    case AddressBookActionType.CREATE_COMPANY_SUCCESS:
      return state.update('companies', (members: List<IMember>) => members.push(action.payload))

    case AddressBookActionType.DeleteCompanyByIdSuccess: {
      return state.update('companies', (members: List<IMember>) =>
        members.delete(members.findIndex((member: IMember) => member.staticId === action.payload.id))
      )
    }

    default:
      return state
  }
}

export default onboardingReducer
