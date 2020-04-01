jest.mock('../utils/tradeActionUtils', () => {
  const utils = jest.requireActual('../utils/tradeActionUtils')
  return {
    ...utils,
    getTradeActionsForFinancialInstruments: jest.fn().mockReturnValue([])
  }
})

import * as React from 'react'
import { TradeViewContentBarProps, TradeViewContentBar } from './TradeViewContentBar'
import { fakeTrade } from '../../letter-of-credit-legacy/utils/faker'
import { shallow } from 'enzyme'
import { Button } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import {
  TradeSource,
  buildFakeReceivablesDiscountingInfo,
  RDStatus,
  CreditRequirements,
  buildFakeTrade
} from '@komgo/types'
import { TradingRole, TRADE_STATUS } from '../constants'
import { TradeAction } from '../utils/tradeActionUtils'
import renderer from 'react-test-renderer'

import { getTradeActionsForFinancialInstruments } from '../utils/tradeActionUtils'
import { render } from '@testing-library/react'
import { MemoryRouter as Router } from 'react-router-dom'

const exampleTrade = fakeTrade()
const props: TradeViewContentBarProps = {
  trade: exampleTrade,
  rdInfo: buildFakeReceivablesDiscountingInfo(),
  isLicenseEnabledForCompany: () => true,
  role: TradingRole.BUYER,
  isStatusFetching: false,
  onButtonClick: () => null,
  isAuthorized: () => true,
  isLicenseEnabled: () => true,
  onDelete: () => null
}

const financialInstrumentsActionTest = (action: TradeAction, text: string, enabled: boolean) => {
  it(`should display proper button for ${text}, enabled: ${enabled}`, () => {
    ;(getTradeActionsForFinancialInstruments as jest.Mock).mockReturnValueOnce([action])

    const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} isAuthorized={() => enabled} />)
    const lcButton = content.find(Button)

    expect(lcButton.length).toBe(1)
    expect(lcButton.props().disabled).toBe(!enabled)
    expect(lcButton.dive().text()).toEqual(text)

    expect(getTradeActionsForFinancialInstruments).toHaveBeenCalledWith(
      props.trade,
      TradingRole.BUYER,
      props.legacyLetterOfCredit,
      props.standbyLetterOfCredit,
      props.letterOfCredit
    )
  })
}

describe('TradeViewContentBar', () => {
  describe('should render proper LC buttons', () => {
    it("shoudn't display buttons if no actions", () => {
      ;(getTradeActionsForFinancialInstruments as jest.Mock).mockReturnValueOnce([])

      const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)
      expect(content.find(Button).length).toBe(0)
    })

    // added combinations for buttons
    financialInstrumentsActionTest(TradeAction.ApplyForLC, 'Apply for LC', true)
    financialInstrumentsActionTest(TradeAction.ApplyForLC, 'Apply for LC', false)

    financialInstrumentsActionTest(TradeAction.ApplyForSBLC, 'Apply for SBLC', true)
    financialInstrumentsActionTest(TradeAction.ApplyForSBLC, 'Apply for SBLC', false)
    financialInstrumentsActionTest(TradeAction.ViewSBLC, 'View SBLC', true)
    financialInstrumentsActionTest(TradeAction.ViewSBLC, 'View SBLC', false)

    it('should match snapshot', () => {
      ;(getTradeActionsForFinancialInstruments as jest.Mock).mockReturnValueOnce(Object.values(TradeAction))

      expect(renderer.create(<TradeViewContentBar {...props} />).toJSON()).toMatchSnapshot()
    })
  })

  it('should hide delete button if hideDeleteButton is true', () => {
    const { queryByTestId } = render(
      <Router>
        <TradeViewContentBar
          {...props}
          rdInfo={undefined}
          trade={buildFakeTrade({ version: 2 })}
          hideDeleteButton={true}
        />
      </Router>
    )

    expect(queryByTestId('delete-trade')).toBeNull()
  })

  it('should hide apply for financing button if hideApplyButtons is true', () => {
    ;(getTradeActionsForFinancialInstruments as jest.Mock).mockReturnValueOnce([
      TradeAction.ApplyForLC,
      TradeAction.ApplyForSBLC
    ])

    const { queryByTestId } = render(
      <Router>
        <TradeViewContentBar
          {...props}
          rdInfo={undefined}
          trade={buildFakeTrade({ version: 2 })}
          hideApplyButtons={true}
        />
      </Router>
    )

    expect(queryByTestId('apply-for-financing')).toBeNull()
  })

  describe('when we are not the applicant for a trade', () => {
    it('does display the apply for discounting button', () => {
      const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} role={TradingRole.SELLER} />)

      expect(
        content
          .find(Button)
          .first()
          .prop('children')
      ).toEqual('Apply for risk cover / discounting')
    })
  })

  describe('user can edit trade', () => {
    it('should not find link for edit trade if source is VAKT', () => {
      const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)
      const link = content.find(Link)

      expect(link.exists()).toBe(false)
    })

    it('should not find link for edit trade if source is KOMGO but user is not authorized', () => {
      const komgoTrade = { ...exampleTrade, source: TradeSource.Komgo }
      const isAuthorized = () => false
      const content = shallow<TradeViewContentBarProps>(
        <TradeViewContentBar {...props} trade={komgoTrade} isAuthorized={isAuthorized} />
      )
      const link = content.find(Link)

      expect(link.exists()).toBe(false)
    })

    it('should find link for edit trade if source is KOMGO and user is authorized', () => {
      const komgoTrade = { ...exampleTrade, source: TradeSource.Komgo }
      const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} trade={komgoTrade} />)

      const link = content.find(Link)

      expect(link.exists()).toBe(true)
    })

    describe('Non-Vakt and Seller Trades', () => {
      beforeEach(() => {
        props.trade = { ...props.trade, source: TradeSource.Komgo }
        props.trade.creditRequirement = CreditRequirements.OpenCredit
        props.trade.tradingRole = TradingRole.SELLER
      })

      it('should find link for edit trade if source is KOMGO and user is authorized and RD Status is QuoteAccepted', () => {
        props.rdInfo.status = RDStatus.QuoteAccepted
        const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)

        const link = content.find(Link)

        expect(link.exists()).toBeTruthy()
      })

      it('should find link for edit trade if source is KOMGO and user is authorized and RD Status is PendingRequest', () => {
        props.rdInfo.status = RDStatus.PendingRequest
        const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)

        const link = content.find(Link)

        expect(link.exists()).toBeTruthy()
      })

      it('should NOT find link for edit trade if source is KOMGO and user is authorized and RD Status is Requested', () => {
        props.rdInfo.status = RDStatus.Requested
        const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)

        const link = content.find(Link)

        expect(link.exists()).toBeFalsy()
      })

      it('should NOT find link for edit trade if source is KOMGO and user is authorized and RD Status is QuoteSubmitted', () => {
        props.rdInfo.status = RDStatus.QuoteSubmitted
        const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)

        const link = content.find(Link)

        expect(link.exists()).toBeFalsy()
      })

      it('should find link for edit trade if no RDInfo and TradeStatus is ToBeDiscounted', () => {
        props.rdInfo = undefined
        props.trade = { ...props.trade, status: TRADE_STATUS.ToBeDiscounted }
        const content = shallow<TradeViewContentBarProps>(<TradeViewContentBar {...props} />)

        const link = content.find(Link)

        expect(link.exists()).toBeTruthy()
      })
    })
  })
})
