import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Helmet from 'react-helmet'
import { DepositLoanPeriod, Currency } from '@komgo/types'
import _ from 'lodash'
import { withRouter, RouteComponentProps } from 'react-router'

import {
  CreditAppetiteDepositLoanFeature,
  DepositLoanActionType,
  DepositLoanDetailsQuery,
  IExtendedDisclosedDepositLoan
} from '../../store/types'
import { ApplicationState } from '../../../../store/reducers'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  ErrorMessage
} from '../../../../components'
import { getReadPermission, getCrudPermission } from '../../../credit-line/utils/permissions'
import { dictionary } from '../../dictionary'
import { fetchDisclosedDepositsLoans } from '../../store/actions'
import PageHeader from '../../../credit-line/components/credit-appetite-shared-components/PageHeader'
import { ROUTES } from '../../routes'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { filterAndExtendDisclosedDepositLoan, getCurrencyWithTenor } from '../../utils/selectors'
import { CounterpartiesActionType } from '../../../counterparties/store/types'
import DisclosedDepositLoanDetailsTable from '../../components/corporate/details/DisclosedDepositLoanDetailsTable'
import { createCurrencyAndPeriodStringValue } from '../../utils/formatters'

interface DepositLoanCurrencyAndTenorDetailsProps {
  params: DepositLoanDetailsQuery
  items: IExtendedDisclosedDepositLoan[]
}

interface DepositLoanCurrencyAndTenorDetailsActions {
  fetchDisclosedDepositsLoans(feature: CreditAppetiteDepositLoanFeature, params: DepositLoanDetailsQuery): void
  fetchConnectedCounterpartiesAsync(params?: {}): void
}

interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    DepositLoanCurrencyAndTenorDetailsProps,
    DepositLoanCurrencyAndTenorDetailsActions,
    RouteComponentProps<{ currency: Currency; period: DepositLoanPeriod; periodDuration?: string }> {
  feature: CreditAppetiteDepositLoanFeature
}

interface IState {
  highlightItem?: string
}

export class DepositLoanCurrencyAndTenorDetails extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      highlightItem: props.location.state ? props.location.state.highlightItem : undefined
    }
  }

  componentDidMount() {
    this.fetchDataAndReplaceHistory()
  }

  componentDidUpdate(oldProps: IProps) {
    const { feature, params, location } = this.props
    if (feature !== oldProps.feature || !_.isEqual(params, oldProps.params)) {
      this.fetchDataAndReplaceHistory()
    }
    if (location.state && location.state.highlightItem !== this.state.highlightItem) {
      this.refreshStateData()
    }
  }

  refreshStateData() {
    this.setState(
      {
        highlightItem: this.props.location.state.highlightItem
      },
      this.restartHistoryState
    )
  }

  fetchDataAndReplaceHistory() {
    const { feature, params } = this.props
    this.props.fetchDisclosedDepositsLoans(feature, params)
    this.props.fetchConnectedCounterpartiesAsync()
    this.restartHistoryState()
  }

  restartHistoryState() {
    const { history, location } = this.props
    if (this.state.highlightItem) {
      history.replace({
        pathname: window.location.pathname,
        search: window.location.search,
        state: undefined
      })
    }
  }

  getPageHeaderButtonProps() {
    const { items, feature } = this.props
    const redirectUrl = items[0]
      ? `${ROUTES[feature].corporate.dashboard}/currency-tenor/request-information/${createCurrencyAndPeriodStringValue(
          items[0]
        )}`
      : ROUTES[feature].corporate.requestInfoNew
    const content = items[0]
      ? dictionary[feature].corporate.details.linkText
      : dictionary[feature].corporate.dashboard.linkText
    const testId = items[0]
      ? dictionary[feature].corporate.details.linkTestId
      : dictionary[feature].corporate.dashboard.linkText
    return {
      redirectUrl,
      content,
      testId
    }
  }

  render() {
    const { isAuthorized, feature, isFetching, errors, items } = this.props
    const [error] = errors

    if (!isAuthorized(getReadPermission(feature))) {
      return <Unauthorized />
    }
    if (isFetching) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }

    const canCrudDepositLoan = isAuthorized(getCrudPermission(feature))
    const title = items[0] ? getCurrencyWithTenor(items[0]) : 'Currency and tenor'
    const htmlTitle = items[0] ? `Currency and tenor - ${title}` : title

    return (
      <React.Fragment>
        <Helmet>
          <title>{htmlTitle}</title>
        </Helmet>

        <PageHeader
          canCrudCreditAppetite={canCrudDepositLoan}
          headerContent={title}
          buttonProps={this.getPageHeaderButtonProps()}
          subTitleContent={dictionary[feature].corporate.details.subTitle}
        />

        {items.length ? (
          <DisclosedDepositLoanDetailsTable items={items} feature={feature} highlightItem={this.state.highlightItem} />
        ) : null}
        {items.length === 0 ? (
          <div data-test-id="warning-empty-deposit-loan">{dictionary[feature].corporate.details.emptyMessage}</div>
        ) : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): DepositLoanCurrencyAndTenorDetailsProps => {
  const { feature, match } = ownProps
  const { currency, period } = match.params
  const periodDuration = match.params.periodDuration ? parseInt(match.params.periodDuration, 10) : null
  const counterparties = state.get('counterparties').get('counterparties')
  return {
    items: filterAndExtendDisclosedDepositLoan(
      state
        .get('depositsAndLoans')
        .get(feature)
        .get('disclosedById')
        .toList()
        .toJS(),
      { currency, period, periodDuration },
      counterparties
    ),
    params: { currency, period, periodDuration }
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorRequest,
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
    ]
  }),
  withPermissions,
  withRouter,
  connect<DepositLoanCurrencyAndTenorDetailsProps, DepositLoanCurrencyAndTenorDetailsActions>(mapStateToProps, {
    fetchDisclosedDepositsLoans,
    fetchConnectedCounterpartiesAsync
  })
)(DepositLoanCurrencyAndTenorDetails)
