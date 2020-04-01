import { ActionCreator } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { v4 as uuid } from 'uuid'
import { ONBOARDING_ENDPOINT } from '../../../utils/endpoints'
import { HttpRequest } from '../../../utils/http'
import { IMember } from '../../members/store/types'
import { AddressBookActionType, AddressBookState } from './types'
import { MemberActionType } from '../../members/store/types'
import { displayToast, TOAST_TYPE } from '../../toasts/utils'
import { createBottomSheetItem } from '../../bottom-sheet/store/actions'

type ActionThunk = ThunkAction<void, AddressBookState, HttpRequest>

export const getCompanies: ActionCreator<ActionThunk> = () => (dispatch, _, api) => {
  dispatch(
    api.get(`${ONBOARDING_ENDPOINT}/companies`, {
      type: AddressBookActionType.GET_COMPANIES_REQUEST,
      onSuccess: AddressBookActionType.GET_COMPANIES_SUCCESS,
      onError: AddressBookActionType.GET_COMPANIES_FAILURE
    })
  )
}

export const getCompany: ActionCreator<ActionThunk> = staticId => (dispatch, _, api) => {
  dispatch(
    api.get(`${ONBOARDING_ENDPOINT}/companies/${staticId}`, {
      type: AddressBookActionType.GET_COMPANY_REQUEST,
      onSuccess: AddressBookActionType.GET_COMPANY_SUCCESS,
      onError: AddressBookActionType.GET_COMPANY_FAILURE
    })
  )
}

export const generateMember: ActionCreator<ActionThunk> = staticId => (dispatch, _, api) => {
  displayToast('Generating member package. Please wait.', TOAST_TYPE.Ok)
  dispatch(
    api.post(`${ONBOARDING_ENDPOINT}/companies/${staticId}/member-package`, {
      type: AddressBookActionType.GENERATE_MEMBER_PACKAGE_REQUEST,
      onSuccess(payload: IMember) {
        displayToast(`Member package has been generated for ${payload.x500Name.O}.`, TOAST_TYPE.Ok)
        return { type: AddressBookActionType.GENERATE_MEMBER_PACKAGE_SUCCESS, payload }
      },
      onError(payload) {
        displayToast('Error occurred while generating a member package. Please try again later.', TOAST_TYPE.Error)
        return { type: AddressBookActionType.GENERATE_MEMBER_PACKAGE_FAILURE, payload }
      }
    })
  )
}

export const toggleActivationMember: ActionCreator<ActionThunk> = (staticId: string, active: boolean) => (
  dispatch,
  _,
  api
) => {
  displayToast('Deactivating member. Please wait.', TOAST_TYPE.Ok)

  dispatch(
    api.patch(`${ONBOARDING_ENDPOINT}/companies/${staticId}/is-active`, {
      type: MemberActionType.DeactivateMemberRequest,
      data: { active },
      onSuccess() {
        displayToast(`Company has been deactivated`, TOAST_TYPE.Ok)
        dispatch({
          type: AddressBookActionType.DeleteCompanyByIdSuccess,
          payload: { id: staticId }
        })

        return {
          type: MemberActionType.DeactivateMemberSuccess,
          payload: { id: staticId }
        }
      },
      onError(payload) {
        displayToast('Error occurred while deactivating a company. Please try again later.', TOAST_TYPE.Error)
        return { type: MemberActionType.DeactivateMemberFailure, payload }
      }
    })
  )
}

export const createCompany: ActionCreator<ActionThunk> = (member, history) => (dispatch, _, api) => {
  dispatch(
    api.post(`${ONBOARDING_ENDPOINT}/companies`, {
      type: AddressBookActionType.CREATE_COMPANY_REQUEST,
      data: member,
      onSuccess(payload) {
        displayToast('Company has been created', TOAST_TYPE.Ok)
        history.push('/address-book')
        return { type: AddressBookActionType.CREATE_COMPANY_SUCCESS, payload }
      },
      onError: AddressBookActionType.CREATE_COMPANY_FAILURE
    })
  )
}

export const addCompanyToENS: ActionCreator<ActionThunk> = (staticId, companyName, displayStatus) => (
  dispatch,
  _,
  api
) => {
  const bottomsheetId = uuid()
  const action = api.put(`${ONBOARDING_ENDPOINT}/companies/${staticId}/ens`, {
    type: AddressBookActionType.ADD_COMPANY_TO_ENS_REQUEST,
    data: { bottomsheetId },
    onError: AddressBookActionType.ADD_COMPANY_TO_ENS_FAILURE
  })
  dispatch(
    createBottomSheetItem({
      id: bottomsheetId,
      name: companyName,
      displayStatus,
      navigationLink: `/address-book/${staticId}`,
      action
    })
  )
}

export const configureMQ: ActionCreator<ActionThunk> = (staticId, companyName) => (dispatch, _, api) => {
  const bottomsheetId = uuid()
  const displayStatus = 'Configuring MQ'
  const action = api.post(`${ONBOARDING_ENDPOINT}/companies/${staticId}/configure-mq`, {
    type: AddressBookActionType.CONFIGURE_MQ_REQUEST,
    data: { bottomsheetId },
    onError: AddressBookActionType.CONFIGURE_MQ_FAILURE
  })
  dispatch(
    createBottomSheetItem({
      id: bottomsheetId,
      name: companyName,
      displayStatus,
      navigationLink: `/address-book/${staticId}`,
      action
    })
  )
}

export const updateCompany: ActionCreator<ActionThunk> = (staticId, member, history) => (dispatch, _, api) => {
  const companyName = member.x500Name.O
  const bottomsheetId = uuid()
  const displayStatus = 'Updating'
  const action = api.patch(`${ONBOARDING_ENDPOINT}/companies/${staticId}`, {
    type: AddressBookActionType.UPDATE_COMPANY_REQUEST,
    data: { ...member, bottomsheetId },
    onSuccess() {
      history.push('/address-book')
      return { type: 'Nothing' }
    },
    onError: AddressBookActionType.UPDATE_COMPANY_FAILURE
  })
  dispatch(
    createBottomSheetItem({
      id: bottomsheetId,
      name: companyName,
      displayStatus,
      navigationLink: `/address-book/${staticId}`,
      action
    })
  )
}
