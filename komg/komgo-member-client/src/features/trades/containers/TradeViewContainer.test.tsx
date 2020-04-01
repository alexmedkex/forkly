import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { shallow, mount } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { Button, Dropdown } from 'semantic-ui-react'
import { ITradeEnriched } from '../store/types'
import { TradeViewContainer } from './TradeViewContainer'

import { IProps } from './TradeViewContainer'
import { Permission, tradeFinanceManager } from '@komgo/permissions'
import { fakeTrade, fakeLetterOfCredit } from '../../letter-of-credit-legacy/utils/faker'
import { TradeSource, buildFakeStandByLetterOfCredit, CreditRequirements } from '@komgo/types'
import { v4 } from 'uuid'
import { TRADE_STATUS, TradingRole } from '../constants'
import { render } from '@testing-library/react'

const buyer = 'BP-id'
const seller = 'ING-id'
const fetchTradesDashboardDataMock = jest.fn()
const fetchMovementsMock = jest.fn()
const fetchTradeWithDocumentsMock = jest.fn()
const props: IProps = {
  deleteTrade: jest.fn(),
  deleteTradeError: null,
  isDeleting: false,
  trade: fakeTrade({ _id: 'abc', sourceId: 'E1243', buyer, seller, buyerEtrmId: 'E1243' }),
  tradeMovements: [
    {
      _id: '5bc6ef51029a130236b47d95',
      source: TradeSource.Vakt,
      sourceId: '55555e55556',
      status: 'TO_BE_FINANCED',
      cargoId: '5555aaa5aax',
      parcels: [
        {
          _id: '12311',
          laycanPeriod: {
            startDate: new Date('2018-09-01T00:00:00.000Z'),
            endDate: new Date('2018-10-01T00:00:00.000Z')
          },
          id: 'jjjj',
          vesselIMO: 1,
          vesselName: 'Andrej',
          loadingPort: 'Banja luka',
          inspector: 'Kenan',
          deemedBLDate: new Date('2018-10-01T00:00:00.000Z'),
          quantity: 3
        }
      ],
      grade: 'graded',
      createdAt: '',
      updatedAt: ''
    }
  ],
  error: null,
  fetchTradesDashboardData: fetchTradesDashboardDataMock,
  fetchMovements: fetchMovementsMock,
  fetchTradeWithDocuments: fetchTradeWithDocumentsMock,
  history: createMemoryHistory(),
  location: {
    pathname: '',
    search: '',
    state: '',
    hash: ''
  },
  match: {
    isExact: false,
    path: '',
    url: '',
    params: { id: 'E1243' }
  },
  staticContext: undefined,
  isAuthorized: () => true,
  isLicenseEnabled: () => true,
  isLicenseEnabledForCompany: () => true,
  company: buyer,
  isFetching: false,
  isStatusFetching: false,
  uploadedDocuments: []
}

