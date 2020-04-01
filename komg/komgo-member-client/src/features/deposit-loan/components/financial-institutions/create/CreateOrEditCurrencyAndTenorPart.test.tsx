import * as React from 'react'
import { shallow } from 'enzyme'
import { Form } from 'semantic-ui-react'
import { buildFakeDepositLoanResponse } from '@komgo/types'
import _ from 'lodash'

import { CreateOrEditCurrencyAndTenorPart } from './CreateOrEditCurrencyAndTenorPart'
import { fakeFormikContext } from '../../../../../store/common/faker'
import { createInitialDepositLoan, createDefaultCurrencyAndPeriodDropdownOptions } from '../../../utils/factories'
import { CreditAppetiteDepositLoanFeature } from '../../../store/types'
import EditTimeWrapper from '../../../../credit-line/components/credit-appetite-shared-components/EditTimeWrapper'
import { _deepClone } from 'fast-json-patch/lib/helpers'

describe('CreateOrEditCurrencyAndTenorPart', () => {
  let defaultProps
  const initialData = createInitialDepositLoan(CreditAppetiteDepositLoanFeature.Deposit)
  const currencyAndTenorAllOptions = createDefaultCurrencyAndPeriodDropdownOptions()
  const fakeFormik = { ...fakeFormikContext(initialData), setFieldValue: jest.fn() }

  beforeEach(() => {
    defaultProps = {
      formik: fakeFormik,
      currencyAndTenorOptions: currencyAndTenorAllOptions
    }
  })

  it('should render compoenent succussfully', () => {
    const wrapper = shallow(<CreateOrEditCurrencyAndTenorPart {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should not find currency-and-tenor-readonly when is not edit mode', () => {
    const wrapper = shallow(<CreateOrEditCurrencyAndTenorPart {...defaultProps} />)

    const currencyAndTenor = wrapper.find("[data-test-id='currency-and-tenor-readonly']")

    expect(currencyAndTenor.length).toBe(0)
  })

  it('should find currency-and-tenor-readonly when is not edit mode', () => {
    const formikWithValues = { ...fakeFormik, values: buildFakeDepositLoanResponse() }
    const wrapper = shallow(<CreateOrEditCurrencyAndTenorPart {...defaultProps} formik={formikWithValues} />)

    const currencyAndTenor = wrapper.find("[data-test-id='currency-and-tenor-readonly']")

    expect(currencyAndTenor.length).toBe(1)
  })

  it('should find 3 FieldDisplay which are wrappers around form inputs', () => {
    const wrapper = shallow(<CreateOrEditCurrencyAndTenorPart {...defaultProps} />)

    const fieldWrappers = wrapper.find('FieldDisplay')

    expect(fieldWrappers.length).toBe(3)
  })

  it('should find EditTimeWrapper component when pricingUpdatedAt exists', () => {
    const formikWithValues = { ...fakeFormik, values: buildFakeDepositLoanResponse() }
    const wrapper = shallow(<CreateOrEditCurrencyAndTenorPart {...defaultProps} formik={formikWithValues} />)

    const fieldWrappers = wrapper.find(Form.Field).find(EditTimeWrapper)

    expect(fieldWrappers.length).toBe(1)
  })

  it('should call formik setFieldValue for currency, period and periodDuration when handleCurrencyAndTenorChanged is called', () => {
    const wrapper = shallow(<CreateOrEditCurrencyAndTenorPart {...defaultProps} />)

    const instance = wrapper.instance() as CreateOrEditCurrencyAndTenorPart

    instance.handleCurrencyAndTenorChanged(null, { name: 'currencyAndTenor', value: 'EUR/MONTHS/3' })

    expect(defaultProps.formik.setFieldValue).toHaveBeenCalledTimes(4)
    expect(defaultProps.formik.setFieldValue).toHaveBeenNthCalledWith(1, 'currency', 'EUR')
    expect(defaultProps.formik.setFieldValue).toHaveBeenNthCalledWith(2, 'period', 'MONTHS')
    expect(defaultProps.formik.setFieldValue).toHaveBeenNthCalledWith(3, 'periodDuration', 3)
  })
})
