import React from 'react'
import { render } from '@testing-library/react'
import { fakeAgreedTermsHistory } from '../../utils/faker'
import { shallow } from 'enzyme'
import { Popup } from 'semantic-ui-react'
import { IQuoteFieldProps, QuoteField } from './QuoteField'
import { HistoryModal } from '../tooltips/HistoryModal'
import { HistoryWrapper } from '../tooltips/HistoryWrapper'

describe('QuoteField', () => {
  let testProps: IQuoteFieldProps

  beforeEach(() => {
    testProps = {
      fieldName: 'advanceRate',
      label: 'Advance rate',
      value: 100000,
      history: fakeAgreedTermsHistory(),
      sectionName: 'agreedTerms'
    }
  })

  it('renders correctly', () => {
    expect(render(<QuoteField {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('renders the history if present', () => {
    const wrapper = shallow(<QuoteField {...testProps} />)

    expect(
      wrapper
        .find(HistoryWrapper)
        .dive()
        .find(Popup)
        .exists()
    ).toBeTruthy()
  })

  it('renders the history as a modal if present', () => {
    const wrapper = shallow(<QuoteField {...testProps} historyInModal={true} />)

    expect(
      wrapper
        .find(HistoryWrapper)
        .dive()
        .find(HistoryModal)
        .exists()
    ).toBeTruthy()
  })

  it('doesnt render the history when none present', () => {
    const wrapper = shallow(<QuoteField {...testProps} history={undefined} />)

    expect(wrapper.find(Popup).exists()).toBeFalsy()
  })

  it('doesnt render the history when empty', () => {
    const wrapper = shallow(<QuoteField {...testProps} history={{}} />)

    expect(wrapper.find(Popup).exists()).toBeFalsy()
  })
})
