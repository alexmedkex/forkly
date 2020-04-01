import { compressToEncodedURIComponent } from 'lz-string'
import {
  createReceivablesDiscountingApplication,
  fetchDiscountingRequest,
  fetchRdsByStaticIds,
  updateReceivablesDiscountingApplication
} from './actions'
import { ReceivableDiscountingApplicationActionType } from './types'
import { buildFakeReceivablesDiscountingBase } from '@komgo/types'
import { fetchHistoryForRDData } from './actions'

describe('Receivable discounting actions', () => {
  let dispatchMock: any
  let apiMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction),
      put: jest.fn(() => dummyAction)
    }
  })

  describe('createReceivablesDiscountingApplication', () => {
    const postCreateReceivablesDiscountingApplicationEndpoint = '/receivable-finance/v0/rd'

    it('calls api.post with the correct arguments', () => {
      const testData = { test: 123 }
      createReceivablesDiscountingApplication(testData)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(postCreateReceivablesDiscountingApplicationEndpoint)

      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess({ staticId: 'test' }).type).toEqual(
        ReceivableDiscountingApplicationActionType.CREATE_APPLICATION_SUCCESS
      )
      expect(config.onSuccess({ staticId: 'test' }).afterHandler).toBeDefined()
    })
  })

  describe('fetchRdsByStaticId()', () => {
    const getRdsByStaticIdEndpoint = '/receivable-finance/v0/info/rd'

    it('calls api.get with the correct arguments', () => {
      fetchRdsByStaticIds()(dispatchMock, jest.fn(), apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(getRdsByStaticIdEndpoint, {
        onError: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_FAILURE,
        onSuccess: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS,
        type: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST,
        params: {
          polling: false
        }
      })
    })
    it('calls api.get with filter', () => {
      const filter = {
        tradeSourceIds: ['SOURCE-ID-1', 'SOURCE-ID-2']
      }

      fetchRdsByStaticIds(filter)(dispatchMock, jest.fn(), apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(getRdsByStaticIdEndpoint, {
        onError: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_FAILURE,
        onSuccess: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS,
        type: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST,
        params: { filter: compressToEncodedURIComponent(JSON.stringify(filter)), polling: false }
      })
    })
    it('sets polling', () => {
      const filter = {
        tradeSourceIds: ['SOURCE-ID-1', 'SOURCE-ID-2']
      }

      fetchRdsByStaticIds(filter, true)(dispatchMock, jest.fn(), apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(getRdsByStaticIdEndpoint, {
        onError: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_FAILURE,
        onSuccess: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_SUCCESS,
        type: ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST,
        params: { filter: compressToEncodedURIComponent(JSON.stringify(filter)), polling: true }
      })
    })
  })

  describe('fetchDiscountingRequest', () => {
    const testRdId = 'test-rd-id'
    const fetchDiscountingRequestEndpoint = `/receivable-finance/v0/info/rd/${testRdId}`

    it('calls api.get with the correct arguments', () => {
      fetchDiscountingRequest(testRdId)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(apiMock.get).toHaveBeenCalledTimes(1)
      expect(endpoint).toEqual(fetchDiscountingRequestEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_FAILURE)
      expect(config.onSuccess(undefined as any).type).toEqual(
        ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS
      )
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST)
      expect(
        config.onSuccess(undefined as any).afterHandler({ dispatch: dispatchMock, getState: jest.fn() })
      ).toBeFalsy()
    })

    it('calls api.get with the correct arguments and chain afterHandler function', () => {
      const afterHandler = jest.fn(params => ({ type: 'Test' }))
      fetchDiscountingRequest(testRdId, afterHandler)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(apiMock.get).toHaveBeenCalledTimes(1)
      expect(endpoint).toEqual(fetchDiscountingRequestEndpoint)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_FAILURE)
      expect(config.onSuccess(undefined as any).type).toEqual(
        ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_SUCCESS
      )
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_REQUEST)
      expect(config.onSuccess(undefined as any).afterHandler({ dispatch: dispatchMock, getState: jest.fn() })).toEqual({
        type: 'Test'
      })
    })
  })

  describe('updateReceivablesDiscountingApplication', () => {
    const rdId = 'test-rd-id'
    const putRdEndpoint = `/receivable-finance/v0/rd/${rdId}?replace=false`
    const putRdEndpointWithReplace = `/receivable-finance/v0/rd/${rdId}?replace=true`
    const shareRdEndpoint = `/receivable-finance/v0/rd/${rdId}/share`
    const fetchHistoryEndpoint = `/receivable-finance/v0/rd/${rdId}/history`
    const update = buildFakeReceivablesDiscountingBase()

    it('calls api.put with the correct arguments', () => {
      updateReceivablesDiscountingApplication(update, rdId)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual(putRdEndpoint)
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_FAILURE)
      expect(config.data).toEqual(update)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_SUCCESS)
      expect(config.onSuccess.rdId).toEqual(rdId)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })

    it('shares RD after updating', () => {
      updateReceivablesDiscountingApplication(update, rdId)(dispatchMock, jest.fn(), apiMock)

      const [_, cfg] = apiMock.put.mock.calls[0]
      cfg.onSuccess.afterHandler({ dispatch: dispatchMock })

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(shareRdEndpoint)
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_REQUEST)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_FAILURE)
      expect(config.onSuccess).toEqual(ReceivableDiscountingApplicationActionType.SHARE_APPLICATION_SUCCESS)
    })

    it('fetches RD history after updating', () => {
      updateReceivablesDiscountingApplication(update, rdId)(dispatchMock, jest.fn(), apiMock)

      const [_, cfg] = apiMock.put.mock.calls[0]
      cfg.onSuccess.afterHandler({ dispatch: dispatchMock })

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(fetchHistoryEndpoint)
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_REQUEST)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_FAILURE)
      expect(config.onSuccess).toEqual({
        type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS,
        rdId
      })
    })
    it('calls api.put with the correct arguments', () => {
      updateReceivablesDiscountingApplication(update, rdId)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual(putRdEndpoint)
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_FAILURE)
      expect(config.data).toEqual(update)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_SUCCESS)
      expect(config.onSuccess.rdId).toEqual(rdId)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })

    it('calls api.put with the correct arguments - if REPLACE specified', () => {
      updateReceivablesDiscountingApplication(update, rdId, true)(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.put.mock.calls[0]

      expect(endpoint).toEqual(putRdEndpointWithReplace)
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_REQUEST)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_FAILURE)
      expect(config.data).toEqual(update)
      expect(config.onSuccess.type).toEqual(ReceivableDiscountingApplicationActionType.UPDATE_APPLICATION_SUCCESS)
      expect(config.onSuccess.rdId).toEqual(rdId)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('fetchHistoryForRDData', () => {
    const rdId = 'test-rd-id'
    const fetchHistoryEndpoint = `/receivable-finance/v0/rd/${rdId}/history`

    it('calls api.get with the correct arguments', () => {
      fetchHistoryForRDData(rdId)(dispatchMock, null, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]
      expect(apiMock.get).toHaveBeenCalledTimes(1)

      expect(endpoint).toEqual(fetchHistoryEndpoint)
      expect(config.type).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_REQUEST)
      expect(config.onError).toEqual(ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_FAILURE)
      expect(config.onSuccess).toEqual({
        type: ReceivableDiscountingApplicationActionType.FETCH_APPLICATION_HISTORY_SUCCESS,
        rdId
      })
    })
  })
})
