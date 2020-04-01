import * as React from 'react'
import { shallow } from 'enzyme'
import RequestInformationForm, { FieldWrapper } from './RequestInformationForm'
import { fakeMember, fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'
import SearchCheckboxes from '../../../../../components/form/search-checkboxes/SearchCheckboxes'
import { buildFakeCreditLine } from '@komgo/types'
import { createInitialRequestInforamtion } from '../../../utils/factories'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'

describe('RequestInformationForm', () => {
  const disclosedItems = [
    { ...buildFakeCreditLine({ updatedAt: '2019-05-28T15:23:06.076Z' }), ownerStaticId: 'bank123' }
  ]
  const bank1 = fakeMember({ staticId: 'bank123', commonName: 'Bank123', isFinancialInstitution: true })
  const bank2 = fakeMember({ staticId: 'bank1234', commonName: 'Bank1234', isFinancialInstitution: true })

  const defaultProps: any = {
    handleSubmit: jest.fn(),
    members: [fakeMember()],
    counterparties: [fakeCounterparty(), fakeCounterparty({ isFinancialInstitution: true })],
    handleGoBack: jest.fn(),
    disclosedItems: [],
    dictionary: {},
    initialValues: createInitialRequestInforamtion(Products.TradeFinance, SubProducts.ReceivableDiscounting)
  }

  it('should render component sucessfully', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find 2 buttons', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} />)

    const buttons = wrapper
      .find('Formik')
      .dive()
      .find('Button')

    expect(buttons.length).toBe(2)
  })

  it('should call history go back when cancel is clicked', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} />)

    const cancel = wrapper
      .find('Formik')
      .dive()
      .find('[data-test-id="cancel"]')
    cancel.simulate('click')

    expect(defaultProps.handleGoBack).toHaveBeenCalled()
  })

  it('should format counterparties for banks dropdown', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} />)

    const instance = wrapper.instance() as RequestInformationForm

    const banks = instance.getBanksDropdownItems('123')
    const expectedBanks = [
      {
        name: defaultProps.counterparties[1].x500Name.CN,
        value: defaultProps.counterparties[1].staticId
      }
    ]

    expect(banks).toEqual(expectedBanks)
  })

  it('should format counterparties for banks dropdown and return undefined if disclosed information is set', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} updatingItemName="Member123" />)

    const instance = wrapper.instance() as RequestInformationForm

    const banks = instance.getBanksDropdownItems('123')

    expect(banks).toEqual(undefined)
  })

  it('should find two FieldWrapper component', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} />)

    const fieldWrappers = wrapper
      .find('Formik')
      .dive()
      .find(FieldWrapper)

    expect(fieldWrappers.length).toBe(2)
  })

  it('should find one FieldWrapper component and child should be SearchCheckboxes not Field', () => {
    const wrapper = shallow(<RequestInformationForm {...defaultProps} updatingItemName="Member123" />)

    const fieldWrappers = wrapper
      .find('Formik')
      .dive()
      .find(FieldWrapper)

    const searchCheckboxes = fieldWrappers.find(SearchCheckboxes)

    expect(fieldWrappers.length).toBe(1)
    expect(searchCheckboxes.length).toBe(1)
  })

  it('should return appropriate banks group', () => {
    const counterparties = [bank1, bank2]

    const wrapper = shallow(
      <RequestInformationForm
        {...defaultProps}
        updatingItemName="Member123"
        counterparties={counterparties}
        disclosedItems={disclosedItems}
      />
    )
    const instance = wrapper.instance() as RequestInformationForm

    const expectedGroupItems = [
      {
        label: 'Banks which disclosed information on Member123',
        options: [{ name: 'Bank123', value: 'bank123', info: 'Updated information on 2019/05/28' }]
      },
      {
        label: 'Banks which have not disclosed information on Member123',
        options: [{ name: 'Bank1234', value: 'bank1234' }]
      }
    ]

    const banksGroups = instance.getBanksDropdownGroupItems('123')

    expect(banksGroups).toEqual(expectedGroupItems)
  })

  it('should return undefined for banks group', () => {
    const counterparties = [bank1, bank2]

    const wrapper = shallow(
      <RequestInformationForm {...defaultProps} counterparties={counterparties} disclosedItems={disclosedItems} />
    )
    const instance = wrapper.instance() as RequestInformationForm

    const banksGroups = instance.getBanksDropdownGroupItems('123')

    expect(banksGroups).toEqual(undefined)
  })
})
