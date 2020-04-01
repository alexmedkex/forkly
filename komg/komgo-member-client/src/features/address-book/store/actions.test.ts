import { initialState } from './reducer'
import { AddressBookActionType } from './types'
import { MemberActionType } from '../../members/store/types'
import { displayToast, TOAST_TYPE } from '../../../features/toasts/utils'

jest.mock('../../../features/toasts/utils', () => ({
  displayToast: jest.fn(),
  TOAST_TYPE: {
    Ok: 1,
    Error: 0
  }
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid1')
}))

import {
  getCompanies,
  getCompany,
  generateMember,
  updateCompany,
  addCompanyToENS,
  configureMQ,
  toggleActivationMember
} from './actions'

import { ONBOARDING_ENDPOINT } from '../../../utils/endpoints'
import { IMember } from '../../members/store/types'

describe('Address Book Actions', () => {
  const dispatchMock = jest.fn()
  const getState = (): any => initialState
  const httpGetAction = { type: '@http/API_GET_REQUEST' }
  const httpPutAction = { type: '@http/API_PUT_REQUEST' }
  const httpPostAction = { type: '@http/API_POST_REQUEST' }
  const httpPatchAction = { type: '@http/API_PATCH_REQUEST' }
  const apiMock: any = {
    get: jest.fn(() => httpGetAction),
    put: jest.fn(() => httpPutAction),
    post: jest.fn(() => httpPostAction),
    patch: jest.fn(() => httpPatchAction)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCompanies()', () => {
    it('calls api.get with correct arguments', () => {
      getCompanies()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies`, {
        type: AddressBookActionType.GET_COMPANIES_REQUEST,
        onSuccess: AddressBookActionType.GET_COMPANIES_SUCCESS,
        onError: AddressBookActionType.GET_COMPANIES_FAILURE
      })
    })
  })

  describe('getCompany()', () => {
    it('calls api.get with correct arguments', () => {
      getCompany('staticId')(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies/staticId`, {
        type: AddressBookActionType.GET_COMPANY_REQUEST,
        onSuccess: AddressBookActionType.GET_COMPANY_SUCCESS,
        onError: AddressBookActionType.GET_COMPANY_FAILURE
      })
    })
  })

  describe('generateMember()', () => {
    it('calls api.post with correct arguments', () => {
      generateMember('staticId')(dispatchMock, getState, apiMock)

      expect(apiMock.post).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies/staticId/member-package`, {
        type: AddressBookActionType.GENERATE_MEMBER_PACKAGE_REQUEST,
        onSuccess: expect.any(Function),
        onError: expect.any(Function)
      })
    })
    it('calls displayToast on success', () => {
      generateMember('staticId')(dispatchMock, getState, apiMock)
      const member = { x500Name: { O: 'ABC' } } as IMember
      ;(displayToast as jest.Mock).mockClear()
      apiMock.post.mock.calls[0][1].onSuccess(member)

      expect(displayToast).toHaveBeenCalledWith('Member package has been generated for ABC.', TOAST_TYPE.Ok)
    })
    it('calls displayToast on error', () => {
      generateMember('staticId')(dispatchMock, getState, apiMock)
      const member = { x500Name: { O: 'ABC' } } as IMember
      ;(displayToast as jest.Mock).mockClear()
      apiMock.post.mock.calls[0][1].onError(member)

      expect(displayToast).toHaveBeenCalledWith(
        'Error occurred while generating a member package. Please try again later.',
        TOAST_TYPE.Error
      )
    })
  })

  describe('toggleActivationMember()', () => {
    it('calls api.patch with correct arguments', () => {
      toggleActivationMember('staticId', true)(dispatchMock, getState, apiMock)

      expect(apiMock.patch).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies/staticId/is-active`, {
        type: MemberActionType.DeactivateMemberRequest,
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        data: { active: true }
      })
    })
    it('calls displayToast on success', () => {
      toggleActivationMember('staticId', true)(dispatchMock, getState, apiMock)
      ;(displayToast as jest.Mock).mockClear()
      apiMock.patch.mock.calls[0][1].onSuccess()

      expect(displayToast).toHaveBeenCalledWith('Company has been deactivated', TOAST_TYPE.Ok)
    })

    it('calls DeleteCompanyByIdSuccess on success', () => {
      const deleteCompanyByIdParams = {
        type: AddressBookActionType.DeleteCompanyByIdSuccess,
        payload: { id: 'staticId' }
      }

      toggleActivationMember('staticId', true)(dispatchMock, getState, apiMock)
      ;(displayToast as jest.Mock).mockClear()
      apiMock.patch.mock.calls[0][1].onSuccess()

      expect(dispatchMock).toHaveBeenNthCalledWith(2, deleteCompanyByIdParams)
    })

    it('calls displayToast on error', () => {
      toggleActivationMember('staticId')(dispatchMock, getState, apiMock)
      ;(displayToast as jest.Mock).mockClear()
      apiMock.patch.mock.calls[0][1].onError()

      expect(displayToast).toHaveBeenCalledWith(
        'Error occurred while deactivating a company. Please try again later.',
        TOAST_TYPE.Error
      )
    })
  })

  describe('addCompanyToENS()', () => {
    it('calls api.put with correct arguments', () => {
      addCompanyToENS('staticId')(dispatchMock, getState, apiMock)

      expect(apiMock.put).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies/staticId/ens`, {
        type: AddressBookActionType.ADD_COMPANY_TO_ENS_REQUEST,
        onError: AddressBookActionType.ADD_COMPANY_TO_ENS_FAILURE,
        data: { bottomsheetId: 'uuid1' }
      })
    })
  })

  describe('configureMQ()', () => {
    it('calls api.post with correct arguments', () => {
      configureMQ('staticId')(dispatchMock, getState, apiMock)

      expect(apiMock.post).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies/staticId/configure-mq`, {
        type: AddressBookActionType.CONFIGURE_MQ_REQUEST,
        onError: AddressBookActionType.CONFIGURE_MQ_FAILURE,
        data: { bottomsheetId: 'uuid1' }
      })
    })
  })

  describe('updateCompany()', () => {
    it('calls api.patch with correct arguments', () => {
      const company = { x500Name: { O: 'Company Name' } }
      updateCompany('staticId', company)(dispatchMock, getState, apiMock)

      expect(apiMock.patch).toHaveBeenCalledWith(`${ONBOARDING_ENDPOINT}/companies/staticId`, {
        type: AddressBookActionType.UPDATE_COMPANY_REQUEST,
        data: { ...company, bottomsheetId: 'uuid1' },
        onSuccess: expect.any(Function),
        onError: AddressBookActionType.UPDATE_COMPANY_FAILURE
      })
    })
  })
})
