import * as React from 'react'
import Helmet from 'react-helmet'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import { Button, Image, Loader } from 'semantic-ui-react'
import { Table, Column } from '@komgo/ui-components'
import { stringify } from 'qs'
import { TableSortParams, TableFilterParams, ITradeEnriched, TradeActionType } from '../store/types'
import { ApplicationState } from '../../../store/reducers'
import { fetchTradesDashboardData, sortBy, filterTradingRole, fetchRdsFromTrades } from '../store/actions'
import { fetchConnectedCounterpartiesAsync } from '../../counterparties/store/actions'
import { fetchLettersOfCredit } from '../../letter-of-credit-legacy/store/actions'
import { ASC, DESC, ASC_TEXT, DESC_TEXT, TradingRole } from '../constants'
import {
  addBuyerSellerEnrichedData,
  selectVisibleTrades,
  displayCommodity,
  displayEtrmId,
  displayQuantity,
  displayPrice,
  displayTradeStatus
} from '../utils/displaySelectors'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  ErrorMessage,
  LoadingTransition
} from '../../../components'
import { tradeFinanceManager } from '@komgo/permissions'
import { Fragment } from 'react'
import styled from 'styled-components'
import { loadingSelector } from '../../../store/common/selectors'
import { PollingService } from '../../../utils/PollingService'
import { LetterOfCreditActionType as LegacyLetterOfCreditActionType } from '../../letter-of-credit-legacy/store/types'
import { MemberActionType } from '../../members/store/types'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { StandbyLetterOfCreditActionType } from '../../standby-letter-of-credit-legacy/store/types'
import { fetchStandByLettersOfCredit } from '../../standby-letter-of-credit-legacy/store/actions'
import { fetchLettersOfCreditByType } from '../../letter-of-credit/store/actions'
import { getTradingRole } from '../utils/tradeActionUtils'
import ExtraOptionsMenuFactory from '../../trades/components/ExtraOptionsMenu'
import { displayDate } from '../../../utils/date'
import { findTradesByRole } from '../utils/findTradesByRole'
import { ReceivableDiscountingApplicationActionType } from '../../receivable-discounting-legacy/store/application/types'
import { ITrade } from '@komgo/types'
import { LetterOfCreditActionType } from '../../letter-of-credit/store/types'
import { getCurrentCompanyStaticId } from '../../../store/common/selectors/state-selectors'

interface TradeDashboardProps {
  trades: ITradeEnriched[]
  company: string
  totals: { seller: number; buyer: number }
}

interface TradeDashboardActions {
  fetchLettersOfCredit: (params?: {}) => any
  fetchStandByLettersOfCredit: (params?: {}) => any
  fetchLettersOfCreditByType: (params?: {}) => any
  fetchRdsFromTrades: (trades: ITrade[], polling: boolean) => any
  fetchTradesDashboardData: (params?: {}) => any
  fetchConnectedCounterpartiesAsync: (params?: {}) => any
  sortBy: (params: TableSortParams) => any
  filterTradingRole: (params: TableFilterParams) => any
}

export interface IProps
  extends WithPermissionsProps,
    WithLoaderProps,
    RouteComponentProps<any>,
    TradeDashboardProps,
    TradeDashboardActions {}

interface TradeDashboardState {
  column: keyof ITradeEnriched
  direction: 'descending' | 'ascending'
  tradingRole: TradingRole
}

const COLUMNS: Array<keyof ITradeEnriched> = [
  'buyerEtrmId',
  'sellerEtrmId',
  'source',
  'sellerName',
  'buyerName',
  'dealDate',
  'commodity',
  'quantity',
  'price',
  'deliveryTerms',
  'status'
]

const buildTradeColumns = (
  { column, direction, tradingRole }: TradeDashboardState,
  companyStaticId: string
): Array<Column<ITradeEnriched>> =>
  [
    {
      title: 'Trade ID',
      accessor: tradingRole === TradingRole.BUYER ? 'buyerEtrmId' : 'sellerEtrmId',
      cell: t => {
        return (
          <Link to={`/trades/${t._id}`}>
            <Image src="/images/file.svg" inline={true} spaced="right" />
            {displayEtrmId(t, companyStaticId)}
          </Link>
        )
      }
    },
    { accessor: 'source' },
    {
      title: 'Counterparty',
      accessor: tradingRole === TradingRole.BUYER ? 'sellerName' : 'buyerName'
    },
    {
      title: 'Trade date',
      accessor: 'dealDate',
      cell: t => <span>{displayDate(t.dealDate)}</span>,
      align: 'right'
    },
    {
      accessor: 'commodity',
      cell: t => <span>{displayCommodity(t.commodity)}</span>
    },
    {
      accessor: 'quantity',
      cell: t => <span>{displayQuantity(t.quantity, t.priceUnit, '-')}</span>,
      align: 'right'
    },
    {
      accessor: 'price',
      cell: t => <span>{displayPrice(t.price, t.currency, t.priceUnit, '-')}</span>,
      align: 'right'
    },
    { accessor: 'deliveryTerms' },
    {
      accessor: 'status',
      cell: t =>
        t.status ? <span>{displayTradeStatus(t.status)}</span> : <Loader active={true} inline={true} size="mini" />
    }
  ].map((c: any) => (c.accessor === column ? { ...c, defaultSortDesc: direction === 'descending' } : c))

