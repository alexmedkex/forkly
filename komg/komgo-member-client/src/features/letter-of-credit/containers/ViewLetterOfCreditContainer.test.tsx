import React from 'react'
import { IProps, ViewLetterOfCreditContainer } from './ViewLetterOfCreditContainer'
import { createMemoryHistory } from 'history'
import { buildFakeLetterOfCredit, IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'
import { fromJS } from 'immutable'
import { render } from '@testing-library/react'
import { MemoryRouter as Router } from 'react-router-dom'
import { LetterOfCreditActionType } from '../store/types'
import { DocumentActionType } from '../../document-management'
import { v4 } from 'uuid'

const staticId = 'myStaticId'
const letterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>({ staticId })

const globalAsAny = global as any
const originalGetSelection = globalAsAny.window.getSelection

describe('ViewLetterOfCreditContainer', () => {
  let testProps: IProps
  beforeEach(() => {
    globalAsAny.window.getSelection = jest.fn(() => {
      return {}
    })

    testProps = {
      isFetching: false,
      isFetchingDocument: false,
      isSubmitting: false,
      isAuthorized: () => true,
      history: createMemoryHistory(),
      location: {
        pathname: '',
        search: '',
        state: '',
        hash: ''
      },
      match: {
        isExact: true,
        path: '',
        url: '',
        params: {
          staticId
        }
      },
      staticContext: undefined,
      letterOfCreditStaticId: staticId,
      letterOfCredit: fromJS(letterOfCredit),
      getLetterOfCreditWithDocument: jest.fn(),
      clearError: jest.fn(),
      clearLoader: jest.fn(),
      issueLetterOfCredit: jest.fn(),
      rejectRequestedLetterOfCredit: jest.fn(),
      getTasks: jest.fn(),
      taskType: null,
      errors: [],
      getDocumentErrors: [],
      submitErrors: [],
      companyStaticId: 'abc'
    }
  })
  afterEach(() => {
    globalAsAny.window.getSelection = originalGetSelection
  })

  it('matches snapshot', () => {
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('calls getLetterOfCredit and getTasks when mounted', () => {
    render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} />
      </Router>
    )
    expect(testProps.getLetterOfCreditWithDocument).toHaveBeenCalledWith(staticId)
    expect(testProps.getTasks).toHaveBeenCalled()
  })
  it('calls clearError with right actions on unmount', () => {
    const { unmount } = render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} />
      </Router>
    )

    unmount()

    expect(testProps.clearError).toHaveBeenCalledWith(LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_REQUEST)
    expect(testProps.clearError).toHaveBeenCalledWith(LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_REQUEST)
  })
  it('calls clearLoader with LetterOfCreditActionType.GET_LETTER_OF_CREDIT_REQUEST on unmount', () => {
    const { unmount } = render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} />
      </Router>
    )

    unmount()

    expect(testProps.clearLoader).toHaveBeenCalledWith(LetterOfCreditActionType.GET_LETTER_OF_CREDIT_REQUEST)
  })
  it('calls clearLoader with document actions', () => {
    const { unmount } = render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} />
      </Router>
    )

    unmount()

    expect(testProps.clearLoader).toHaveBeenCalledWith(DocumentActionType.FETCH_DOCUMENT_CONTENT_REQUEST)
    expect(testProps.clearLoader).toHaveBeenCalledWith(DocumentActionType.FETCH_DOCUMENTS_REQUEST)
  })
  it('shows a loader if we have an lc with an issuing document hash but we dont have the documents yet', () => {
    const issuingDocumentHash = v4()

    const letterOfCredit = fromJS({
      ...buildFakeLetterOfCredit({ staticId }),
      issuingDocumentHash
    })

    const { asFragment } = render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} letterOfCredit={letterOfCredit} isFetchingDocument={true} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('shows an error if there is a document related error', () => {
    const { asFragment } = render(
      <Router>
        <ViewLetterOfCreditContainer {...testProps} getDocumentErrors={[{ message: 'error' } as any]} />
      </Router>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
