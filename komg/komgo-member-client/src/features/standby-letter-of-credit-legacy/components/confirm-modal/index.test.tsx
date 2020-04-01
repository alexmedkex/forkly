import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { ConfirmModalProps, Confirm } from './index'
import { fakeMember, fakeTrade } from '../../../letter-of-credit-legacy/utils/faker'
import { ServerError } from '../../../../store/common/types'
import { mount } from 'enzyme'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('Confirm', () => {
  let props: ConfirmModalProps

  beforeEach(() => {
    const trade = fakeTrade()
    const issuingBank = fakeMember({ isFinancialInstitution: true })
    props = {
      errors: [],
      isSubmitting: false,
      open: true,
      onCancel: jest.fn(),
      onSubmit: jest.fn(),
      title: 'Submit SBLC Application',
      children: (
        <p>
          You are about to submit an SBLC application for the financing of trade {trade.buyerEtrmId} to{' '}
          {issuingBank.x500Name.CN}
        </p>
      )
    }
  })

  describe('render', () => {
    it('shows the UI', () => {
      expect(renderer.create(<Confirm {...props} />).toJSON()).toMatchSnapshot()
    })

    it('shows is submitting', () => {
      expect(renderer.create(<Confirm {...props} isSubmitting={true} />).toJSON()).toMatchSnapshot()
    })

    it('shows an error', () => {
      const error: ServerError = {
        message: 'Error',
        errorCode: 'E001',
        requestId: '5d9a7aaf-f55a-431c-9d26-8204d9ecdbe9',
        origin: 'trade-finance',
        fields: {}
      }
      expect(renderer.create(<Confirm {...props} errors={[error]} />).toJSON()).toMatchSnapshot()
    })
    describe('submit button', () => {
      it('has the form set to formId if formId provided', () => {
        expect(renderer.create(<Confirm {...props} formId={'myForm'} />).toJSON()).toMatchSnapshot()
      })
    })
  })

  describe('onSubmit', () => {
    it('calls the hanlder if defined', () => {
      const wrapper = mount(<Confirm {...props} />)
      const button = wrapper.find('button[data-test-id="submit-confirm-button"]').first()
      button.simulate('click')
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })

  describe('onCancel', () => {
    it('calls the hanlder', () => {
      const wrapper = mount(<Confirm {...props} />)
      const button = wrapper.find('button[data-test-id="submit-cancel-button"]').first()
      button.simulate('click')
      expect(props.onCancel).toHaveBeenCalled()
    })
  })
})