const ButtonLikeLink = styled(Button)`
  &&&& {
    border: 0;
    border-right: 0;
    border-top: 0;
    box-shadow: none !important;
    -moz-box-shadow: none !important;
    -webkit-box-shadow: none !important;
    padding-left: 0;
    &:hover,
    :active,
    :visited,
    :focus {
      box-shadow: none !important;
      -moz-box-shadow: none !important;
      -webkit-box-shadow: none !important;
    }
  }
`

const StyledHeader = styled.h1`
  display: inline-block;
  width: 70%;
`

export class TradeDashboard extends React.Component<IProps, TradeDashboardState> {
  private pollingService: PollingService

  constructor(props: IProps) {
    super(props)
    this.handleSort = this.handleSort.bind(this)
    this.updateTrades = this.updateTrades.bind(this)
    this.updateURL = this.updateURL.bind(this)
    this.refresh = this.refresh.bind(this)
    this.pollingService = new PollingService(5000, [this.refresh])

    // Parse URL params
    const urlSearchParams = new URLSearchParams(this.props.location.search)
    const direction = urlSearchParams.get('direction') === ASC_TEXT ? ASC_TEXT : DESC_TEXT
    const column: keyof ITrade = (COLUMNS.find(c => c === urlSearchParams.get('column')) as keyof ITrade) || 'dealDate'

    this.state = {
      column,
      tradingRole: getTradingRole(this.props.location),
      direction
    }
  }

  componentDidMount() {
    if (this.props.isAuthorized(tradeFinanceManager.canReadTrades)) {
      const urlSearchParams = new URLSearchParams(this.props.location.search)
      this.updateTrades()
      // Getting the opposite tradingRole in order to set the total for the opposite tab.
      const alternateTradingRoleForTotal =
        urlSearchParams.get('tradingRole') === TradingRole.SELLER ? TradingRole.BUYER : TradingRole.SELLER
      this.updateTrades(alternateTradingRoleForTotal, { _id: 1 })
      this.props.fetchConnectedCounterpartiesAsync()
      this.pollingService.start()
    }
  }

  componentWillUnmount() {
    this.pollingService.stop()
  }

  updateTrades(tradingRole?: string, projection = {}) {
    this.props.fetchTradesDashboardData({
      filter: {
        projection,
        options: { sort: { [this.state.column]: this.state.direction === DESC_TEXT ? DESC : ASC }, limit: 10000 },
        query: { [`${tradingRole || this.state.tradingRole}`]: this.props.company }
      }
    })
  }

  updateURL() {
    this.props.history.push(
      `${this.props.location.pathname}${stringify(this.state, { addQueryPrefix: true })}`,
      this.state
    )
  }

  handleSort = ({ accessor }: Column<ITradeEnriched>) => {
    const { column, direction } = this.state
    const update = {
      column: accessor,
      direction: accessor === column && direction === DESC_TEXT ? ASC_TEXT : (DESC_TEXT as 'ascending' | 'descending')
    }
    const actionUpdate: TableSortParams = {
      ...update,
      direction: update.direction === DESC_TEXT ? DESC : ASC
    }
    this.props.sortBy(actionUpdate)
    this.setState(update, () => this.updateURL())
  }

  handleViewChange(tradingRole: TradingRole) {
    return () => {
      this.props.filterTradingRole({
        role: tradingRole,
        company: this.props.company
      })
      this.setState({ tradingRole }, () => {
        this.updateURL()
        this.updateTrades()
      })
    }
  }

  renderAddNewTradeButton() {
    if (this.props.isAuthorized(tradeFinanceManager.canCrudTrades)) {
      return (
        <Link className="ui primary button" to="/trades/new" style={{ float: 'right' }}>
          Create trade
        </Link>
      )
    }
    return null
  }

