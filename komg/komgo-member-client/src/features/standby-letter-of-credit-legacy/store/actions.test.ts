import { history } from '../../../store'
import {
  submitStandbyLetterOfCredit,
  getStandbyLetterOfCredit,
  fetchStandByLettersOfCredit,
  getStandbyLetterOfCreditWithTradesAndCargos,
  fetchSBLCDocuments,
  issueStandbyLetterOfCredit,
  rejectStandbyLetterOfCreditRequest
} from './actions'
import { StandbyLetterOfCreditActionType } from './types'

import {
  IStandbyLetterOfCreditBase,
  buildFakeStandByLetterOfCreditBase,
  buildFakeStandByLetterOfCredit
} from '@komgo/types'
import uuid from 'uuid'

describe('StandbyLetterOfCreditActions', () => {
  let dispatchMock: any
  let apiMock: any
  let getStateMock: any
  const dummyAction = { type: 'test' }

  beforeEach(() => {
    dispatchMock = jest.fn()
    apiMock = {
      post: jest.fn(() => dummyAction),
      get: jest.fn(() => dummyAction)
    }
    getStateMock = jest.fn()
  })

  describe('submitStandbyLetterOfCredit()', () => {
    it('calls api.post with the correct arguments', () => {
      const letter: IStandbyLetterOfCreditBase = buildFakeStandByLetterOfCreditBase()
      submitStandbyLetterOfCredit(letter)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/standby-letters-of-credit')

      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_FAILURE)
      expect(config.data).toEqual(letter)
      expect(config.onSuccess.type).toEqual(StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })

    describe('afterHandler', () => {
      let ref
      let staticId

      beforeEach(() => {
        jest.resetModules()
        ref = uuid.v4()
        staticId = uuid.v4()
      })

      it('goBack', () => {
        jest.mock('../../../store', () => ({
          history: {
            length: 5,
            push: jest.fn(),
            goBack: jest.fn()
          }
        }))

        const { history } = require('../../../store')

        const { submitStandbyLetterOfCredit } = require('./actions')
        submitStandbyLetterOfCredit(staticId, ref)(dispatchMock, () => null, apiMock)
        const [endpoint, config] = apiMock.post.mock.calls[0]

        config.onSuccess.afterHandler()

        expect(history.push).not.toHaveBeenCalled()
        expect(history.goBack).toHaveBeenCalled()
      })

      it('redirects to SBLC list', () => {
        jest.mock('../../../store', () => ({
          history: {
            length: 4,
            push: jest.fn(),
            goBack: jest.fn()
          }
        }))

        const { history } = require('../../../store')

        const { submitStandbyLetterOfCredit } = require('./actions')
        submitStandbyLetterOfCredit(staticId, ref)(dispatchMock, () => null, apiMock)
        const [endpoint, config] = apiMock.post.mock.calls[0]
        config.onSuccess.afterHandler()
        expect(history.goBack).not.toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith('/financial-instruments?tab=Standby%20Letters%20of%20Credit')
      })
    })
  })

  describe('getStandbyLetterOfCredit()', () => {
    it('calls api.get with the correct arguments', () => {
      const id = '123'
      getStandbyLetterOfCredit(id)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/standby-letters-of-credit/${id}`)

      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_FAILURE)
      expect(config.data).not.toBeDefined()
      expect(config.onSuccess).toEqual(StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS)
      expect(config.onSuccess.afterHandler).not.toBeDefined()
    })
  })

  describe('fetchStandByLettersOfCredit()', () => {
    it('calls api.get with the correct arguments', () => {
      const params = {
        filter: {
          options: { sort: { updatedAt: 1 }, skip: 0, limit: 200 }
        }
      }
      fetchStandByLettersOfCredit(params)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/standby-letters-of-credit')

      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_FAILURE)
      expect(config.onSuccess.type).toEqual(StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_SUCCESS)
    })
  })

  describe('getStandbyLetterOfCreditWithTradesAndCargos()', () => {
    it('calls api.get with the correct arguments', () => {
      const id = '123'
      getStandbyLetterOfCreditWithTradesAndCargos(id)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/standby-letters-of-credit/${id}`)

      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_FAILURE)
      expect(config.data).not.toBeDefined()
      expect(config.onSuccess.type).toEqual(StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('fetchSBLCDocuments()', () => {
    it('calls api.get with the correct arguments', () => {
      const sblcId = '123'
      fetchSBLCDocuments(sblcId)(dispatchMock, getStateMock, apiMock)

      const [endpoint, config] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/standby-letters-of-credit/123/documents')

      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_FAILURE)
      expect(config.onSuccess()).toEqual({
        type: StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_SUCCESS
      })
    })
  })

  describe('issueStandbyLetterOfCredit()', () => {
    it('calls api.post with the correct arguments', () => {
      const id = uuid.v4()
      const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })
      const sblc = buildFakeStandByLetterOfCredit({ staticId: id })

      issueStandbyLetterOfCredit(sblc, file)(dispatchMock, () => null, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/standby-letters-of-credit/${id}/issue`)

      expect(config.type).toEqual(StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST)
      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_FAILURE)
      expect(config.data).toBeDefined()
      expect(config.onSuccess.type).toEqual(StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })

    describe('afterHandler', () => {
      let ref
      let staticId

      beforeEach(() => {
        jest.resetModules()
        ref = uuid.v4()
        staticId = uuid.v4()
      })

      it('goBack', () => {
        jest.mock('../../../store', () => ({
          history: {
            length: 5,
            push: jest.fn(),
            goBack: jest.fn()
          }
        }))

        const { history } = require('../../../store')

        const { issueStandbyLetterOfCredit } = require('./actions')
        issueStandbyLetterOfCredit(staticId, ref)(dispatchMock, () => null, apiMock)
        const [endpoint, config] = apiMock.post.mock.calls[0]

        config.onSuccess.afterHandler()

        expect(history.push).not.toHaveBeenCalled()
        expect(history.goBack).toHaveBeenCalled()
      })

      it('redirects to SBLC list', () => {
        jest.mock('../../../store', () => ({
          history: {
            length: 4,
            push: jest.fn(),
            goBack: jest.fn()
          }
        }))

        const { history } = require('../../../store')

        const { issueStandbyLetterOfCredit } = require('./actions')
        issueStandbyLetterOfCredit(staticId, ref)(dispatchMock, () => null, apiMock)
        const [endpoint, config] = apiMock.post.mock.calls[0]
        config.onSuccess.afterHandler()
        expect(history.goBack).not.toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith('/financial-instruments?tab=Standby%20Letters%20of%20Credit')
      })
    })
  })
  describe('rejectStandbyLetterOfCreditRequest()', () => {
    it('calls api.post with the correct arguments', () => {
      const ref = uuid.v4()
      const staticId = uuid.v4()

      rejectStandbyLetterOfCreditRequest(staticId, ref)(dispatchMock, () => null, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/standby-letters-of-credit/${staticId}/rejectrequest`)

      expect(config.type).toEqual(StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST)
      expect(config.onError).toEqual(StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_FAILURE)
      expect(config.data).toEqual({ issuingBankReference: ref })
      expect(config.onSuccess.type).toEqual(StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })

    describe('afterHandler', () => {
      let ref
      let staticId

      beforeEach(() => {
        jest.resetModules()
        ref = uuid.v4()
        staticId = uuid.v4()
      })

      it('goBack', () => {
        jest.mock('../../../store', () => ({
          history: {
            length: 5,
            push: jest.fn(),
            goBack: jest.fn()
          }
        }))

        const { history } = require('../../../store')

        const { rejectStandbyLetterOfCreditRequest } = require('./actions')
        rejectStandbyLetterOfCreditRequest(staticId, ref)(dispatchMock, () => null, apiMock)
        const [endpoint, config] = apiMock.post.mock.calls[0]

        config.onSuccess.afterHandler()

        expect(history.push).not.toHaveBeenCalled()
        expect(history.goBack).toHaveBeenCalled()
      })

      it('redirects to SBLC list', () => {
        jest.mock('../../../store', () => ({
          history: {
            length: 4,
            push: jest.fn(),
            goBack: jest.fn()
          }
        }))

        const { history } = require('../../../store')

        const { rejectStandbyLetterOfCreditRequest } = require('./actions')
        rejectStandbyLetterOfCreditRequest(staticId, ref)(dispatchMock, () => null, apiMock)
        const [endpoint, config] = apiMock.post.mock.calls[0]
        config.onSuccess.afterHandler()
        expect(history.goBack).not.toHaveBeenCalled()
        expect(history.push).toHaveBeenCalledWith('/financial-instruments?tab=Standby%20Letters%20of%20Credit')
      })
    })
  })
})
