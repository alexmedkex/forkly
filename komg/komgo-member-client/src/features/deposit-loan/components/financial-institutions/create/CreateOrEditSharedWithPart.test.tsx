import * as React from 'react'
import { shallow } from 'enzyme'

import { CreateOrEditSharedWithPart } from './CreateOrEditSharedWithPart'
import { fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'
import { fakeFormikContext, fakeArrayHelpers } from '../../../../../store/common/faker'
import { createInitialDepositLoan } from '../../../utils/factories'
import { CreditAppetiteDepositLoanFeature } from '../../../store/types'

describe('CreateOrEditSharedWithPart', () => {
  let defaultProps
  const initialData = createInitialDepositLoan(CreditAppetiteDepositLoanFeature.Deposit)
  const fakeFomik = { ...fakeFormikContext(initialData), setFieldValue: jest.fn() }
  const counterparty = fakeCounterparty({ staticId: '123', commonName: 'Company 1' })

  beforeEach(() => {
    defaultProps = {
      counterparties: [counterparty],
      formik: fakeFomik
    }
  })

  it('should render component succusfully', () => {
    const wrapper = shallow(<CreateOrEditSharedWithPart {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should return one counterparty option when getCounterpartiesDropdownOptions is called', () => {
    const wrapper = shallow(<CreateOrEditSharedWithPart {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditSharedWithPart

    expect(instance.getCounterpartiesDropdownOptions()).toEqual([
      { content: 'Company 1', text: 'Company 1', value: '123' }
    ])
  })

  it('should set state when handleRemoveSharedWithCounterparty is called', () => {
    const wrapper = shallow(<CreateOrEditSharedWithPart {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditSharedWithPart

    instance.handleRemoveSharedWithCounterparty(0, fakeArrayHelpers)

    expect(wrapper.state('removeSharedWithId')).toBe(0)
  })

  it('should call arrayHelpers.remove with appropriate id when handleConfirmRemove is called and state should be returned to default', () => {
    const wrapper = shallow(<CreateOrEditSharedWithPart {...defaultProps} />)
    wrapper.setState({
      removeSharedWithId: 6,
      arrayHelpers: fakeArrayHelpers
    })

    const instance = wrapper.instance() as CreateOrEditSharedWithPart

    instance.handleConfirmRemove()

    expect(fakeArrayHelpers.remove).toHaveBeenCalledWith(6)
    expect(wrapper.state('removeSharedWithId')).toBeFalsy()
  })

  it('should add one empty item in formik sharedWith when counterparty is picked', () => {
    const wrapper = shallow(<CreateOrEditSharedWithPart {...defaultProps} />)
    const newFormikValues = {
      ...initialData,
      sharedWith: [{ ...initialData.sharedWith[0], sharedWithStaticId: '1111' }]
    }

    wrapper.setProps({ formik: { ...defaultProps.formik, values: newFormikValues } })

    expect(defaultProps.formik.setFieldValue).toHaveBeenCalled()
  })
})
