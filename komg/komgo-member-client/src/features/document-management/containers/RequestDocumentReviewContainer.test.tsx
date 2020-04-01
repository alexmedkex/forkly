import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import moment from 'moment-timezone'

import { RequestDocumentReviewContainer } from './RequestDocumentReviewContainer'
import { fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'
import { mockRequest } from '../store/requests/mock-data'

describe('RequestDocumentReviewContainer', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      request: { ...mockRequest[0], createdAt: '2019-08-12T16:10:31.811Z', updatedAt: '2019-08-12T16:10:31.811Z' },
      id: '123',
      isFetching: false,
      errors: [],
      counterparty: fakeCounterparty(),
      isAuthorized: jest.fn(() => true),
      fetchDocumentsAsync: jest.fn(),
      fetchConnectedCounterpartiesAsync: jest.fn(),
      fetchRequestbyIdAsync: jest.fn(),
      history: {
        length: 10,
        push: jest.fn(),
        goBack: jest.fn()
      }
    }

    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    Date.now = jest.fn(() => 1487076708000)
  })

  it('should match default snapshot', () => {
    expect(renderer.create(<RequestDocumentReviewContainer {...defaultProps} />)).toMatchSnapshot()
  })

  it('should render loading', () => {
    const wrapper = shallow(<RequestDocumentReviewContainer {...defaultProps} isFetching={true} />)

    const loadingTransition = wrapper.find('LoadingTransition')
    const errorMessage = wrapper.find('ErrorMessage')

    expect(errorMessage.length).toBe(0)
    expect(loadingTransition.length).toBe(1)
  })

  it('should render errors', () => {
    const wrapper = shallow(<RequestDocumentReviewContainer {...defaultProps} errors={[{ message: 'Test' }]} />)

    const errorMessage = wrapper.find('ErrorMessage')
    const loadingTransition = wrapper.find('LoadingTransition')

    expect(errorMessage.length).toBe(1)
    expect(loadingTransition.length).toBe(0)
  })

  it('should find RequestOverview with appropriate props for requestSide', () => {
    const wrapper = shallow(<RequestDocumentReviewContainer {...defaultProps} />)

    const requestOverview = wrapper.find('RequestOverview')

    expect(requestOverview.prop('requestSide')).toBe('Sender')
  })

  it('should call history goBack when handleClosePage is called and history length is more then 0', () => {
    const wrapper = shallow(<RequestDocumentReviewContainer {...defaultProps} />)

    const instance = wrapper.instance() as RequestDocumentReviewContainer

    instance.handleClosePage()

    expect(defaultProps.history.goBack).toHaveBeenCalled()
  })

  it('should redirect to dashboard when history length is 0', () => {
    const wrapper = shallow(
      <RequestDocumentReviewContainer {...defaultProps} history={{ ...defaultProps.history, length: 0 }} />
    )

    const instance = wrapper.instance() as RequestDocumentReviewContainer

    instance.handleClosePage()

    expect(defaultProps.history.push).toHaveBeenCalled()
  })
})
