import {
  submitLetterOfCredit,
  fetchLettersOfCredit,
  sortBy,
  rejectLetterOfCreditAsync,
  acceptLetterOfCreditAsync,
  getLetterOfCredit,
  getLetterOfCreditWithTradeAndMovements
} from './actions'
import { compressToBase64 } from 'lz-string'
import { stringify } from 'qs'
import { initialState } from './reducer'
import { LetterOfCreditActionType } from './types'
import { LetterOfCreditTaskType } from '../constants/taskType'
import { ILetterOfCreditStatus } from '../types/ILetterOfCredit'

describe('Letter of credit actions', () => {
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

  describe('submitLetterOfCredit()', () => {
    it('calls api.post with the correct arguments', () => {
      const testData = { test: 123 }
      submitLetterOfCredit(testData)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc')

      expect(config.onError).toEqual(LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_FAILURE)
      expect(config.data).toEqual(testData)
      expect(config.onSuccess.type).toEqual(LetterOfCreditActionType.SUBMIT_LETTER_OF_CREDIT_SUCCESS)
      expect(config.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('rejectLetterOfCredit()', () => {
    it('calls api.post with the correct arguments', () => {
      const testData = { rejectComment: 'Test' }
      const letterOfCreditDummy = {
        transactionHash: 'Test',
        _id: 'Test',
        tasks: [{ taskType: LetterOfCreditTaskType.REVIEW_APPLICATION }]
      }
      const task = { taskType: LetterOfCreditTaskType.REVIEW_APPLICATION }
      rejectLetterOfCreditAsync(testData, letterOfCreditDummy, task)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/Test/task/requestReject')

      const jsonToSend = { reason: 'Test' }
      expect(config.data).toEqual(jsonToSend)
    })
  })

  describe('rejectLetterOfCredit()', () => {
    it('calls api.post with the correct arguments', () => {
      const testData = { rejectComment: 'Test' }
      const letterOfCreditDummy = {
        _id: 'Test',
        transactionHash: 'Test',
        status: ILetterOfCreditStatus.ADVISED,
        tasks: [{ taskType: LetterOfCreditTaskType.REVIEW_ISSUED }]
      }
      const task = { taskType: LetterOfCreditTaskType.REVIEW_ISSUED }
      rejectLetterOfCreditAsync(testData, letterOfCreditDummy, task)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/Test/task/rejectBeneficiary')

      const jsonToSend = { reason: 'Test' }
      expect(config.data).toEqual(jsonToSend)
    })
  })

  describe('rejectLetterOfCredit()', () => {
    it('calls api.post with the correct arguments', () => {
      const testData = { rejectComment: 'Test' }
      const letterOfCreditDummy = {
        _id: 'Test',
        transactionHash: 'Test',
        status: ILetterOfCreditStatus.ISSUED,
        tasks: [{ taskType: LetterOfCreditTaskType.REVIEW_ISSUED }]
      }
      const task = { taskType: LetterOfCreditTaskType.REVIEW_ISSUED }
      rejectLetterOfCreditAsync(testData, letterOfCreditDummy, task)(dispatchMock, () => initialState, apiMock)

      const [endpoint, config] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/Test/task/rejectBeneficiary')

      const jsonToSend = { reason: 'Test' }
      expect(config.data).toEqual(jsonToSend)
    })
  })

  describe('fetchLettersOfCredit()', () => {
    it('calls api.get with the correct arguments', () => {
      fetchLettersOfCredit()(dispatchMock, () => initialState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('/trade-finance/v0/lc', {
        onError: LetterOfCreditActionType.LETTERS_OF_CREDIT_FAILURE,
        onSuccess: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
        type: LetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST
      })
    })
    it('calls api.get with compressed filter', () => {
      const filter = {
        query: { 'tradeAndCargoSnapshot.trade._id': { $in: Array.from({ length: 30 }).map((k, v) => v) } },
        projection: undefined,
        options: { sort: { updateAt: -1 } }
      }

      const params = { polling: true, filter }

      fetchLettersOfCredit(params)(dispatchMock, () => initialState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith('/trade-finance/v0/lc', {
        onError: LetterOfCreditActionType.LETTERS_OF_CREDIT_FAILURE,
        onSuccess: LetterOfCreditActionType.LETTERS_OF_CREDIT_SUCCESS,
        type: LetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
        params: { filter: compressToBase64(stringify(filter)), polling: true }
      })
    })
  })

  describe('getLetterOfCredit()', () => {
    it('calls api.get with the correct arguments', () => {
      const id = '0x123'
      getLetterOfCredit({ id })(dispatchMock, () => initialState, apiMock)

      expect(apiMock.get).toHaveBeenCalledWith(`/trade-finance/v0/lc/${id}`, {
        type: LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST,
        onError: LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE,
        onSuccess: LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS,
        params: {}
      })
    })
  })

  describe('getLetterOfCreditWithTradeAndMovements()', () => {
    it('calls api.get with the correct arguments', () => {
      const id = '0x123'
      getLetterOfCreditWithTradeAndMovements({ id })(dispatchMock, () => initialState, apiMock)

      const [endpoint, payload] = apiMock.get.mock.calls[0]

      expect(endpoint).toEqual(`/trade-finance/v0/lc/${id}`)

      expect(payload.onError).toEqual(LetterOfCreditActionType.LETTER_OF_CREDIT_FAILURE)
      expect(payload.onSuccess.type).toEqual(LetterOfCreditActionType.LETTER_OF_CREDIT_SUCCESS)
      expect(payload.onSuccess.afterHandler).toBeDefined()
    })
  })

  describe('sortBy()', () => {
    it('returns an action', () => {
      const action = sortBy({ column: 'reference', direction: 'ascending' })

      expect(action).toEqual({
        type: LetterOfCreditActionType.SORT_LETTERS_OF_CREDIT,
        payload: {
          column: 'reference',
          direction: 'ascending'
        }
      })
    })
  })

  describe('acceptLetterOfCreditAsync()', () => {
    it('should call accept for directLC', () => {
      const letterOfCreditDummy = {
        _id: '1',
        status: ILetterOfCreditStatus.ISSUED,
        direct: true
      }

      acceptLetterOfCreditAsync(letterOfCreditDummy)(dispatchMock, () => initialState, apiMock)
      const [endpoint] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/1/task/acknowledge')
    })

    it('should call advise for issued non-directLC', () => {
      const letterOfCreditDummy = {
        _id: '1',
        status: ILetterOfCreditStatus.ISSUED,
        beneficiaryBankId: '1',
        direct: false
      }

      acceptLetterOfCreditAsync(letterOfCreditDummy)(dispatchMock, () => initialState, apiMock)
      const [endpoint] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/1/task/advise')
    })

    it('should call acknowledge for advised non-directLC', () => {
      const letterOfCreditDummy = {
        _id: '1',
        status: ILetterOfCreditStatus.ADVISED,
        beneficiaryBankId: '1',
        direct: false
      }

      acceptLetterOfCreditAsync(letterOfCreditDummy)(dispatchMock, () => initialState, apiMock)
      const [endpoint] = apiMock.post.mock.calls[0]

      expect(endpoint).toEqual('/trade-finance/v0/lc/1/task/acknowledge')
    })
  })
})
