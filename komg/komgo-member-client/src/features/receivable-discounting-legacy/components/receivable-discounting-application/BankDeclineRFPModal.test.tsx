import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import BankDeclineRFPModal, { BankDeclineRFPModalOwnProps } from './BankDeclineRFPModal'
import { initialBankDeclineRFPData } from '../../utils/constants'
import { IBankDeclineRFPFormDetails } from '../../store/types'
import { FormikProvider } from 'formik'
import { Button } from 'semantic-ui-react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { buildFakeReceivablesDiscountingInfo } from '@komgo/types'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('<ReceivableDiscountingDeclineRequestModal />', () => {
  let wrapper
  let props: BankDeclineRFPModalOwnProps

  const formikContext = fakeFormikContext<IBankDeclineRFPFormDetails>(initialBankDeclineRFPData)

  beforeEach(() => {
    props = {
      visible: false,
      tradeId: 'sadfsdf',
      discountingRequest: buildFakeReceivablesDiscountingInfo(),
      sellerName: null,
      buyerName: null,
      rdId: 'An-RDID',
      rdError: null,
      bankDeclineRFPLoader: false,
      toggleVisible: jest.fn(),
      bankDeclineRFP: jest.fn()
    }

    wrapper = mount(
      <FormikProvider value={formikContext}>
        <BankDeclineRFPModal {...props} />
      </FormikProvider>
    )
  })

  it('should render as expected', () => {
    const jsonWrapper = renderer.create(<BankDeclineRFPModal {...props} />).toJSON()
    expect(jsonWrapper).toMatchSnapshot()
  })

  it('should toggle the modal when we click the cancel button', () => {
    expect(props.toggleVisible).toHaveBeenCalledTimes(0)

    wrapper
      .find({ 'data-test-id': 'bank-decline-rfp-cancel-btn' })
      .find(Button)
      .simulate('click')

    expect(props.toggleVisible).toHaveBeenCalledTimes(1)
  })
})
