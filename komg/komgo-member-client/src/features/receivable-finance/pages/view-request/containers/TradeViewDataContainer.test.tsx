import React from 'react'

import { render, RenderResult, configure, fireEvent } from '@testing-library/react'
import { TradeViewDataContainer, ITradeViewDataContainerProps } from './TradeViewDataContainer'
import { RDStatus, CreditRequirements, TradeSource } from '@komgo/types'
import { ReceivablesDiscountingRole, ReturnContext } from '../../../../receivable-discounting-legacy/utils/constants'
import { fakeTradeSeller } from '../../../../letter-of-credit-legacy/utils/faker'
import { fakeRouteComponentProps, fakeRdInfo } from '../../../../receivable-discounting-legacy/utils/faker'
import { Provider } from 'react-redux'
import { store } from '../../../../../store'

describe('TradeViewDataContainer', () => {
  let props: ITradeViewDataContainerProps
  beforeEach(() => {
    props = {
      discountingRequest: fakeRdInfo({ status: RDStatus.Requested }),
      role: ReceivablesDiscountingRole.Bank,
      companyStaticId: 'test-company-static-id',
      trade: {
        ...fakeTradeSeller({ source: TradeSource.Komgo }),
        sellerName: 'seller',
        buyerName: 'buyer'
      },
      ...fakeRouteComponentProps(),
      fetchHistoryForTrade: jest.fn()
    }
  })
  it('should render correctly', () => {
    expect(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should expand for trader if status is requested', () => {
    props.discountingRequest.status = RDStatus.Requested
    props.role = ReceivablesDiscountingRole.Trader

    expectAccordionIsActive(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      )
    )
  })

  it('should expand for bank if status is requested', () => {
    props.discountingRequest.status = RDStatus.Requested
    props.role = ReceivablesDiscountingRole.Bank

    expectAccordionIsActive(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      )
    )
  })

  it('should not expand for bank if status is quote submitted', () => {
    props.discountingRequest.status = RDStatus.QuoteSubmitted
    props.role = ReceivablesDiscountingRole.Bank

    expectAccordionIsNotActive(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      )
    )
  })

  it('should expand for trader if status is quote submitted', () => {
    props.discountingRequest.status = RDStatus.QuoteSubmitted
    props.role = ReceivablesDiscountingRole.Trader

    expectAccordionIsActive(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      )
    )
  })

  it('should not expand for trader if status is quote accepted', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Trader

    expectAccordionIsNotActive(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      )
    )
  })

  it('should not expand for bank if status is quote accepted', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Bank

    expectAccordionIsNotActive(
      render(
        <Provider store={store}>
          <TradeViewDataContainer {...props} />
        </Provider>
      )
    )
  })

  it('should toggle accordion when closed', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Bank

    const { queryAllByTestId, asFragment } = render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    )
    const firstRender = asFragment()

    const [edit] = queryAllByTestId('trade-summary-accordion-title')
    fireEvent.click(edit)

    expect(firstRender).toMatchDiffSnapshot(asFragment())
  })

  it('should navigate to the trade edit page when edit button is clicked', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Trader
    props.trade.creditRequirement = CreditRequirements.OpenCredit
    ;(props.trade as any)._id = 'test-123'

    const { queryAllByTestId } = render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    )

    const [edit] = queryAllByTestId('edit-trade-request')
    fireEvent.click(edit)

    expect(props.history.push).toHaveBeenCalledWith({
      pathname: '/trades/test-123/edit',
      search: `?returnContext=${ReturnContext.RDViewRequest}&returnId=${props.discountingRequest.rd.staticId}`
    })
  })

  it('should not be editable for a bank', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Bank
    props.trade.creditRequirement = CreditRequirements.OpenCredit
    ;(props.trade as any)._id = 'test-123'

    const { queryAllByTestId } = render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    )

    expect(queryAllByTestId('edit-trade-request')).toHaveLength(0)
  })

  it('should highlight the accordion when the trade is changed', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Bank

    const before = render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    ).asFragment()

    props.discountingRequest.tradeSnapshot.createdAt = new Date(
      Date.parse(props.discountingRequest.tradeSnapshot.createdAt) + 100000
    ).toString()

    const after = render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    ).asFragment()

    expect(before).toMatchDiffSnapshot(after)
  })

  it('should not fetch history if quote not accepted', () => {
    props.discountingRequest.status = RDStatus.Requested
    props.role = ReceivablesDiscountingRole.Trader

    render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    )
    expect(props.fetchHistoryForTrade).not.toBeCalled()
  })

  it('should fetch history if quote is accepted', () => {
    props.discountingRequest.status = RDStatus.QuoteAccepted
    props.role = ReceivablesDiscountingRole.Trader

    render(
      <Provider store={store}>
        <TradeViewDataContainer {...props} />
      </Provider>
    )
    expect(props.fetchHistoryForTrade).toBeCalled()
  })

  function expectAccordionIsActive({ queryAllByTestId }: RenderResult) {
    const [node] = queryAllByTestId('trade-summary-accordion-content')
    expect(node).toHaveClass('active')
  }

  function expectAccordionIsNotActive({ queryAllByTestId }: RenderResult) {
    const [node] = queryAllByTestId('trade-summary-accordion-content')
    expect(node).not.toHaveClass('active')
  }
})
