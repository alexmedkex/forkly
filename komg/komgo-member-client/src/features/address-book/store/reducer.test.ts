import { fromJS, List } from 'immutable'

import reducer, { initialState } from './reducer'
import { AddressBookActionType } from './types'

const x500Name = {
  CN: 'CN',
  O: 'O',
  C: 'C',
  L: 'L',
  STREET: 'STREET',
  PC: 'PC'
}
const company = {
  staticId: 'staticId',
  vaktStaticId: 'staticId',
  isMember: true,
  isFinancialInstitution: true,
  hasSWIFTKey: false,
  x500Name
}

const secondCompany = {
  staticId: 'staticId-2',
  vaktStaticId: 'staticId-2',
  isMember: true,
  isFinancialInstitution: true,
  hasSWIFTKey: false,
  x500Name
}

const updatedCompany = { ...company, x500Name: { ...company.x500Name, O: 'New Name' }, isMember: false }

describe('Address Book Reducer', () => {
  it('saves "companies" on GET_COMPANIES_SUCCESS', () => {
    const state = reducer(initialState, {
      type: AddressBookActionType.GET_COMPANIES_SUCCESS,
      payload: [company]
    })

    expect(state.get('companies')).toEqual(List([company]))
  })

  describe('update state', () => {
    let state
    let updatedState
    beforeEach(() => {
      state = initialState.set('companies', List([company, { ...company, staticId: 'staticId2' }]))
      updatedState = [
        updatedCompany,
        {
          ...company,
          staticId: 'staticId2'
        }
      ]
    })

    it('should fail on wrong initial state', () => {
      const wrongState = initialState.set('companies', fromJS([company, { ...company, staticId: 'staticId2' }]))
      const newState = reducer(wrongState, {
        type: AddressBookActionType.ADD_COMPANY_TO_ENS_SUCCESS,
        payload: updatedCompany
      })

      expect(newState.get('companies').toJS()).not.toMatchObject(updatedState)
    })

    it('updates company on GET_COMPANY_SUCCESS', () => {
      const newState = reducer(state, {
        type: AddressBookActionType.GET_COMPANY_SUCCESS,
        payload: updatedCompany
      })

      expect(newState.get('companies').toJS()).toEqual(updatedState)
    })

    it('updates company on GENERATE_MEMBER_PACKAGE_SUCCESS', () => {
      const newState = reducer(state, {
        type: AddressBookActionType.GENERATE_MEMBER_PACKAGE_SUCCESS,
        payload: updatedCompany
      })

      expect(newState.get('companies').toJS()).toEqual(updatedState)
    })

    it('updates company on ADD_COMPANY_TO_ENS_SUCCESS', () => {
      const newState = reducer(state, {
        type: AddressBookActionType.ADD_COMPANY_TO_ENS_SUCCESS,
        payload: updatedCompany
      })

      expect(newState.get('companies').toJS()).toMatchObject(updatedState)
    })

    it('updates company on UPDATE_COMPANY_SUCCESS', () => {
      const newState = reducer(state, {
        type: AddressBookActionType.UPDATE_COMPANY_SUCCESS,
        payload: updatedCompany
      })

      expect(newState.get('companies').toJS()).toEqual(updatedState)
    })
  })

  it('updates company on CREATE_COMPANY_SUCCESS', () => {
    const newCompany = { ...company, x500Name: { ...company.x500Name, O: 'New Name' }, isMember: false }
    const state = initialState.set('companies', List([company]))
    const newState = reducer(state, {
      type: AddressBookActionType.CREATE_COMPANY_SUCCESS,
      payload: newCompany
    })

    expect(newState.get('companies').toJS()).toEqual([company, newCompany])
  })

  it('remove company on DeleteCompanyByIdSuccess', () => {
    const state = initialState.set('companies', List([company, secondCompany]))
    const newState = reducer(state, {
      type: AddressBookActionType.DeleteCompanyByIdSuccess,
      payload: { id: 'staticId-2' }
    })

    expect(newState.get('companies').toJS()).toEqual([company])
  })
})
