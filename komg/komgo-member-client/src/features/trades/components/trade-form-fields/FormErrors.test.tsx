import * as React from 'react'
import { shallow, mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import FormErrors, { FormErrorsOwnProps } from './FormErrors'
import { MultiErrorMessage } from '../../../../components/error-message'
import { FormikContext, FormikProvider } from 'formik'
import { fakeFormikContext } from '../../../../store/common/faker'

describe('FormErrors component', () => {
  let defaultProps: FormErrorsOwnProps
  let formikContext: FormikContext<any>

  beforeEach(() => {
    defaultProps = {
      isParcelForm: false
    }
    formikContext = fakeFormikContext({})
  })
  it('should render component successfully', () => {
    const wrapper = shallow(
      <FormikProvider value={formikContext}>
        <FormErrors {...defaultProps} />
      </FormikProvider>
    )

    expect(wrapper.exists()).toBe(true)
  })

  it('should not find error component if there are not errors', () => {
    const wrapper = shallow(
      <FormikProvider value={formikContext}>
        <FormErrors {...defaultProps} />
      </FormikProvider>
    )

    const errorComponent = wrapper.find(MultiErrorMessage)

    expect(errorComponent.exists()).toBe(false)
  })

  it('should find error component if there are errors', () => {
    const formikContext = fakeFormikContext(
      {},
      { errors: { source: "field 'source' is required" }, touched: { source: true } }
    )
    const wrapper = mount(
      <FormikProvider value={formikContext}>
        <FormErrors {...defaultProps} />
      </FormikProvider>
    )

    const errorComponent = wrapper.find(MultiErrorMessage)

    expect(errorComponent.exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const formikContext = fakeFormikContext(
      {},
      { errors: { source: "field 'source' is required" }, touched: { source: true } }
    )

    expect(
      renderer
        .create(
          <FormikProvider value={formikContext}>
            <FormErrors {...defaultProps} />
          </FormikProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
