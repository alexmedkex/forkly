import * as React from 'react'
import {
  submitLetterOfCreditAmendment,
  getLetterOfCreditAmendment,
  issueLetterOfCreditAmendmentRequest,
  rejectLetterOfCreditAmendmentRequest
} from './actions'
import { initialState } from './reducer'
import { LetterOfCreditAmendmentActionType } from './types'
import { ILCAmendmentRejection } from '@komgo/types'

describe('letter of credit amendment actions', () => {
  let dispatchMock: any
  let apiMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction)
    }
  })
  describe('submitLetterOfCreditAmendment', () => {
    it('creates the correct action', () => {
      const testData = { test: 123 }
      const staticId = 'abc'
      submitLetterOfCreditAmendment(testData, staticId)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/abc/amendments')

      expect(config.onError).toEqual(LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess.type).toEqual(LetterOfCreditAmendmentActionType.SUBMIT_AMENDMENT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })
  describe('getLetterOfCreditAmendment', () => {
    it('creates correct action', () => {
      const amendmentId = 'abc'
      getLetterOfCreditAmendment(amendmentId)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/amendments/abc')

      expect(config.onError).toEqual(LetterOfCreditAmendmentActionType.GET_AMENDMENT_FAILURE)
      expect(config.onSuccess).toEqual(LetterOfCreditAmendmentActionType.GET_AMENDMENT_SUCCESS)
    })
  })
  describe('issueLetterOfCreditAmendmentRequest', () => {
    it('creates correct action', () => {
      const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })

      const amendmentId = 'abc'

      issueLetterOfCreditAmendmentRequest(amendmentId, file)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/lc/amendments/${amendmentId}/approve`)
      expect(config.onError).toEqual(LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_FAILURE)
      expect(config.onSuccess.type).toEqual(LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(LetterOfCreditAmendmentActionType.ISSUE_AMENDMENT_REQUEST)
      expect(config.data).toBeDefined()
    })
  })
  describe('rejectLetterOfCreditAmendmentRequest', () => {
    it('creates correct action', () => {
      const rejectRequest: ILCAmendmentRejection = {
        comment: 'test comment'
      }
      const amendmentId = '555'

      rejectLetterOfCreditAmendmentRequest(amendmentId, rejectRequest)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/lc/amendments/${amendmentId}/reject`)
      expect(config.onError).toEqual(LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_FAILURE)
      expect(config.onSuccess.type).toEqual(LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
      expect(config.type).toEqual(LetterOfCreditAmendmentActionType.REJECT_AMENDMENT_REQUEST)
      expect(config.data).toEqual(rejectRequest)
    })
  })
})
