import * as React from 'react'
import * as renderer from 'react-test-renderer'
import moment from 'moment-timezone'

import RequestOverview, { RequestSide } from './RequestOverview'
import { fakeCounterparty } from '../../../letter-of-credit-legacy/utils/faker'
import { mockRequest } from '../../store/requests/mock-data'

describe('RequestOverview', () => {
  const defaultProps = {
    request: { ...mockRequest[0], createdAt: '2019-08-12T16:10:31.811Z', updatedAt: '2019-08-12T16:10:31.811Z' },
    counterparty: fakeCounterparty(),
    requestSide: RequestSide.Sender
  }

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'Europe/Belgrade')
    moment.tz.setDefault('Europe/Belgrade')
    Date.now = jest.fn(() => 1487076708000)
  })

  it('should match sender snapshot', () => {
    expect(renderer.create(<RequestOverview {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should match receiver snapshot', () => {
    expect(
      renderer.create(<RequestOverview {...defaultProps} requestSide={RequestSide.Receiver} />).toJSON()
    ).toMatchSnapshot()
  })

  it('should match snapshot with - when dates does not exists', () => {
    expect(renderer.create(<RequestOverview {...defaultProps} request={mockRequest[0]} />).toJSON()).toMatchSnapshot()
  })
})
