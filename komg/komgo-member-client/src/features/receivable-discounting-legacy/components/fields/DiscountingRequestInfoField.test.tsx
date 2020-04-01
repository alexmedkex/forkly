import React from 'react'
import { DiscountingRequestInfoField, IDiscountingRequestInfoFieldProps } from './DiscountingRequestInfoField'
import { render } from '@testing-library/react'
import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { fakeRdApplicationHistory } from '../../utils/faker'
import { shallow } from 'enzyme'
import { Popup } from 'semantic-ui-react'
import { HistoryModal } from '../tooltips/HistoryModal'
import { HistoryWrapper } from '../tooltips/HistoryWrapper'

describe('DiscountingRequestInfoField', () => {
  let testProps: IDiscountingRequestInfoFieldProps
  beforeEach(() => {
    testProps = {
      fieldName: 'invoiceAmount',
      value: 100000,
      rd: buildFakeReceivablesDiscountingExtended(),
      history: fakeRdApplicationHistory(),
      historyInModal: false
    }
  })

  it('renders correctly', () => {
    expect(render(<DiscountingRequestInfoField {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('renders the history if present', () => {
    const wrapper = shallow(<DiscountingRequestInfoField {...testProps} />)

    expect(
      wrapper
        .find(HistoryWrapper)
        .dive()
        .find(Popup)
        .exists()
    ).toBeTruthy()
  })

  it('renders the history as a modal if present', () => {
    const wrapper = shallow(<DiscountingRequestInfoField {...testProps} historyInModal={true} />)

    expect(
      wrapper
        .find(HistoryWrapper)
        .dive()
        .find(HistoryModal)
        .exists()
    ).toBeTruthy()
  })

  it('doesnt render the history when none present', () => {
    const wrapper = shallow(<DiscountingRequestInfoField {...testProps} history={undefined} />)

    expect(wrapper.find(Popup).exists()).toBeFalsy()
  })

  it('doesnt render the history when empty', () => {
    const wrapper = shallow(<DiscountingRequestInfoField {...testProps} history={{}} />)

    expect(wrapper.find(Popup).exists()).toBeFalsy()
  })
})
