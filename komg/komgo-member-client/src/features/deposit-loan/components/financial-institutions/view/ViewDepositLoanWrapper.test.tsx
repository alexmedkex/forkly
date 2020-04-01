import * as React from 'react'
import { shallow } from 'enzyme'
import { buildFakeDepositLoan, buildFakeShareDepositLoan } from '@komgo/types'

import ViewDepositLoanWrapper from './ViewDepositLoanWrapper'
import { CreditAppetiteDepositLoanFeature, IExtendedDepositLoanResponse } from '../../../store/types'

describe('ViewDepositLoanWrapper', () => {
  const deposit: IExtendedDepositLoanResponse = {
    ...buildFakeDepositLoan({ staticId: '123' }),
    sharedWith: [{ ...buildFakeShareDepositLoan(), sharedWithCompanyName: 'Shared Company' }]
  }

  const defaultProps = {
    depositLoan: deposit,
    feature: CreditAppetiteDepositLoanFeature.Deposit,
    canCrudCreditAppetite: true
  }

  it('should render component successfully', () => {
    const wrapper = shallow(<ViewDepositLoanWrapper {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find edit button with appropritate props', () => {
    const wrapper = shallow(<ViewDepositLoanWrapper {...defaultProps} />)

    const editButton = wrapper.find('[data-test-id="edit-information-btn"]').dive()

    expect(editButton.prop('to')).toBe('/deposits/123/edit')
  })

  it('should not find edit button', () => {
    const wrapper = shallow(<ViewDepositLoanWrapper {...defaultProps} canCrudCreditAppetite={false} />)

    const editButton = wrapper.find('[data-test-id="edit-information-btn"]')

    expect(editButton.length).toBe(0)
  })

  it('should find Yes as appetite value', () => {
    const wrapper = shallow(<ViewDepositLoanWrapper {...defaultProps} />)

    const appetite = wrapper.find('[data-test-id="appetite"]')

    expect(appetite.text()).toBe('Yes')
  })

  it('should find pricing prop', () => {
    const wrapper = shallow(<ViewDepositLoanWrapper {...defaultProps} />)

    const pricing = wrapper.find('[data-test-id="pricing"]')

    expect(pricing.text()).toBe('0.90 %')
  })

  it('should find one SharedDepositLoanRow', () => {
    const wrapper = shallow(<ViewDepositLoanWrapper {...defaultProps} />)

    const appetite = wrapper.find('SharedDepositLoanRow')

    expect(appetite.length).toBe(1)
  })
})
