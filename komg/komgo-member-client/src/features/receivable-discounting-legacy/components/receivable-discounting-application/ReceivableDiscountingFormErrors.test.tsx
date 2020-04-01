import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { MultiErrorMessage } from '../../../../components/error-message'
import ReceivableDiscountingFormErrors from './ReceivableDiscountingFormErrors'
import { fakeFormik } from '../../utils/faker'

describe('FormErrors component', () => {
  let defaultProps
  beforeEach(() => {
    defaultProps = {
      formik: fakeFormik
    }
  })

  it('should not find error component if there are not errors', () => {
    const wrapper = shallow(<ReceivableDiscountingFormErrors {...defaultProps} />)

    const errorComponent = wrapper.find(MultiErrorMessage)

    expect(errorComponent.exists()).toBe(false)
  })

  it('should find error component if there are errors', () => {
    const formik = {
      ...defaultProps.formik,
      errors: { source: "field 'source' is required" },
      touched: { source: true }
    }
    const wrapper = shallow(<ReceivableDiscountingFormErrors {...defaultProps} formik={formik} />)

    const errorComponent = wrapper.find(MultiErrorMessage)

    expect(errorComponent.exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const formik = {
      ...defaultProps.formik,
      errors: { source: "field 'source' is required" },
      touched: { source: true }
    }
    const tree = renderer.create(<ReceivableDiscountingFormErrors {...defaultProps} formik={formik} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
