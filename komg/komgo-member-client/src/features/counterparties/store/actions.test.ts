jest.mock('../../../utils/endpoints', () => ({
  COUNTERPARTIES_ENDPOINT: 'COUNTERPARTIES_ENDPOINT'
}))
import {
  fetchConnectedCounterpartiesAsync,
  fetchNotConnectedCompaniesAsync,
  setAddCounterpartyModal,
  searchCounterparty,
  resendCounterpartyAsync,
  getConnectedCounterpartiesWithRequestsAsync,
  counterpartySuccessMessage,
  fetchCounterpartyProfileAsync,
  updateCounterpartyProfileAsync,
  createCounterpartyProfileAsync
} from './actions'
import { CounterpartiesActionType } from './types'
import { COUNTERPARTIES_ENDPOINT } from '../../../utils/endpoints'

describe('Counterparty Actions', () => {
  let dispatchMock: any
  let apiMock: any
  let afterHandler: any
  const getState = (): any => ({})
  const httpGetAction = { type: '@http/API_GET_REQUEST' }
  const httpPostAction = { type: '@http/API_POST_REQUEST' }
  const httpPatchAction = { type: '@http/API_PATCH_REQUEST' }

  beforeEach(() => {
    afterHandler = jest.fn()
    dispatchMock = jest.fn()
    apiMock = {
      get: jest.fn(() => httpGetAction),
      post: jest.fn(() => httpPostAction),
      patch: jest.fn(() => httpPatchAction)
    }
  })

  describe('fetchConnectedCounterpartiesAsync()', () => {
    it('calls api.get with correct arguments', () => {
      fetchConnectedCounterpartiesAsync()(dispatchMock, getState, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]
      expect(endpoint).toEqual('COUNTERPARTIES_ENDPOINT/counterparties?query={}')
      expect(config.onError).toEqual(CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_FAILURE)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST)
    })
  })

  describe('fetchNotConnectedCompaniesAsync()', () => {
    it('calls api.get with correct arguments', () => {
      fetchNotConnectedCompaniesAsync()(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('COUNTERPARTIES_ENDPOINT/companies/not-covered?query={}', {
        type: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST,
        onError: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_FAILURE,
        onSuccess: CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_SUCCESS
      })
    })
  })

  describe('setAddCounterpartyModal()', () => {
    it('should return corect object', () => {
      const expected = {
        type: CounterpartiesActionType.SET_COUNTERPARTY_MODAL,
        payload: { name: 'isAddModalOpen', value: true }
      }

      expect(setAddCounterpartyModal(true)).toEqual(expected)
    })
  })

  describe('searchCounterparty()', () => {
    it('should return corect object', () => {
      const sort = {
        column: 'one',
        order: 'ascending'
      }

      const expected = {
        type: CounterpartiesActionType.SEARCH_COUNTERPARTY,
        payload: sort
      }

      expect(searchCounterparty(sort)).toEqual(expected)
    })
  })

  describe('resendCounterpartyAsync()', () => {
    it('calls api.post with correct arguments', () => {
      const companyId = '1234567890'

      resendCounterpartyAsync(companyId)(dispatchMock, getState, apiMock)
      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${COUNTERPARTIES_ENDPOINT}/counterparties/${companyId}/resend`)
      expect(config.onError('Error', { response: {} }).type).toEqual(
        CounterpartiesActionType.RESEND_COUNTERPARTY_FAILURE
      )
      expect(config.onSuccess().type).toEqual(CounterpartiesActionType.RESEND_COUNTERPARTY_SUCCESS)
    })
  })

  describe('getConnectedCounterpartiesWithRequestsAsync()', () => {
    it('calls api.post with correct arguments', () => {
      getConnectedCounterpartiesWithRequestsAsync()(dispatchMock, getState, apiMock)
      expect(apiMock.get).toHaveBeenCalledWith(`COUNTERPARTIES_ENDPOINT/counterparties/all?query={}`, {
        onError: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_FAILURE,
        onSuccess: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_SUCCESS,
        type: CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
      })
    })
  })

  describe('resendCounterpartySuccess()', () => {
    it('should return corect object', () => {
      expect(counterpartySuccessMessage('Counterparty request resent')).toEqual({
        type: CounterpartiesActionType.SET_REQUEST_ACTION,
        payload: {
          status: true
        }
      })
    })
  })

  describe('fetchCounterpartyProfileAsync()', () => {
    it('calls api.get with correct arguments', () => {
      const anonCpId = 'anon-id'
      fetchCounterpartyProfileAsync(anonCpId)(dispatchMock, getState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(`COUNTERPARTIES_ENDPOINT/counterparty-profile/${anonCpId}`, {
        onError: expect.any(Function),
        onSuccess: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_SUCCESS,
        type: CounterpartiesActionType.FETCH_COUNTERPARTY_PROFILE_REQUEST
      })
    })
  })

  describe('createCounterpartyProfileAsync()', () => {
    it('calls api.get with correct arguments', () => {
      createCounterpartyProfileAsync()(dispatchMock, getState, apiMock)

      expect(apiMock.post).toHaveBeenCalledWith(`COUNTERPARTIES_ENDPOINT/counterparty-profile`, {
        onError: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_FAILURE,
        onSuccess: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_SUCCESS,
        type: CounterpartiesActionType.CREATE_COUNTERPARTY_PROFILE_REQUEST
      })
    })
  })

  describe('updateCounterpartyProfileAsync()', () => {
    it('calls api.get with correct arguments', () => {
      const anonCpProfileUpdate = { counterpartyId: 'anon-id', riskLevel: 'whatever' }
      updateCounterpartyProfileAsync(anonCpProfileUpdate)(dispatchMock, getState, apiMock)

      expect(apiMock.patch).toHaveBeenCalledWith(
        `COUNTERPARTIES_ENDPOINT/counterparty-profile/${anonCpProfileUpdate.counterpartyId}`,
        {
          onError: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_FAILURE,
          onSuccess: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_SUCCESS,
          type: CounterpartiesActionType.UPDATE_COUNTERPARTY_PROFILE_REQUEST,
          data: { riskLevel: 'whatever' }
        }
      )
    })
  })
})
