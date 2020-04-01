import { buildFakeReceivablesDiscountingInfo, RequestType } from '@komgo/types'
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme'
import { Formik } from 'formik'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { ReceivableDiscountingViewPanels, rdQuoteSchema, rdDiscountingSchema } from '../utils/constants'
import { DiscountingRequestData, IDiscountingRequestDataProps } from './DiscountingRequestData'
import { FieldDataContext, FieldDataProvider } from '../presentation/FieldDataProvider'

describe('DiscountingRequestData', () => {
  let testProps: IDiscountingRequestDataProps

  beforeEach(() => {
    testProps = {
      discountingRequest: buildFakeReceivablesDiscountingInfo(),
      index: ReceivableDiscountingViewPanels.ReceivableDiscountingData,
      open: true,
      editable: true,
      isSubmitting: false,
      isEditing: false,
      changed: false,
      handleSubmit: jest.fn(),
      handleEditClicked: jest.fn(),
      handleCancelClicked: jest.fn(),
      handleToggleAccordion: jest.fn(),
      history: {},
      isLoadingHistory: false
    }
  })

  it('renders correctly for Discounting', () => {
    expect(renderer.create(wrapFieldDataContext(<DiscountingRequestData {...testProps} />)).toJSON()).toMatchSnapshot()
  })

  it('renders correctly for Risk Cover', () => {
    const props = { ...testProps }
    props.discountingRequest.rd.requestType = RequestType.RiskCover
    props.discountingRequest.rd.discountingType = undefined
    expect(renderer.create(wrapFieldDataContext(<DiscountingRequestData {...props} />)).toJSON()).toMatchSnapshot()
  })

  it('renders correctly for Risk Cover with discounting option', () => {
    const props = { ...testProps }
    props.discountingRequest.rd.requestType = RequestType.RiskCoverDiscounting
    props.discountingRequest.rd.discountingType = undefined
    expect(renderer.create(wrapFieldDataContext(<DiscountingRequestData {...props} />)).toJSON()).toMatchSnapshot()
  })

  it('should show an edit button if editable', () => {
    const component = mount(wrapFieldDataContext(<DiscountingRequestData {...testProps} />))

    expect(
      component
        .find('[data-test-id="edit-discounting-request"]')
        .first()
        .exists()
    ).toBeTruthy()
  })

  it('should not show an edit button if not editable', () => {
    testProps.editable = false
    const component = mount(wrapFieldDataContext(<DiscountingRequestData {...testProps} />))

    expect(
      component
        .find('[data-test-id="edit-discounting-request"]')
        .first()
        .exists()
    ).toBeFalsy()
  })

  describe('Edit', () => {
    let component: ReactWrapper
    beforeEach(() => {
      testProps.isEditing = true
      component = mount(wrapFieldDataContext(<DiscountingRequestData {...testProps} />))
    })

    it('should show an editable panel but not the info panel if editing', () => {
      testProps.isEditing = true

      component = mount(wrapFieldDataContext(<DiscountingRequestData {...testProps} />))

      expect(component.find('[data-test-id="edit-discounting-request-panel"]').exists()).toBeTruthy()
      expect(component.find('[data-test-id="view-discounting-request-panel"]').exists()).toBeFalsy()
    })

    it('should show info if not editing', () => {
      testProps.isEditing = false

      component = mount(wrapFieldDataContext(<DiscountingRequestData {...testProps} />))

      expect(component.find('[data-test-id="edit-discounting-request-panel"]').exists()).toBeFalsy()
      expect(component.find('[data-test-id="view-discounting-request-panel"]').exists()).toBeTruthy()
    })

    it('should submit edits if a valid change is made', async done => {
      textInput(component, 'invoiceAmount', 17000)

      component
        .find('[data-test-id="save-discounting-request"]')
        .first()
        .simulate('click')

      setTimeout(() => {
        expect(testProps.handleSubmit).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should not submit edits if nothing is changed', async done => {
      component
        .find('[data-test-id="save-discounting-request"]')
        .first()
        .simulate('click')

      setTimeout(() => {
        expect(testProps.handleSubmit).not.toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should not submit edits if an invalid change is made', async done => {
      textInput(component, 'invoiceAmount', -1)

      component
        .find('[data-test-id="save-discounting-request"]')
        .first()
        .simulate('click')

      setTimeout(() => {
        expect(testProps.handleSubmit).not.toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should show errors if error is present and editing', () => {
      const Children = component.find(Formik).prop('render') as any

      const childrenWrapper = shallow(
        <Children errors={{ invoiceAmount: 'invalid' }} touched={{ invoiceAmount: true }} />
      )

      const errors = childrenWrapper.find('[data-test-id="edit-request-validation-errors"]')
      expect(errors.exists()).toBeTruthy()
      expect(errors.prop('messages')).toEqual(['invalid'])
    })
  })

  function wrapFieldDataContext(component: any) {
    return (
      <FieldDataContext.Provider value={new FieldDataProvider(rdDiscountingSchema)}>
        {component}
      </FieldDataContext.Provider>
    )
  }

  const textInput = (component: ShallowWrapper | ReactWrapper, name: string, value: string | number) => {
    const input = component.find(`input[name="${name}"]`).first()
    input.simulate('focus')
    input.simulate('change', { target: { value, name } })
    input.simulate('blur')
  }
})
