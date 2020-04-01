import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom'
import { TradeDashboard, IProps as TradeDashboardProps } from './TradeDashboard'
import { DESC, ASC, DESC_TEXT, TradingRole, ASC_TEXT } from '../constants'
import { ErrorMessage, Unauthorized } from '../../../components'
import * as renderer from 'react-test-renderer'
import { createMemoryHistory } from 'history'

import { ITradeEnriched } from '../store/types'
import { fakeTrade } from '../../letter-of-credit-legacy/utils/faker'
import { buildFakeError } from '../../../store/common/faker'
import { Provider } from 'react-redux'
import { makeTestStore } from '../../../utils/test-helpers'
import { TradeSource } from '@komgo/types'

const exampleCompany = '123'
const exampleTrades: ITradeEnriched[] = [
  {
    ...fakeTrade(),
    source: TradeSource.Vakt,
    status: 'OK',
    sourceId: '11',
    _id: 'a',
    buyerName: 'CN buyer 1',
    sellerName: 'CN seller 1',
    buyer: exampleCompany,
    buyerEtrmId: '1',
    sellerEtrmId: '5',
    seller: 'bphggggg'
  },
  {
    ...fakeTrade(),
    source: TradeSource.Komgo,
    status: 'LOST',
    sourceId: '22',
    _id: 'b',
    seller: exampleCompany,
    sellerEtrmId: '2',
    buyer: '321',
    buyerName: 'CN buyer texaco',
    sellerName: 'CN seller 123'
  },
  {
    ...fakeTrade(),
    source: TradeSource.Vakt,
    status: 'SHIPPED',
    sourceId: '22',
    _id: 'c',
    seller: exampleCompany,
    sellerEtrmId: '2',
    buyer: 'texaco',
    buyerName: 'CN buyer texaco',
    sellerName: 'CN seller 123'
  }
]

const testProps: TradeDashboardProps = {
  fetchTradesDashboardData: jest.fn(),
  fetchConnectedCounterpartiesAsync: jest.fn(),
  fetchLettersOfCredit: jest.fn(),
  fetchStandByLettersOfCredit: jest.fn(),
  fetchLettersOfCreditByType: jest.fn(),
  fetchRdsFromTrades: jest.fn(),
  isFetching: false,
  trades: [],
  errors: [],
  totals: { seller: 0, buyer: 0 },
  isAuthorized: () => true,
  sortBy: () => undefined,
  company: exampleCompany,
  filterTradingRole: jest.fn(),
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  match: {
    isExact: true,
    path: '',
    url: '',
    params: null
  },
  staticContext: undefined
}

