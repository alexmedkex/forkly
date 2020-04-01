import * as React from 'react'
import { shallow } from 'enzyme'
import { DepositLoanType, buildFakeDepositLoanResponse } from '@komgo/types'

import CreateOrEditDepositLoanForm from './CreateOrEditDepositLoanForm'
import { defaultShared } from '../../../constants'
import CreateOrEditSharedWithPart from './CreateOrEditSharedWithPart'

describe('CreateOrEditDepositLoanForm', () => {
  let defaultProps

  beforeEach(() => {
    defaultProps = {
      depositsLoans: [],
      initialValues: {
        type: DepositLoanType.Deposit,
        appetite: true,
        pricing: null,
        periodDuration: null,
        sharedWith: [defaultShared]
      },
      isEdit: false,
      counterparties: [],
      handleSubmit: jest.fn(),
      handleGoBack: jest.fn()
    }
  })

  it('should render succusfully', () => {
    const wrapper = shallow(<CreateOrEditDepositLoanForm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should call handleGoBack when button for cancel is called', () => {
    const wrapper = shallow(<CreateOrEditDepositLoanForm {...defaultProps} />)

    const cancel = wrapper
      .find('Formik')
      .shallow()
      .find('[data-test-id="cancel"]')

    cancel.simulate('click')

    expect(defaultProps.handleGoBack).toHaveBeenCalled()
  })

  it('should find 1 shared with section per default', () => {
    const wrapper = shallow(<CreateOrEditDepositLoanForm {...defaultProps} />)

    const sellerSections = wrapper
      .find('Formik')
      .dive()
      .find(CreateOrEditSharedWithPart)

    expect(sellerSections.length).toBe(1)
  })

  it('should call handleGoBack when button for cancel is called', () => {
    const wrapper = shallow(<CreateOrEditDepositLoanForm {...defaultProps} />)
    const deposit = buildFakeDepositLoanResponse()

    const instance = wrapper.instance() as CreateOrEditDepositLoanForm

    instance.submit(deposit as any)

    expect(defaultProps.handleSubmit).toHaveBeenCalled()
  })
})
