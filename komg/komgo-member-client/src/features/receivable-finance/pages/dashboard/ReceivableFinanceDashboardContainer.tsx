import * as React from 'react'
import Helmet from 'react-helmet'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { WithPermissionsProps, withPermissions } from '../../../../components/with-permissions'
import { WithLicenseCheckProps, withLicenseCheck } from '../../../../components/with-license-check'
import { tradeFinanceManager } from '@komgo/permissions'
import { productRD } from '@komgo/products'
import { Fragment } from 'react'
import styled from 'styled-components'
import { WithLoaderProps, withLoaders } from '../../../../components/with-loaders'
import { ApplicationState } from '../../../../store/reducers'
import Unauthorized from '../../../../components/unauthorized'
import { LoadingTransition, ErrorMessage } from '../../../../components'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { CounterpartiesActionType } from '../../../counterparties/store/types'
import { findMembersByStatic } from '../../../letter-of-credit-legacy/utils/selectors'
import { fetchMembers } from '../../../members/store/actions'
import { IMember, MemberActionType } from '../../../members/store/types'
import RFDashboardTraderTable from './components/RFDashboardTraderTable'
import { fetchTradesWithRd } from '../../../trades/store/actions'
import { ITradeEnriched } from '../../../trades/store/types'
import { addBuyerSellerEnrichedData } from '../../../trades/utils/displaySelectors'
import {
  IReceivableDiscountingDashboardTrader,
  IReceivableDiscountingDashboardBank
} from '../../../receivable-discounting-legacy/store/types'
import { ReceivableDiscountingApplicationActionType } from '../../../receivable-discounting-legacy/store/application/types'
import { tranformToRdTraderDashboardData } from '../../../receivable-discounting-legacy/selectors/rdTraderDashboardSelectors'
import RFDashboardBankTable from './components/RFDashboardBankTable'
import { tranformToRdBankDashboardData } from '../../../receivable-discounting-legacy/selectors/rdBankDashboardSelectors'
import { fetchRdsByStaticIds } from '../../../receivable-discounting-legacy/store/application/actions'
import { IReceivablesDiscountingInfo, ITrade } from '@komgo/types'
import { getMembersList } from '../../../../store/common/selectors/state-selectors'
import { ISortingParams, SortDirection } from '../../../../store/common/types'
import { getSortingParamsFromUrl, appendSortingParamsToUrl } from '../../../../utils/sortingUrl'

export interface IReceivableFinanceDashboardContainerProps
  extends WithPermissionsProps,
    WithLicenseCheckProps,
    WithLoaderProps,
    RouteComponentProps<any> {
  members: IMember[]
  rds: IReceivablesDiscountingInfo[]
  company: string
  data: IReceivableDiscountingDashboardTrader[] | IReceivableDiscountingDashboardBank[]
  isFetching: boolean
  isFinancialInstitution: boolean
  history: any
  localErrors: string[]
  fetchConnectedCounterpartiesAsync: (params?: {}) => any
  fetchTradesWithRd: (company: string) => any
  fetchRdsByStaticIds: (params?: {}) => any
  fetchMembers: (params?: {}) => void
}

export interface IReceivableFinanceDashboardContainerState {
  sort: ISortingParams
}

export class ReceivableFinanceDashboardContainer extends React.Component<
  IReceivableFinanceDashboardContainerProps,
  IReceivableFinanceDashboardContainerState
