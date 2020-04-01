import * as React from 'react'
import { shallow } from 'enzyme'
import { LetterOfCreditPresentationDetails } from './LetterOfCreditPresentationDetails'
import { fakeLetterOfCreditEnriched, fakePresentation, fakeDocument, fakeMember, fakeTask } from '../../utils/faker'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import PresentationDetails from '../../components/presentation/PresentationDetails'
import ReviewPresentationDocuments from '../../components/presentation/ReviewPresentationDocuments'

describe('LetterOfCreditPresentationDetails', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      letterOfCredit: fakeLetterOfCreditEnriched(),
      presentation: [fakePresentation({ staticId: '123' })],
      isFetching: false,
      documents: [
        fakeDocument({ context: { productId: 'tradeFinance', subProductId: 'lc', lcPresentationStaticId: '123' } })
      ],
      errors: [],
      fetchingDocumentError: [],
      match: {
        isExact: true,
        path: '',
        url: '',
        params: {
          lcId: '123',
          presentationId: '123'
        }
      },
      isSettingUpDiscrepantDocuments: false,
      settingUpDiscrepantDocumentsError: [],
      settingUpCompliantDocumentsError: [],
      isSettingUpCompliantDocuments: false,
      members: [fakeMember({ staticId: '08e9f8e3-94e5-459e-8458-ab512bee6e2c', commonName: 'Applicant Name' })],
      documentsReview: [],
      getLetterOfCredit: jest.fn(),
      isAuthorized: () => true,
      getTasks: jest.fn(),
      fetchPresentationDocumentsReceived: jest.fn()
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<LetterOfCreditPresentationDetails {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find loading component', () => {
    const wrapper = shallow(<LetterOfCreditPresentationDetails {...defaultProps} isFetching={true} />)

    const loader = wrapper.find(LoadingTransition).first()

    expect(loader.exists()).toBe(true)
  })

  it('should find error component', () => {
    const wrapper = shallow(<LetterOfCreditPresentationDetails {...defaultProps} errors={[{ message: 'Error' }]} />)

    const error = wrapper.find(ErrorMessage).first()

    expect(error.exists()).toBe(true)
  })

  it('should find PresentationDetails component', () => {
    const wrapper = shallow(<LetterOfCreditPresentationDetails {...defaultProps} />)

    const details = wrapper.find(PresentationDetails).first()

    expect(details.exists()).toBe(true)
  })

  it('should not fid ReviewPresentationDocuments without task', () => {
    const wrapper = shallow(<LetterOfCreditPresentationDetails {...defaultProps} />)

    const details = wrapper.find(ReviewPresentationDocuments)

    expect(details.length).toBe(0)
  })

  it('should not fid ReviewPresentationDocuments without task', () => {
    const wrapper = shallow(
      <LetterOfCreditPresentationDetails
        {...defaultProps}
        task={fakeTask({})}
        documentsReview={[{ document: {}, status: 'pending', note: 'string' }]}
      />
    )

    const details = wrapper.find(ReviewPresentationDocuments)

    expect(details.length).toBe(1)
  })

  it('should call fetchPresentationDocumentsReceived when there is task for review presentation', () => {
    const wrapper = shallow(<LetterOfCreditPresentationDetails {...defaultProps} task={fakeTask({})} />)

    expect(defaultProps.fetchPresentationDocumentsReceived).toHaveBeenCalled()
  })
})
