import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { ArrayHelpers } from 'formik'
import { fakeCounterparty, fakeMember } from '../../../../letter-of-credit-legacy/utils/faker'
import { fakeFormikContext, fakeArrayHelpers } from '../../../../../store/common/faker'
import { defaultShared } from '../../../constants'
import { CreateOrEditCreditLineSharedWithCompany } from './CreateOrEditCreditLineSharedWithCompany'
import { Products } from '../../../../document-management/constants/Products'
import { SubProducts } from '../../../../document-management/constants/SubProducts'
import { createInitialCreditLine } from '../../../utils/factories'
import { CreditLineType } from '../../../store/types'

describe('CreateOrEditCreditLineSharedWithCompany', () => {
  let defaultProps
  const initialRiskCoverValues = createInitialCreditLine(Products.TradeFinance, SubProducts.ReceivableDiscounting)

  beforeEach(() => {
    defaultProps = {
      counterparties: [fakeCounterparty({ staticId: '123123' })],
      isEdit: false,
      formik: fakeFormikContext(initialRiskCoverValues),
      requested: false,
      requests: [],
      feature: CreditLineType.RiskCover,
      members: []
    }
  })

  it('should render component successfully', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should return appropriate array of objects for seller dropdown options', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    expect(instance.getSellersDropodownValues(defaultProps.formik.values, 0)).toEqual([
      {
        content: 'Applicant Name',
        text: 'Applicant Name',
        value: '123123'
      }
    ])
  })

  it('should return empty array for seller dropdown options', () => {
    const values = {
      ...initialRiskCoverValues,
      sharedCreditLines: [{ ...defaultShared, sharedWithStaticId: '123123' }]
    }
    const formik = { ...defaultProps.formik, values }
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} formik={formik} />)

    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    expect(instance.getSellersDropodownValues(formik.values, 1)).toEqual([])
  })

  it('should return component wrapped with Popup', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany
    const component = <div>Component</div>
    const withPopup = instance.printCheckboxOrPopup(component, true, 'Text') as React.ReactElement

    expect(renderer.create(withPopup).toJSON()).toMatchSnapshot()
  })

  it('should return component without Popup', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany
    const component = <div>Component</div>
    const withPopup = instance.printCheckboxOrPopup(component, false, 'Text') as React.ReactElement

    expect(renderer.create(withPopup).toJSON()).toMatchSnapshot()
  })

  it('should return appropriate text - default appetite is yes', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    expect(instance.getTooltipContent()).toBe(
      'Appetite must be disclosed to the seller before you can disclose other buyer information'
    )
  })

  it('should return appropriate text - appetite is no', () => {
    const values = { ...initialRiskCoverValues, appetite: false }
    const formik = { ...defaultProps.formik, values }
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} formik={formik} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    expect(instance.getTooltipContent()).toBe('Buyer appetite must be set to "Yes" and disclosed to share information')
  })

  it('should set seller data in state when handleRemoveSeller is called', () => {
    const values = {
      ...initialRiskCoverValues,
      sharedCreditLines: [{ ...defaultShared, sharedWithStaticId: '123123' }]
    }
    const formik = { ...defaultProps.formik, values }
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} formik={formik} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany
    instance.handleRemoveSeller(0, {} as ArrayHelpers)

    expect(wrapper.state('removeSellerIndex')).toBe(0)
  })

  it('should restart seller data from state when handleCancelConfirmRemoveSeller is called', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany
    instance.handleCancelConfirmRemoveSeller()
    expect(wrapper.state('removeSellerIndex')).toBe(undefined)
  })

  it('should call remove from array helpers when handleConfirmRemoveSeller is called', () => {
    const values = {
      ...initialRiskCoverValues,
      sharedCreditLines: [{ ...defaultShared, sharedWithStaticId: '123123' }]
    }
    const formik = { ...defaultProps.formik, values }
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} formik={formik} />)
    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany
    const arrayHelpers = fakeArrayHelpers
    wrapper.setState({
      removeSellerIndex: 0,
      arrayHelpers
    })
    instance.handleConfirmRemoveSeller()

    expect(fakeArrayHelpers.remove).toHaveBeenCalled()
  })

  it('should create appropriate text object', () => {
    const wrapper = shallow(<CreateOrEditCreditLineSharedWithCompany {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    const expectedValue = {
      header: 'Visibility to sellers',
      paragraph:
        'Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.'
    }

    expect(instance.getTexts()).toEqual(expectedValue)
  })

  it('should create appropriate text object', () => {
    const wrapper = shallow(
      <CreateOrEditCreditLineSharedWithCompany {...defaultProps} feature={CreditLineType.BankLine} />
    )

    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    const expectedValue = {
      header: 'Visibility to beneficiaries',
      paragraph:
        'Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.'
    }

    expect(instance.getTexts()).toEqual(expectedValue)
  })

  it('should create appropriate text object', () => {
    const counterparty = fakeCounterparty({ staticId: '123123', commonName: 'Test 1' })
    const values = {
      ...initialRiskCoverValues,
      counterpartyStaticId: '111111'
    }
    const formik = { ...defaultProps.formik, values }
    const wrapper = shallow(
      <CreateOrEditCreditLineSharedWithCompany
        {...defaultProps}
        counterparty={[counterparty]}
        formik={formik}
        requested={true}
        members={[fakeMember({ staticId: '111111' })]}
      />
    )

    const instance = wrapper.instance() as CreateOrEditCreditLineSharedWithCompany

    const expectedValue = {
      header: 'Requests to disclose buyer information',
      paragraph:
        'The sellers below requested information on Applicant Name to be shared with them. Information shared with your counterparties on a bilateral basis. This information is displayed to counterparties as non-binding and does not represent or warrant any commitment on your part.'
    }

    expect(instance.getTexts()).toEqual(expectedValue)
  })
})
