import * as React from 'react'
import { buildFakeCreditLineRequestData } from '@komgo/types'
import { shallow } from 'enzyme'
import SubmitConfirm from './SubmitConfirm'
import { LoadingTransition, ErrorMessage } from '../../../../../components'
import { createInitialCreditLine } from '../../../utils/factories'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'
import { CreditLineType } from '../../../store/types'
import { dictionary } from '../../../dictionary'

describe('SubmitConfirm', () => {
  let defaultProps

  const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

  const request1 = {
    ...buildFakeCreditLineRequestData({ counterpartyStaticId: 'buyer123' }),
    companyName: 'Seller Name',
    counterpartyName: 'Buyer Name'
  }

  beforeEach(() => {
    defaultProps = {
      isEdit: false,
      open: false,
      isSubmitting: false,
      submittingError: [],
      sellersAttached: false,
      handleCancel: jest.fn(),
      handleConfirm: jest.fn(),
      values: initialRiskCoverValues,
      feature: CreditLineType.RiskCover
    }
  })
  it('should render successfully', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should have header Add buyer', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    expect(wrapper.prop('header')).toBe('Add buyer')
  })

  it('should have header Add issuing bank', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} feature={CreditLineType.BankLine} />)

    expect(wrapper.prop('header')).toBe('Add issuing bank')
  })

  it('should have header Edit', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} isEdit={true} />)

    expect(wrapper.prop('header')).toBe('Update information')
  })

  it('should have content for adding buyer with sellers', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual(
      `Are you sure you want to add this buyer and share the selected information with the sellers that have been added in "visibility to ${
        dictionary[defaultProps.feature].financialInstitution.createOrEdit.companyRole
      }" section?`
    )
  })

  it('should have content for adding buyer with sellers for bank lines', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} feature={CreditLineType.BankLine} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual(
      `Are you sure you want to add this issuing bank and share the selected information with the beneficiaries that have been added in "visibility to ${
        dictionary[CreditLineType.BankLine].financialInstitution.createOrEdit.companyRole
      }" section?`
    )
  })

  it('should have content for adding buyer without sellers', () => {
    const wrapper = shallow(
      <SubmitConfirm {...defaultProps} values={{ ...initialRiskCoverValues, sharedCreditLines: [] }} />
    )

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual('Are you sure you want to add this buyer to your list?')
  })

  it('should have content for adding buyer without sellers', () => {
    const wrapper = shallow(
      <SubmitConfirm
        {...defaultProps}
        values={{ ...initialRiskCoverValues, sharedCreditLines: [] }}
        feature={CreditLineType.BankLine}
      />
    )

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual('Are you sure you want to add this issuing bank to your list?')
  })

  it('should have content for editing buyer and sellers', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} isEdit={true} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual(
      'Are you sure you want to edit this buyer? All sellers for whom you have modified information to which they have visibility will be notified.'
    )
  })

  it('should have content for editing buyer and sellers for bank lines', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} isEdit={true} feature={CreditLineType.BankLine} />)

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual(
      'Are you sure you want to edit this issuing bank? All beneficiaries for whom you have modified information to which they have visibility will be notified.'
    )
  })

  it('should have content for editing buyer without sellers', () => {
    const wrapper = shallow(
      <SubmitConfirm {...defaultProps} values={{ ...initialRiskCoverValues, sharedCreditLines: [] }} isEdit={true} />
    )

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual('Are you sure you want to edit this buyer?')
  })

  it('should have content for editing buyer without sellers for bank lines', () => {
    const wrapper = shallow(
      <SubmitConfirm
        {...defaultProps}
        values={{ ...initialRiskCoverValues, sharedCreditLines: [] }}
        isEdit={true}
        feature={CreditLineType.BankLine}
      />
    )

    const content = shallow(wrapper.prop('content'))

    expect(content.text()).toEqual('Are you sure you want to edit this issuing bank?')
  })

  it('should have print loading component', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} isSubmitting={true} />)

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <LoadingTransition title="Submitting" marginTop="15px" />
      </div>
    )
  })

  it('should have print error component', () => {
    const wrapper = shallow(<SubmitConfirm {...defaultProps} submittingError={[{ message: 'Test' }]} />)

    expect(wrapper.prop('content')).toEqual(
      <div className="content">
        <ErrorMessage title="Error" error="Test" />
      </div>
    )
  })

  it('should print text for rejected requests when rejected requests exist', () => {
    const values = { ...initialRiskCoverValues, sharedCreditLines: [] }
    const requests = [request1]

    const wrapper = shallow(<SubmitConfirm {...defaultProps} values={values} requests={requests} />)

    const content = shallow(wrapper.prop('content'))

    const declinedSellers = content.find("[data-test-id='declined-company']")
    const confirmText = content.find("[data-test-id='confirm-text']")

    expect(declinedSellers.length).toBe(1)
    expect(declinedSellers.text()).toBe('Seller Name')
    expect(confirmText.text()).toBe('Are you sure you want to add this buyer to your list?')
  })

  it('should print text for rejected requests when rejected requests exist and sharedCreditLines also exists', () => {
    const values = { ...initialRiskCoverValues, sharedCreditLines: [initialRiskCoverValues] }
    const requests = [request1]

    const wrapper = shallow(<SubmitConfirm {...defaultProps} values={values} requests={requests} />)

    const content = shallow(wrapper.prop('content'))

    const declinedSellers = content.find("[data-test-id='declined-company']")
    const confirmText = content.find("[data-test-id='confirm-text']")

    expect(declinedSellers.length).toBe(1)
    expect(declinedSellers.text()).toBe('Seller Name')
    expect(confirmText.text()).toBe(
      `Are you sure you want to add this buyer and share the selected information with the sellers that have been added in "visibility to ${
        dictionary[defaultProps.feature].financialInstitution.createOrEdit.companyRole
      }" section?`
    )
  })

  it('should print text for rejected requests when rejected requests exist for edit risk cover', () => {
    const values = { ...initialRiskCoverValues, sharedCreditLines: [] }
    const requests = [request1]

    const wrapper = shallow(<SubmitConfirm {...defaultProps} values={values} requests={requests} isEdit={true} />)

    const content = shallow(wrapper.prop('content'))

    const declinedSellers = content.find("[data-test-id='declined-company']")
    const confirmText = content.find("[data-test-id='confirm-text']")

    expect(declinedSellers.length).toBe(1)
    expect(declinedSellers.text()).toBe('Seller Name')
    expect(confirmText.text()).toBe('Are you sure you want to edit this buyer?')
  })

  it('should print text for rejected requests when rejected requests exist and sharedCreditLines also exists', () => {
    const values = { ...initialRiskCoverValues, sharedCreditLines: [initialRiskCoverValues] }
    const requests = [request1]

    const wrapper = shallow(<SubmitConfirm {...defaultProps} values={values} requests={requests} isEdit={true} />)

    const content = shallow(wrapper.prop('content'))

    const declinedSellers = content.find("[data-test-id='declined-company']")
    const confirmText = content.find("[data-test-id='confirm-text']")

    expect(declinedSellers.length).toBe(1)
    expect(declinedSellers.text()).toBe('Seller Name')
    expect(confirmText.text()).toBe(
      'Are you sure you want to edit this buyer? All sellers for whom you have modified information to which they have visibility will be notified. If you have not changed the information within an update request, the seller will be notified that information has been updated.'
    )
  })
})