describe('TradeView', () => {
  describe('componentDidMount', () => {
    it('should fetch the trade', () => {
      const item = shallow(<TradeViewContainer {...props} />)

      item.instance().componentDidMount!()

      expect(fetchTradesDashboardDataMock).toHaveBeenCalledWith({
        filter: { query: { ['_id']: props.match.params.id } }
      })
    })
    it('should fetch the trade movements', () => {
      const item = shallow(<TradeViewContainer {...props} />)

      item.instance().componentDidMount!()

      expect(fetchMovementsMock).toHaveBeenCalledWith(props.match.params.id)
    })
  })
  describe('renders', () => {
    it('a trade', () => {
      const trade: ITradeEnriched = fakeTrade()

      expect(
        renderer
          .create(
            <Router>
              <TradeViewContainer {...props} trade={trade} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('a trade with missing data', () => {
      expect(
        renderer
          .create(
            <Router>
              <TradeViewContainer {...props} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('a 404', () => {
      const error = 'Trade 123 not Found'
      expect(
        renderer
          .create(
            <Router>
              <TradeViewContainer {...props} error={error} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('a 401', () => {
      const isAuthorized = () => false
      expect(
        renderer
          .create(
            <Router>
              <TradeViewContainer {...props} isAuthorized={isAuthorized} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })
  })

  describe('with a user without manageLcRequest permissions', () => {
    it('does nothing onClick', () => {
      const isAuthorized = (permission: Permission) => permission === tradeFinanceManager.canReadTrades

      const view = mount<TradeViewContainer>(<TradeViewContainer {...props} isAuthorized={isAuthorized} />)
      expect(
        view
          .find(Dropdown.Item)
          .at(0)
          .props().disabled
      ).toBeTruthy()
    })
  })

  describe('with a user with manageLcRequest permissions', () => {
    it('has the trade id in the redirected url', () => {
      const view = mount<TradeViewContainer>(<TradeViewContainer {...props} />)
      view
        .find(Dropdown.Item)
        .at(0)
        .simulate('click')
      expect(props.history.location.search).toContain('tradeId=abc')
    })
  })

  describe('should navigate to sblc if sblc exists', () => {
    const sblc: any = { staticId: 1 }
    const propsWithSBLC = { ...props, standbyLetterOfCredit: sblc }
    const view = mount<TradeViewContainer>(<TradeViewContainer {...propsWithSBLC} />)

    view
      .find(Button)
      .at(0)
      .simulate('click')
    expect(props.history.location.pathname).toContain(
      `/financial-instruments/standby-letters-of-credit/${sblc.staticId}`
    )
  })

  describe('should navigate to lc if lc exists', () => {
    const lc: any = { _id: 1 }
    const propsWithLC = { ...props, letterOfCredit: lc }
    const view = mount<TradeViewContainer>(<TradeViewContainer {...propsWithLC} />)

    view
      .find(Button)
      .at(0)
      .simulate('click')
    expect(props.history.location.pathname).toContain(`/financial-instruments/letters-of-credit/${lc._id}`)
  })

  describe('deleting trade', () => {
    it('calls the action with the right id when delete button and delete modal confirm are clicked', () => {
      const id = v4()
      const trade = fakeTrade({ source: TradeSource.Komgo, _id: id })
      const view = mount(
        <Router>
          <TradeViewContainer {...props} trade={trade} match={{ ...props.match, params: { id } }} />
        </Router>
      )

      view.find('button[data-test-id="delete-trade"]').simulate('click')
      view.find('button[data-test-id="confirm-delete-trade"]').simulate('click')

      expect(props.deleteTrade).toHaveBeenCalledWith(trade._id)
    })
    it('is not visible when trade is from vakt', () => {
      const view = mount(
        <Router>
          <TradeViewContainer {...props} />
        </Router>
      )

      expect(view.find('button[data-test-id="delete-trade"]').length).toEqual(0)
    })
    it('is not visible when a letter of credit is in a live state', () => {
      const trade = fakeTrade({ source: TradeSource.Komgo })

      const view = mount(
        <Router>
          <TradeViewContainer {...props} trade={trade} letterOfCredit={fakeLetterOfCredit()} />
        </Router>
      )

      expect(view.find('button[data-test-id="delete-trade"]').length).toEqual(0)
    })
    it('is not visible when an SBLC is in a live state', () => {
      const trade = fakeTrade({ source: TradeSource.Komgo })

      const view = mount(
        <Router>
          <TradeViewContainer {...props} trade={trade} standbyLetterOfCredit={buildFakeStandByLetterOfCredit()} />
        </Router>
      )

      expect(view.find('button[data-test-id="delete-trade"]').length).toEqual(0)
    })
    it('is visible when credit requirement is open credit and status is to be discounted', () => {
      const trade: ITradeEnriched = {
        ...fakeTrade({ source: TradeSource.Komgo, creditRequirement: CreditRequirements.OpenCredit }),
        status: TRADE_STATUS.ToBeDiscounted
      }

      const view = mount(
        <Router>
          <TradeViewContainer {...props} trade={trade} />
        </Router>
      )

      expect(view.find('button[data-test-id="delete-trade"]').length).toEqual(1)
    })
    it('is not visible when credit requirement is open credit and status is not to be discounted', () => {
      const trade: ITradeEnriched = {
        ...fakeTrade({
          source: TradeSource.Komgo,
          creditRequirement: CreditRequirements.OpenCredit,
          tradingRole: TradingRole.SELLER
        }),
        status: 'SOMETHING_ELSE'
      }

      const view = mount(
        <Router>
          <TradeViewContainer {...props} trade={trade} />
        </Router>
      )

      expect(view.find('button[data-test-id="delete-trade"]').length).toEqual(0)
    })
    it('is not visible when the hideDeleteButton url param is set to true', () => {
      const id = v4()

      const trade = fakeTrade({ source: TradeSource.Komgo, _id: id })

      const view = mount(
        <Router>
          <TradeViewContainer
            {...props}
            trade={trade}
            location={{ ...props.location, search: 'hideDeleteButton=true' }}
          />
        </Router>
      )

      expect(view.find('button[data-test-id="delete-trade"]').length).toEqual(0)
    })
  })
  it('hides the apply for financing button when hideApplyButtons url param is true', () => {
    const id = v4()

    const trade = fakeTrade({ source: TradeSource.Komgo, _id: id })

    const { queryByTestId } = render(
      <Router>
        <TradeViewContainer
          {...props}
          trade={trade}
          location={{ ...props.location, search: 'hideApplyButtons=true' }}
        />
      </Router>
    )

    expect(queryByTestId('apply-for-financing')).toBeNull()
  })
})