describe('TradeDashboard', () => {
  beforeEach(() => {
    // Reset jest fn
    testProps.fetchTradesDashboardData = jest.fn()
    testProps.fetchConnectedCounterpartiesAsync = jest.fn()
    testProps.sortBy = jest.fn()
    testProps.isAuthorized = () => true
  })
  it('renders correctly', () => {
    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)

    expect(table).toBeDefined()
  })
  it('only displays trades for which the company is the buyer by default', () => {
    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    expect(table.find('[data-test-id="trades-table"]').prop('data').length).toBe(1)
  })
  it('displays trades for which the company is the buyer when buyer button clicked', () => {
    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    table.find(`#${TradingRole.BUYER}`).simulate('click')
    expect(table.find('[data-test-id="trades-table"]').prop('data').length).toBe(1)
  })
  it('updates the url to include the buyer button when the buyer button is clicked', () => {
    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    table.find(`#${TradingRole.BUYER}`).simulate('click')

    expect(testProps.history.location.search).toContain('tradingRole=buyer')
  })
  it('updates the url to include the seller button when the seller button is clicked', () => {
    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    table.find(`#${TradingRole.SELLER}`).simulate('click')

    expect(testProps.history.location.search).toContain('tradingRole=seller')
  })
  it('updates the url to include the query prefix when a button is clicked', () => {
    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    table.find(`#${TradingRole.BUYER}`).simulate('click')

    expect(testProps.history.location.search).toContain('?')
  })
  it('calls fetchTradesDashboardData after component is mounted', () => {
    shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    expect(testProps.fetchTradesDashboardData).toHaveBeenCalledTimes(2)
    expect(testProps.fetchTradesDashboardData).toHaveBeenLastCalledWith({
      filter: {
        options: { sort: { dealDate: DESC }, limit: 10000 },
        projection: { _id: 1 },
        query: { [TradingRole.SELLER]: testProps.company }
      }
    })
  })
  it('displays no table and an error if there is one given', () => {
    const table = shallow(<TradeDashboard {...testProps} errors={[buildFakeError({ message: 'oh no!' })]} />)
    const tree = table.find(ErrorMessage).html()
    expect(tree).toContain('Trade Dashboard Error')
    expect(tree).toContain('oh no!')
  })
  it('displays unauthorized component if user is not authorized to view tradetable', () => {
    testProps.isAuthorized = () => false

    const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} trades={exampleTrades} />)
    expect(table.find(Unauthorized)).toBeTruthy()
  })
  it('does not call API if user is not authorized to view tradetable', () => {
    testProps.isAuthorized = () => false
    shallow<TradeDashboard>(<TradeDashboard {...testProps} />)

    expect(testProps.fetchTradesDashboardData).not.toHaveBeenCalled()
  })
  it('sets trade view from query params if available', () => {
    const mockLocation = {
      pathname: '',
      search: `tradingRole=${TradingRole.SELLER}`,
      state: '',
      hash: ''
    }
    const dashboard = shallow<TradeDashboard>(<TradeDashboard {...testProps} location={mockLocation} />)

    expect(dashboard.state().tradingRole).toBe(TradingRole.SELLER)
  })
  it('sets column from query params if available', () => {
    const mockLocation = {
      pathname: '',
      search: 'column=buyerEtrmId',
      state: '',
      hash: ''
    }
    const dashboard = shallow<TradeDashboard>(<TradeDashboard {...testProps} location={mockLocation} />)

    expect(dashboard.state().column).toBe('buyerEtrmId')
  })
  it('sets sort direction from query params if available', () => {
    const mockLocation = {
      pathname: '',
      search: `direction=${DESC_TEXT}`,
      state: '',
      hash: ''
    }
    const dashboard = shallow<TradeDashboard>(<TradeDashboard {...testProps} location={mockLocation} />)

    expect(dashboard.state().direction).toBe(DESC_TEXT)
  })
  it('sets trade view, sort direction and column in one from query params if available', () => {
    const mockLocation = {
      pathname: '',
      search: `direction=${DESC_TEXT}&column=price&tradingRole=${TradingRole.SELLER}`,
      state: '',
      hash: ''
    }
    const dashboard = shallow<TradeDashboard>(<TradeDashboard {...testProps} location={mockLocation} />)

    expect(dashboard.state().direction).toBe(DESC_TEXT)
    expect(dashboard.state().column).toBe('price')
    expect(dashboard.state().tradingRole).toBe(TradingRole.SELLER)
  })
  it('reverts to defaults if parameters are nonsense and overwrites URL', () => {
    const mockLocation = {
      pathname: '',
      search: `direction=2342&column=asdfas&tradingRole=vfsfg`,
      state: '',
      hash: ''
    }
    const dashboard = shallow<TradeDashboard>(<TradeDashboard {...testProps} location={mockLocation} />)

    expect(dashboard.state().direction).toBe(DESC_TEXT)
    expect(dashboard.state().column).toBe('dealDate')
    expect(dashboard.state().tradingRole).toBe(TradingRole.BUYER)

    expect(testProps.history.location.search).toEqual(
      `?column=dealDate&tradingRole=${TradingRole.BUYER}&direction=${DESC_TEXT}`
    )
  })
  describe('sortBy()', () => {
    it('calls sortBy with buyerEtrmId when buyerEtrmId column header is clicked', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )
      table.find('div[data-test-id="buyerEtrmId"]').simulate('click')

      expect(testProps.sortBy).toHaveBeenCalledWith({ column: 'buyerEtrmId', direction: DESC })
    })
    it('calls sortBy with dealDate when dealDate column header is clicked', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )
      table.find('div[data-test-id="dealDate"]').simulate('click')

      expect(testProps.sortBy).toHaveBeenCalledWith({ column: 'dealDate', direction: ASC })
    })
    it('calls sortBy with the sellerEtrmId field when the seller button is selected when trade id header is clicked', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )
      table.find(`button[id="${TradingRole.SELLER}"]`).simulate('click')
      table.find('div[data-test-id="sellerEtrmId"]').simulate('click')

      expect(testProps.sortBy).toHaveBeenCalledWith({ column: 'sellerEtrmId', direction: DESC })
    })
    it('calls sortBy with the buyerEtrmId field when the buyer button is selected when trade id header is clicked', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )
      table.find(`button[id="${TradingRole.BUYER}"]`).simulate('click')
      table.find('div[data-test-id="buyerEtrmId"]').simulate('click')

      expect(testProps.sortBy).toHaveBeenCalledWith({ column: 'buyerEtrmId', direction: DESC })
    })
    it('calls sortBy with the opposite direction the second time a column header is clicked', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )
      table.find('div[data-test-id="buyerEtrmId"]').simulate('click')
      table.find('div[data-test-id="buyerEtrmId"]').simulate('click')

      expect(testProps.sortBy).toHaveBeenLastCalledWith({ column: 'buyerEtrmId', direction: ASC })
    })
    // Waiting to decide from where to read status
    it.skip('calls sortBy with the normal direction when a new column header is clicked', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find('#etrmId').simulate('click')
      table.find('#status').simulate('click')

      expect(testProps.sortBy).toHaveBeenLastCalledWith({ column: 'status', direction: ASC })
    })
    // Waiting to decide from where to read status
    it.skip('sets the chosen column and direction on the state', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find('#status').simulate('click')

      expect(table.state().column).toEqual('status')
      expect(table.state().direction).toEqual(ASC)
    })

    it('sets the chosen column and inverted direction on the state', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )
      table.find('div[data-test-id="deliveryTerms"]').simulate('click')
      table.find('div[data-test-id="deliveryTerms"]').simulate('click')

      const dashboard = table.find(TradeDashboard)

      expect(dashboard.state().column).toEqual('deliveryTerms')
      expect(dashboard.state().direction).toEqual(ASC_TEXT)
    })
  })
  describe('selected button', () => {
    beforeEach(() => {
      testProps.filterTradingRole = jest.fn()
    })
    it('has a default tradingRole of SELLER', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      expect(table.state().tradingRole).toEqual(TradingRole.BUYER)
    })
    it('sets tradingRole to SELLER if seller button clicked', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find(`#${TradingRole.SELLER}`).simulate('click')

      expect(table.state().tradingRole).toEqual(TradingRole.SELLER)
    })
    it('calls filterTradingRole with company name and seller if seller button clicked', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find(`#${TradingRole.SELLER}`).simulate('click')

      expect(testProps.filterTradingRole).toHaveBeenCalledWith({
        role: TradingRole.SELLER,
        company: testProps.company
      })
    })
    it('calls filterTradingRole with company name and buyer if buyer button clicked', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find(`#${TradingRole.BUYER}`).simulate('click')

      expect(testProps.filterTradingRole).toHaveBeenCalledWith({
        role: TradingRole.BUYER,
        company: testProps.company
      })
    })
    it('sets tradingRole back to BUYER if seller button clicked', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find(`#${TradingRole.SELLER}`).simulate('click')
      table.find(`#${TradingRole.BUYER}`).simulate('click')

      expect(table.state().tradingRole).toEqual(TradingRole.BUYER)
    })
    it('calls fetchTradesDashboardData with the filter of the PARTY.id', () => {
      const table = shallow<TradeDashboard>(<TradeDashboard {...testProps} />)
      table.find(`#${TradingRole.SELLER}`).simulate('click')

      expect(testProps.fetchTradesDashboardData).toHaveBeenLastCalledWith({
        filter: {
          options: { sort: { dealDate: DESC }, limit: 10000 },
          projection: {},
          query: { [TradingRole.SELLER]: testProps.company }
        }
      })
    })
    it('calls fetchTradesDashboardData with the sorting which was previously applied still applied', () => {
      const table = mount(
        <Router>
          <TradeDashboard {...testProps} />
        </Router>
      )

      table.find('div[data-test-id="deliveryTerms"]').simulate('click')
      table.find('div[data-test-id="deliveryTerms"]').simulate('click')
      table.find(`button[id="${TradingRole.SELLER}"]`).simulate('click')

      expect(testProps.fetchTradesDashboardData).toHaveBeenLastCalledWith({
        filter: {
          options: { sort: { deliveryTerms: ASC }, limit: 10000 },
          projection: {},
          query: { [TradingRole.SELLER]: testProps.company }
        }
      })
    })
  })
  it('matches the snapshot on golden path', () => {
    const tree = renderer
      .create(
        <Router>
          <Provider store={makeTestStore()}>
            <TradeDashboard {...testProps} trades={exampleTrades} />
          </Provider>
        </Router>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