  render() {
    const { isAuthorized, history } = this.props
    if (
      !(
        isAuthorized(tradeFinanceManager.canReadTrades) ||
        isAuthorized(tradeFinanceManager.canManageLCRequests) ||
        isAuthorized(tradeFinanceManager.canManageSBLCRequests)
      )
    ) {
      return <Unauthorized />
    }
    const [error] = this.props.errors
    if (error) {
      return <ErrorMessage title="Trade Dashboard Error" error={error} />
    }

    return this.props.isFetching ? (
      <LoadingTransition title="Loading Trades" />
    ) : (
      <Fragment>
        <Helmet>
          <title>Trade Dashboard</title>
        </Helmet>
        <div>
          <StyledHeader>Trades</StyledHeader>
          {this.renderAddNewTradeButton()}
        </div>
        <ButtonLikeLink
          basic={true}
          id={TradingRole.SELLER}
          primary={this.state.tradingRole === TradingRole.SELLER}
          onClick={this.handleViewChange(TradingRole.SELLER)}
          size="medium"
        >
          Sales ({this.props.totals.seller})
        </ButtonLikeLink>
        <ButtonLikeLink
          basic={true}
          id={TradingRole.BUYER}
          primary={this.state.tradingRole === TradingRole.BUYER}
          onClick={this.handleViewChange(TradingRole.BUYER)}
          size="medium"
        >
          Purchases ({this.props.totals.buyer})
        </ButtonLikeLink>
        <Table
          data-test-id="trades-table"
          data={findTradesByRole(this.props.trades, this.state.tradingRole, this.props.company)}
          columns={buildTradeColumns(this.state, this.props.company)}
          onRowClick={trade => history.push(`/trades/${trade._id}`)}
          onSort={this.handleSort}
          paginate={true}
          pageSize={30}
          actionsMenu={t => [
            <ExtraOptionsMenuFactory
              key={t._id}
              tradeId={t._id!}
              sourceId={t.sourceId!}
              role={this.state.tradingRole}
            />
          ]}
          dataTestId="_id"
        />
      </Fragment>
    )
  }

  private async refresh() {
    if (this.state.tradingRole === TradingRole.BUYER) {
      const filter = {
        // NOTE - we are currenly skipping filter with tradeIds as this causes issues with request size
        // without pagination, fetching LCs for all trades is like fetching without filters
        // query: { 'tradeAndCargoSnapshot.trade._id': { $in: this.props.trades.map(t => t._id) } },
        projection: {
          status: 1,
          _id: 1,
          'tradeAndCargoSnapshot.trade.deliveryPeriod': 1,
          'tradeAndCargoSnapshot.trade._id': 1,
          updatedAt: 1,
          'tradeAndCargoSnapshot.sourceId': 1
        }
      }

      const sblcFilter = {
        // NOTE - we are currenly skipping filter with tradeIds as this causes issues with request size
        // without pagination, fetching SBLCs for all trades is like fetching without filters
        // query: { 'tradeId.sourceId': { $in: this.props.trades.map(t => t.sourceId) } },
        projection: {
          status: 1,
          staticId: 1,
          _id: 1,
          tradeId: 1,
          updatedAt: 1
        }
      }

      const newSblcFilter = {
        projection: {
          'templateInstance.data.trade._id': 1,
          'templateInstance.data.trade.sourceId': 1,
          staticId: 1,
          status: 1,
          _id: 1,
          updatedAt: 1
        }
      }

      this.props.fetchLettersOfCredit({ filter, polling: true })
      this.props.fetchStandByLettersOfCredit({ filter: sblcFilter, polling: true })
      this.props.fetchLettersOfCreditByType({ filter: newSblcFilter, polling: true })
    } else {
      this.props.fetchRdsFromTrades(this.props.trades, true)
    }
  }
}

export const mapStateToProps = (state: ApplicationState, ownProps: IProps): TradeDashboardProps => {
  let selectors
  if (getTradingRole(ownProps.location) === TradingRole.BUYER) {
    selectors = [
      LegacyLetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
      StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST,
      LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_REQUEST
    ]
  } else {
    selectors = [ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST]
  }

  const isStatusFetching = loadingSelector(state.get('loader').get('requests'), selectors)
  // letter
  const trades: ITradeEnriched[] = addBuyerSellerEnrichedData(
    getCurrentCompanyStaticId(state),
    selectVisibleTrades(state.get('trades').get('trades'), state.get('trades').get('tradeIds')),
    state
      .get('members')
      .get('byId')
      .toList()
      .toJS()
  ).map(t => ({
    ...t,
    status: isStatusFetching ? undefined : t.status
  }))

  const totals: any = state
    .get('trades')
    .get('totals')
    .toJS()

  return {
    trades,
    company: state.get('uiState').get('profile')!.company,
    totals
  }
}

export default compose<any>(
  withLoaders({
    actions: [MemberActionType.FetchMembersRequest, TradeActionType.TRADES_REQUEST]
  }),
  withPermissions,
  withRouter,
  connect<TradeDashboardProps, TradeDashboardActions>(mapStateToProps, {
    fetchTradesDashboardData,
    fetchLettersOfCredit,
    fetchStandByLettersOfCredit,
    fetchLettersOfCreditByType,
    fetchRdsFromTrades,
    fetchConnectedCounterpartiesAsync,
    sortBy,
    filterTradingRole
  })
)(TradeDashboard)
