import * as React from 'react'
import { buildFakeCreditLineRequestData } from '@komgo/types'
import { shallow } from 'enzyme'
import DeclineAllRequests from './DeclineAllRequests'
import { LoadingTransition, ErrorMessage } from '../../../../../components'
import { CreditLineType } from '../../../store/types'

describe('DeclineAllRequests', () => {
  let defaultProps

  const request1 = {
    ...buildFakeCreditLineRequestData({ counterpartyStaticId: 'buyer123', staticId: 'request1' }),
    companyName: 'Seller Name',
    counterpartyName: 'Buyer Name'
  }

  beforeEach(() => {
    defaultProps = {
      requests: [request1],
      open: false,
      isSubmitting: false,
      submittingErrors: [],
      handleCancel: jest.fn(),
      handleConfirm: jest.fn(),
      feature: CreditLineType.RiskCover
    }
  })

  it('should render successfully', () => {
    const wrapper = shallow(<DeclineAllRequests {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should have print loading component', () => {
    const wrapper = shallow(<DeclineAllRequests {...defaultProps} isSubmitting={true} />)

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <LoadingTransition title="Declining" marginTop="15px" />
      </div>
    )
  })

  it('should have print error component', () => {
    const wrapper = shallow(<DeclineAllRequests {...defaultProps} submittingErrors={[{ message: 'Test' }]} />)

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <ErrorMessage title="Error" error="Test" />
      </div>
    )
  })

  it('should find decline text and list of sellers', () => {
    const wrapper = shallow(<DeclineAllRequests {...defaultProps} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.find('[data-test-id="decline-all-requests-text"]').text()).toBe(
      'Are you sure you want to decline all reqests on buyer? This will notify the following sellers of the decline:'
    )
    expect(content.find('[data-test-id="declined-company"]').text()).toBe('Seller Name')
  })

  it('should find decline text and list of beneficiaries', () => {
    const wrapper = shallow(<DeclineAllRequests {...defaultProps} feature={CreditLineType.BankLine} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.find('[data-test-id="decline-all-requests-text"]').text()).toBe(
      'Are you sure you want to decline all reqests on issuing bank? This will notify the following beneficiaries of the decline:'
    )
    expect(content.find('[data-test-id="declined-company"]').text()).toBe('Seller Name')
  })
})
