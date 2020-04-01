import * as React from 'react'
import {
  IDataLetterOfCreditBase,
  ILetterOfCreditBase,
  LetterOfCreditType,
  buildFakeLetterOfCredit,
  ILetterOfCredit,
  IDataLetterOfCredit
} from '@komgo/types'
import {
  createLetterOfCredit,
  getLetterOfCredit,
  fetchLettersOfCreditByType,
  issueLetterOfCredit,
  rejectRequestedLetterOfCredit,
  getLetterOfCreditWithDocument
} from './actions'
import { LetterOfCreditActionType } from './types'
import { history } from '../../../store'
import { v4 } from 'uuid'
import { fromJS } from 'immutable'
import { DocumentActionType } from '../../document-management'
import { ApplicationState } from '../../../store/reducers'

describe('createLetterOfCredit()', () => {
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
  it('calls api.post with the correct arguments', () => {
    const letter: ILetterOfCreditBase<IDataLetterOfCreditBase> = { definitely: 'genuine' } as any
    createLetterOfCredit(letter)(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.post.mock.calls[0]

    expect(endpoint).toEqual('/trade-finance/v0/letterofcredit')

    expect(config.onError).toEqual(LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_FAILURE)
    expect(config.data).toEqual(letter)
    expect(config.onSuccess.type).toEqual(LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_SUCCESS)
    expect(config.onSuccess.afterHandler).toBeDefined()
    expect(config.type).toEqual(LetterOfCreditActionType.CREATE_STANDBY_LETTER_OF_CREDIT_REQUEST)
  })
  it('redirects to trades dashboard', () => {
    const letter: ILetterOfCreditBase<IDataLetterOfCreditBase> = { definitely: 'genuine' } as any
    createLetterOfCredit(letter)(dispatchMock, getStateMock, apiMock)
    const [_, config] = apiMock.post.mock.calls[0]

    config.onSuccess.afterHandler()

    expect(history.location.pathname).toEqual('/trades')
    expect(history.location.search).toEqual('?tradingRole=buyer')
  })
})

describe('getLetterOfCredit()', () => {
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
  it('calls api.get with the correct arguments', () => {
    const staticId = v4()
    getLetterOfCredit(staticId)(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.get.mock.calls[0]

    expect(endpoint).toEqual(`/trade-finance/v0/letterofcredit/${staticId}`)

    expect(config.onError).toEqual(LetterOfCreditActionType.GET_LETTER_OF_CREDIT_FAILURE)
    expect(config.onSuccess.type).toEqual(LetterOfCreditActionType.GET_LETTER_OF_CREDIT_SUCCESS)
    expect(config.onSuccess.afterHandler).toBeDefined()
    expect(config.type).toEqual(LetterOfCreditActionType.GET_LETTER_OF_CREDIT_REQUEST)
  })
  it('calls afterHandler with staticId if afterHandler defined', () => {
    const staticId = v4()
    const afterHandler = jest.fn(() => () => ({}))

    getLetterOfCredit(staticId, afterHandler)(dispatchMock, getStateMock, apiMock)

    expect(afterHandler).not.toHaveBeenCalled()

    const [_, config] = apiMock.get.mock.calls[0]

    config.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(afterHandler).toHaveBeenCalledWith(staticId)
  })
})

describe('getLetterOfCreditWithDocument', () => {
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

  it('calls GET documents when the returned letter of credit has an issuingDocumentHash', () => {
    const staticId = v4()

    const issuingDocumentHash = v4()

    const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = {
      ...buildFakeLetterOfCredit({ staticId }),
      issuingDocumentHash
    }

    getLetterOfCreditWithDocument(staticId)(dispatchMock, getStateMock, apiMock)

    const [_, firstConfig] = apiMock.get.mock.calls[0]

    getStateMock = jest.fn().mockImplementation(() =>
      fromJS({
        templatedLettersOfCredit: {
          byStaticId: {
            [letterOfCredit.staticId]: letterOfCredit
          }
        }
      })
    )

    firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(apiMock.get).toHaveBeenCalledTimes(2)

    const [endpoint, secondConfig] = apiMock.get.mock.calls[1]

    expect(endpoint).toEqual(`/docs/v0/trade-finance/documents`)
    expect(secondConfig.type).toEqual(DocumentActionType.FETCH_DOCUMENTS_REQUEST)
  })

  it('does not call get documents when letter of credit has no issuing document hash', () => {
    const staticId = v4()

    const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = buildFakeLetterOfCredit({ staticId })

    getLetterOfCreditWithDocument(staticId)(dispatchMock, getStateMock, apiMock)

    const [, firstConfig] = apiMock.get.mock.calls[0]

    getStateMock = jest.fn().mockImplementation(() =>
      fromJS({
        templatedLettersOfCredit: {
          byStaticId: {
            [letterOfCredit.staticId]: letterOfCredit
          }
        }
      })
    )

    firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(apiMock.get).toHaveBeenCalledTimes(1)
  })

  it('calls GET documents and GET document content when the returned letter of credit has an issuingDocumentHash and there is an associated document metadata', () => {
    const staticId = v4()

    const issuingDocumentHash = v4()
    const documentId = v4()

    const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = {
      ...buildFakeLetterOfCredit({ staticId }),
      issuingDocumentHash
    }

    getLetterOfCreditWithDocument(staticId)(dispatchMock, getStateMock, apiMock)

    const [, firstConfig] = apiMock.get.mock.calls[0]

    let state: ApplicationState = fromJS({
      templatedLettersOfCredit: {
        byStaticId: {
          [letterOfCredit.staticId]: letterOfCredit
        }
      },
      documents: {
        allDocuments: []
      }
    })

    // We can't use fromJS directly because in the app we aren't using immutable fully for this reducer
    state = state.set(
      'documents',
      state.get('documents').set('allDocuments', [{ id: documentId, hash: letterOfCredit.issuingDocumentHash } as any])
    )

    getStateMock = jest.fn().mockImplementation(() => state)

    firstConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    const [, secondConfig] = apiMock.get.mock.calls[1]

    secondConfig.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(apiMock.get).toHaveBeenCalledTimes(3)

    const [endpoint, thirdConfig] = apiMock.get.mock.calls[2]

    expect(endpoint).toEqual(`/docs/v0/trade-finance/documents/${documentId}/content?printVersion=${true}`)
    expect(thirdConfig.type).toEqual(DocumentActionType.FETCH_DOCUMENT_CONTENT_REQUEST)
  })
})

describe('fetchLettersOfCreditByType()', () => {
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

  it('calls api.get with the correct arguments', () => {
    const type = LetterOfCreditType.Standby
    fetchLettersOfCreditByType(type)(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.get.mock.calls[0]

    expect(endpoint).toEqual(`/trade-finance/v0/letterofcredit`)

    expect(config.onError).toEqual(LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_FAILURE)
    expect(config.onSuccess.type).toEqual(LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_SUCCESS)
    expect(config.onSuccess.afterHandler).toBeDefined()
    expect(config.type).toEqual(LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_REQUEST)
  })
  it('calls afterHandler with staticId if afterHandler defined', () => {
    const afterHandler = jest.fn(() => () => ({}))
    const params = {
      myParam: 123
    }

    fetchLettersOfCreditByType(params, afterHandler)(dispatchMock, getStateMock, apiMock)

    expect(afterHandler).not.toHaveBeenCalled()

    const [_, config] = apiMock.get.mock.calls[0]

    config.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(afterHandler).toHaveBeenCalledWith(params)
  })
  it('calls api.get with a compressed filter param but calls the afterHandler with uncompressed version', () => {
    const afterHandler = jest.fn(() => () => ({}))
    const params = {
      filter: 'going to be compressed'
    }

    fetchLettersOfCreditByType(params, afterHandler)(dispatchMock, getStateMock, apiMock)

    expect(afterHandler).not.toHaveBeenCalled()

    const [_, config] = apiMock.get.mock.calls[0]

    expect(config.params.filter).not.toEqual(params.filter)

    config.onSuccess.afterHandler({ dispatch: dispatchMock, getState: getStateMock })

    expect(afterHandler).toHaveBeenCalledWith(params)
  })
})

describe('issueLetterOfCredit()', () => {
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

  it('calls api.post with the correct arguments', () => {
    const letter: ILetterOfCreditBase<IDataLetterOfCreditBase> = { definitely: 'genuine' } as any
    const staticId = v4()
    const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })

    issueLetterOfCredit(staticId, letter, file)(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.post.mock.calls[0]

    expect(endpoint).toEqual(`/trade-finance/v0/letterofcredit/${staticId}/issue`)

    expect(config.onError).toEqual(LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_FAILURE)
    expect(config.data).toBeDefined()
    expect(config.onSuccess.type).toEqual(LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_SUCCESS)
    expect(config.onSuccess.afterHandler).toBeDefined()
    expect(config.type).toEqual(LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_REQUEST)
  })

  it('redirects to LC list', () => {
    const letter: ILetterOfCreditBase<IDataLetterOfCreditBase> = { definitely: 'genuine' } as any
    const staticId = v4()
    const file = new File(['dummy content'], 'fakeFile.png', { type: 'image/png' })

    issueLetterOfCredit(staticId, letter, file)(dispatchMock, () => null, apiMock)
    const [, config] = apiMock.post.mock.calls[0]
    config.onSuccess.afterHandler()
    expect(history.location.pathname).toEqual('/letters-of-credit')
  })
})

describe('rejectRequestedLetterOfCredit()', () => {
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
  it('calls api.post with the correct arguments', () => {
    const letter: ILetterOfCreditBase<IDataLetterOfCreditBase> = { definitely: 'genuine' } as any
    const staticId = v4()

    rejectRequestedLetterOfCredit(staticId, letter)(dispatchMock, getStateMock, apiMock)

    const [endpoint, config] = apiMock.post.mock.calls[0]

    expect(endpoint).toEqual(`/trade-finance/v0/letterofcredit/${staticId}/rejectrequest`)

    expect(config.onError).toEqual(LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_FAILURE)
    expect(config.data).toEqual(letter)
    expect(config.onSuccess.type).toEqual(LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_SUCCESS)
    expect(config.onSuccess.afterHandler).toBeDefined()
    expect(config.type).toEqual(LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_REQUEST)
  })
  it('redirects to LC list', () => {
    const letter: ILetterOfCreditBase<IDataLetterOfCreditBase> = { definitely: 'genuine' } as any
    const staticId = v4()

    rejectRequestedLetterOfCredit(staticId, letter)(dispatchMock, () => null, apiMock)
    const [, config] = apiMock.post.mock.calls[0]
    config.onSuccess.afterHandler()
    expect(history.location.pathname).toEqual('/letters-of-credit')
  })
})
