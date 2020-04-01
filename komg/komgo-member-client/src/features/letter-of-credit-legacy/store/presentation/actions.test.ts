import {
  createPresentationError,
  removePresentationSuccess,
  createPresentation,
  fetchPresentationDocuments,
  removePresentation,
  submitPresentationSuccess,
  submitPresentation,
  setPresentationDocumentsCompliant,
  setPresentationDocumentsDiscrepant,
  setPresentationReviewCompleted,
  requestWaiverOfDiscrepancies,
  acceptRequestedDiscrepancies,
  rejectRequestedDiscrepancies
} from './actions'
import { LCPresentationActionType } from './types'
import { TRADE_FINANCE_BASE_ENDPOINT } from '../../../../utils/endpoints'
import { fromJS, Map } from 'immutable'
import { fakePresentation } from '../../utils/faker'

describe('removePresentationSuccess', () => {
  it('should return appropriate object', () => {
    const expectObj = {
      type: LCPresentationActionType.REMOVE_PRESENTATION_SUCCESS,
      payload: { presentationId: '123', lcReference: 'BP-123' }
    }
    expect(removePresentationSuccess('123', 'BP-123')).toEqual(expectObj)
  })
})

describe('createPresentationError', () => {
  it('should return appropriate object', () => {
    const expectObj = {
      type: LCPresentationActionType.CREATE_PRESENTATION_FAILURE,
      payload: 'Error'
    }
    expect(createPresentationError('Error')).toEqual(expectObj)
  })
})

describe('submitPresentationSuccess', () => {
  it('should return appropriate object', () => {
    const expectObj = {
      type: LCPresentationActionType.SUBMIT_PRESENTATION_SUCCESS,
      payload: 'Text'
    }
    expect(submitPresentationSuccess('Text')).toEqual(expectObj)
  })
})

describe('Actions which call api', () => {
  let dispatchMock: any
  let apiMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction),
      delete: jest.fn(() => dummyAction)
    }
  })

  describe('createPresentation()', () => {
    it('calls api.post with the correct arguments', () => {
      createPresentation('123')(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/123/presentations`)

      expect(config.onError().type).toEqual(LCPresentationActionType.CREATE_PRESENTATION_FAILURE)
      expect(config.onSuccess).toEqual(LCPresentationActionType.CREATE_PRESENTATION_SUCCESS)
    })
  })

  describe('fetchPresentationDocuments()', () => {
    it('calls api.get with the correct arguments', () => {
      fetchPresentationDocuments('lc123', 'p12345')(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc123/presentations/p12345/documents`)

      expect(config.onError).toEqual(LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_FAILURE)
      expect(config.onSuccess.type).toEqual(LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_SUCCESS)
      expect(config.onSuccess.presentationId).toBe('p12345')
    })
  })

  describe('removePresentation()', () => {
    it('calls api.delete with the correct arguments', () => {
      const mockState = Map(fromJS({ lettersOfCredit: { byId: { lc123: { reference: '1111' } } } }))
      const mockGetState = jest.fn(() => mockState)
      removePresentation('lc123', 'p12345')(dispatchMock, mockGetState, apiMock)

      const [endpoint, config] = apiMock.delete.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/presentations/p12345`)
    })
  })

  describe('submitPresentation()', () => {
    it('calls api.delete with the correct arguments', () => {
      submitPresentation(fakePresentation(), { comment: 'ok' })(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/presentations/123/submit`)

      expect(config.data).toEqual({ comment: 'ok' })
      expect(config.onError).toEqual(LCPresentationActionType.SUBMIT_PRESENTATION_FAILURE)
      expect(config.onSuccess().type).toEqual(LCPresentationActionType.SUBMIT_PRESENTATION_SUCCESS)
    })
  })

  describe('setPresentationDocumentsCompliant()', () => {
    it('calls api.post with the correct arguments', () => {
      setPresentationDocumentsCompliant(fakePresentation(), 'lc-123')(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc-123/presentations/123/compliant`)
      expect(config.onError).toEqual(LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_FAILURE)
      expect(config.onSuccess().type).toEqual(LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_SUCCESS)
    })
  })

  describe('setPresentationDocumentsDiscrepant()', () => {
    it('calls api.post with the correct arguments', () => {
      setPresentationDocumentsDiscrepant(fakePresentation(), 'lc-123', { comment: '' })(
        dispatchMock,
        jest.fn(),
        apiMock
      )

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc-123/presentations/123/discrepant`)
      expect(config.data).toEqual({ comment: '' })
      expect(config.onError).toEqual(LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_FAILURE)
      expect(config.onSuccess().type).toEqual(LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_SUCCESS)
    })
  })

  describe('setPresentationReviewCompleted()', () => {
    const presentation = fakePresentation()

    it('should return appropriate object', () => {
      expect(
        setPresentationReviewCompleted(
          LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_SUCCESS,
          presentation,
          '123'
        )
      ).toEqual({
        type: LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_SUCCESS,
        payload: presentation
      })
    })
  })

  describe('requestWaiverOfDiscrepancies()', () => {
    it('calls api.post with the correct arguments', () => {
      requestWaiverOfDiscrepancies(fakePresentation(), 'lc-123', { comment: '' })(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc-123/presentations/123/adviseDiscrepancies`)
      expect(config.data).toEqual({ comment: '' })
      expect(config.onError).toEqual(LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_FAILURE)
      expect(config.onSuccess().type).toEqual(LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_SUCCESS)
    })
  })

  describe('acceptRequestedDiscrepancies()', () => {
    it('calls api.post with the correct arguments', () => {
      acceptRequestedDiscrepancies(fakePresentation(), 'lc-123', { comment: '' })(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc-123/presentations/123/acceptDiscrepancies`)
      expect(config.data).toEqual({ comment: '' })
      expect(config.onError).toEqual(LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_FAILURE)
      expect(config.onSuccess().type).toEqual(LCPresentationActionType.ACCEPT_REQUESTED_DISCREPANCIES_SUCCESS)
    })
  })

  describe('rejectRequestedDiscrepancies()', () => {
    it('calls api.post with the correct arguments', () => {
      rejectRequestedDiscrepancies(fakePresentation(), 'lc-123', { comment: '' })(dispatchMock, jest.fn(), apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`${TRADE_FINANCE_BASE_ENDPOINT}/lc/lc-123/presentations/123/rejectDiscrepancies`)
      expect(config.data).toEqual({ comment: '' })
      expect(config.onError).toEqual(LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_FAILURE)
      expect(config.onSuccess().type).toEqual(LCPresentationActionType.REJECT_REQUESTED_DISCREPANCIES_SUCCESS)
    })
  })
})
