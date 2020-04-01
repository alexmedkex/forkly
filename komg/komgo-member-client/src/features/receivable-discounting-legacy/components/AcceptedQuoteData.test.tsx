import AcceptedQuoteData, { IAcceptedQuoteData } from './AcceptedQuoteData'
import { buildFakeQuote, RequestType, DiscountingType, buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme'
import { Formik } from 'formik'
import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { ReceivableDiscountingViewPanels } from '../utils/constants'
import moment from 'moment'

describe('AcceptedQuoteData', () => {
  const requestType = RequestType.Discount
  const discountingType = DiscountingType.WithoutRecourse
  let testProps: IAcceptedQuoteData

  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'UTC')
    moment.tz.setDefault('UTC')
    Date.now = jest.fn(() => 1487076708000)

    testProps = {
      quote: buildFakeQuote({}, false, requestType, discountingType),
      index: ReceivableDiscountingViewPanels.AcceptedQuote,
      open: true,
      editable: true,
      isSubmitting: false,
      isEditing: false,
      changed: false,
      agreedTermsHistory: {},
      handleSubmit: jest.fn(),
      handleEditClicked: jest.fn(),
      handleCancelClicked: jest.fn(),
      handleToggleAccordion: jest.fn(),
      rd: buildFakeReceivablesDiscountingExtended(false, {
        requestType: RequestType.Discount,
        discountingType: DiscountingType.WithoutRecourse
      })
    }
  })

  it('renders correctly', () => {
    expect(renderer.create(<AcceptedQuoteData {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('should show an edit button if editable', () => {
    const component = mount(<AcceptedQuoteData {...testProps} />)

    expect(
      component
        .find('[data-test-id="edit-accepted-quote"]')
        .first()
        .exists()
    ).toBeTruthy()
  })

  it('should not show an edit button if not editable', () => {
    testProps.editable = false
    const component = mount(<AcceptedQuoteData {...testProps} />)

    expect(
      component
        .find('[data-test-id="edit-accepted-quote"]')
        .first()
        .exists()
    ).toBeFalsy()
  })

  describe('Edit', () => {
    let component: ReactWrapper
    beforeEach(() => {
      testProps.isEditing = true
      component = mount(<AcceptedQuoteData {...testProps} />)
    })

    it('should show an editable panel but not the info panel if editing', () => {
      testProps.isEditing = true

      component = mount(<AcceptedQuoteData {...testProps} />)

      expect(component.find('[data-test-id="edit-accepted-quote-panel"]').exists()).toBeTruthy()
    })

    it('should show info if not editing', () => {
      testProps.isEditing = false

      component = mount(<AcceptedQuoteData {...testProps} />)

      expect(component.find('[data-test-id="edit-accepted-quote-panel"]').exists()).toBeFalsy()
      expect(component.find('[data-test-id="agreedTerms-field-component-advanceRate"]').exists()).toBeTruthy()
    })

    it('should submit edits if a valid change is made', async done => {
      textInput(component, 'advanceRate', 50)

      component
        .find('[data-test-id="save-accepted-quote"]')
        .first()
        .simulate('click')

      setTimeout(() => {
        expect(testProps.handleSubmit).toHaveBeenCalled()
        done()
      }, 50)
    })

    it('should not submit edits if nothing is changed', async done => {
      component
        .find('[data-test-id="save-accepted-quote"]')
        .first()
        .simulate('click')

      setTimeout(() => {
        expect(testProps.handleSubmit).not.toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should not submit edits if an invalid change is made', async done => {
      textInput(component, 'advanceRate', -1)

      component
        .find('[data-test-id="save-accepted-quote"]')
        .first()
        .simulate('click')

      setTimeout(() => {
        expect(testProps.handleSubmit).not.toHaveBeenCalled()
        done()
      }, 0)
    })

    it('should show errors if error is present and editing', () => {
      const Children = component.find(Formik).prop('render') as any

      const childrenWrapper = shallow(<Children errors={{ advanceRate: 'invalid' }} touched={{ advanceRate: true }} />)

      const errors = childrenWrapper.find('[data-test-id="edit-quote-accepted-validation-errors"]')
      expect(errors.exists()).toBeTruthy()
      expect(errors.prop('messages')).toEqual(['invalid'])
    })
  })

  const textInput = (component: ShallowWrapper | ReactWrapper, name: string, value: string | number) => {
    const input = component.find(`input[name="${name}"]`).first()
    input.simulate('focus')
    input.simulate('change', { target: { value, name } })
    input.simulate('blur')
  }
})
