import { shallow, mount, ReactWrapper, ShallowWrapper } from 'enzyme'
import * as React from 'react'
import { MinimalAccordionWrapper } from '../../../../components/accordion/MinimalAccordionWrapper'
import { TradeViewData } from '../../../trades/components'
import ReceivableDiscountingTradeView from './ReceivableDiscountingTradeView'
import { BrowserRouter as Router } from 'react-router-dom'
import { buildFakeTrade, TradeSource } from '@komgo/types'
import renderer from 'react-test-renderer'

describe('ReceivableDiscountingTradeView component', () => {
  let defaultProps
  let wrapper: ReactWrapper
  beforeEach(() => {
    defaultProps = {
      company: 'companyId',
      trade: { ...buildFakeTrade({ source: TradeSource.Komgo, sourceId: 'sourceId' }), requiredDocuments: [] },
      open: true,
      index: 'FakePanelIndex',
      changed: false,
      handleClick: jest.fn(),
      tradeMovements: ['movement1', 'movement2'],
      handleEditClicked: jest.fn()
    }
    jest.resetAllMocks()
    wrapper = mount(<ReceivableDiscountingTradeView {...defaultProps} />)
  })

  it('renders correctly', () => {
    expect(renderer.create(<ReceivableDiscountingTradeView {...defaultProps} />).toJSON()).toMatchSnapshot()
  })

  it('should find a MinimalAccordionWrapper', () => {
    const minimalAccordionWrapper = wrapper.find(MinimalAccordionWrapper)
    expect(minimalAccordionWrapper.prop('active')).toEqual(defaultProps.open)
    expect(minimalAccordionWrapper.prop('index')).toEqual(defaultProps.index)
    expect(minimalAccordionWrapper.prop('title')).toEqual('Trade summary')
  })

  it('should find TradeViewData', () => {
    const tradeViewData = wrapper.find(MinimalAccordionWrapper).find(TradeViewData)

    expect(tradeViewData.prop('company')).toEqual(defaultProps.company)
    expect(tradeViewData.prop('hideDropdownIcon')).toEqual(true)
    expect(tradeViewData.prop('trade')).toEqual(defaultProps.trade)
    expect(tradeViewData.prop('tradeMovements')).toEqual(defaultProps.tradeMovements)
  })

  it('should show an edit button if editable', () => {
    expect(
      wrapper
        .find('[data-test-id="edit-trade-request"]')
        .first()
        .exists()
    ).toBeTruthy()
  })

  it('should call handleEditClicked when clicked', done => {
    wrapper
      .find('[data-test-id="edit-trade-request"]')
      .first()
      .simulate('click')

    setTimeout(() => {
      expect(defaultProps.handleEditClicked).toHaveBeenCalled()
      done()
    }, 0)
  })

  it('should not show an edit button if not editable', () => {
    defaultProps.handleEditClicked = undefined
    const testSpecificMount = mount(
      <Router>
        <ReceivableDiscountingTradeView {...defaultProps} />
      </Router>
    )

    expect(
      testSpecificMount
        .find('[data-test-id="edit-trade-request"]')
        .first()
        .exists()
    ).toBeFalsy()
  })
})