> {
  constructor(props: IReceivableFinanceDashboardContainerProps) {
    super(props)
    this.state = {
      sort: { key: '' }
    }
  }

  componentDidMount() {
    this.getSorting()

    this.props.fetchConnectedCounterpartiesAsync()
    this.fetchRdDashboardData()
  }

  fetchRdDashboardData = () => {
    if (this.props.isFinancialInstitution) {
      this.props.fetchRdsByStaticIds()
    } else {
      this.props.fetchTradesWithRd(this.props.company)
    }
  }

  isAuthorized() {
    const { isFinancialInstitution, isAuthorized } = this.props
    return isFinancialInstitution
      ? isAuthorized(tradeFinanceManager.canReadRDRequests)
      : isAuthorized(tradeFinanceManager.canReadRD)
  }

  getSorting() {
    const sort = getSortingParamsFromUrl(this.props.location)

    this.setState({ sort })
  }

  handleSorting(sorting: ISortingParams) {
    const { key: sortingKey } = sorting
    const { key: currentSortKey = null, direction: currentSortDirection = null } = this.state.sort || {}

    // react table sends only column sort, so track and toggle direction
    const newDirection =
      currentSortKey === sortingKey && currentSortDirection === SortDirection.Descending
        ? SortDirection.Ascending
        : SortDirection.Descending

    const sortingData = {
      key: sortingKey,
      direction: newDirection
    }

    this.setState({ sort: sortingData }, () =>
      appendSortingParamsToUrl(sortingData, this.props.history, this.props.location)
    )
  }

  render() {
    const { isFinancialInstitution, data, errors, localErrors, isLicenseEnabled } = this.props
    const { sort } = this.state || ({} as any)

    if (!this.isAuthorized() || !isLicenseEnabled(productRD)) {
      return <Unauthorized />
    }

    const [firstError] = [...errors, ...localErrors]
    if (firstError) {
      return <ErrorMessage title="Risk cover / Discounting dashboard error" error={firstError} />
    }

    return this.props.isFetching ? (
      <LoadingTransition title="Loading Risk cover / Discounting data" />
    ) : (
      <Fragment>
        <Helmet>
          <title>Risk cover / Discounting dashboard</title>
        </Helmet>
        <div>
          <StyledHeader>Risk cover / Discounting</StyledHeader>
          {isFinancialInstitution ? (
            <RFDashboardBankTable
              data={data as IReceivableDiscountingDashboardBank[]}
              sort={sort}
              onSorted={c => this.handleSorting(c)}
            />
          ) : (
            <RFDashboardTraderTable
              data={data as IReceivableDiscountingDashboardTrader[]}
              sort={sort}
              onSorted={c => this.handleSorting(c)}
            />
          )}
        </div>
      </Fragment>
    )
  }
}

const StyledHeader = styled.h1`
  display: inline-block;
  width: 70%;
`

// TODO: Figure out good means to test mapStateToProps: e.g. redux-mock-store, or mock the application state
export const mapStateToProps = (state: ApplicationState, ownProps: IReceivableFinanceDashboardContainerProps) => {
  const members: IMember[] = getMembersList(state)
  const company = state.get('uiState').get('profile')!.company
  const member = findMembersByStatic(members, company)

  const localErrors = member ? [] : [`Your company ID: ${company} could not be found`]
  const isFinancialInstitution = member && member.isFinancialInstitution

  const rds = state
    .get('receivableDiscountingApplication')
    .get('byId')
    .toList()
    .toJS()

  let data: IReceivableDiscountingDashboardTrader[] | IReceivableDiscountingDashboardBank[] = []

  if (!isFinancialInstitution) {
    // trader
    const trades: ITrade[] = state
      .get('trades')
      .get('trades')
      .toList()
      .toJS()
    const tradesEnriched: ITradeEnriched[] = addBuyerSellerEnrichedData(company, trades, members)
    data = tranformToRdTraderDashboardData(members, tradesEnriched, rds)
  } else {
    // bank
    const rdsMissingTradeSnapshot = rds.filter(rdInfo => !rdInfo.tradeSnapshot)
    if (rdsMissingTradeSnapshot.length !== 0) {
      localErrors.push(
        `Invalid data. Could not find associated trade information for receivables discounting request with ID: ${
          rdsMissingTradeSnapshot[0].rd.staticId
        }`
      )
    } else {
      data = tranformToRdBankDashboardData(rds, members)
    }
  }

  return {
    members,
    isFinancialInstitution,
    data,
    rds,
    company,
    localErrors
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      MemberActionType.FetchMembersRequest,
      ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST
    ]
  }),
  withPermissions,
  withLicenseCheck,
  withRouter,
  connect(mapStateToProps, {
    fetchMembers,
    fetchConnectedCounterpartiesAsync,
    fetchTradesWithRd,
    fetchRdsByStaticIds
  })
)(ReceivableFinanceDashboardContainer)
