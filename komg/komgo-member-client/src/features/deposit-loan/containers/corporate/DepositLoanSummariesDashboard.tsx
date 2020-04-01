import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Helmet from 'react-helmet'

import {
  CreditAppetiteDepositLoanFeature,
  DepositLoanActionType,
  IExtendedDisclosedDepositLoanSummary
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
import { fetchDisclosedSummaries } from '../../store/actions'
import PageHeader from '../../../credit-line/components/credit-appetite-shared-components/PageHeader'
import DepositLoanStartMessage from '../../components/common/DepositLoanStartMessage'
import { ROUTES } from '../../routes'
import { populateDisclosedDepositLoanSummariesWithCurrencyAndTenorInfo } from '../../utils/selectors'
import DisclosedDepositLoanSummariesTable from '../../components/corporate/dashboard/DisclosedDepositLoanSummariesTable'

interface IDepositLoanSummariesDashboardProps {
  summaries: IExtendedDisclosedDepositLoanSummary[]
}

interface IDepositLoanSummariesDashboardActions {
  fetchDisclosedSummaries(feature: CreditAppetiteDepositLoanFeature): void
}

interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    IDepositLoanSummariesDashboardProps,
    IDepositLoanSummariesDashboardActions {
  feature: CreditAppetiteDepositLoanFeature
}

export class DepositLoanSummariesDashboard extends React.Component<IProps> {
  componentDidMount() {
    this.props.fetchDisclosedSummaries(this.props.feature)
  }

  componentDidUpdate(oldProps: IProps) {
    const { feature } = this.props
    if (feature !== oldProps.feature) {
      this.props.fetchDisclosedSummaries(feature)
    }
  }

  render() {
    const { isAuthorized, feature, isFetching, errors, summaries } = this.props
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

    return (
      <React.Fragment>
        <Helmet>
          <title>{dictionary[feature].corporate.dashboard.htmlPageTitle}</title>
        </Helmet>

        <PageHeader
          canCrudCreditAppetite={canCrudDepositLoan}
          headerContent={dictionary[feature].common.title}
          buttonProps={
            summaries.length > 0
              ? {
                  content: dictionary[feature].corporate.dashboard.linkText,
                  redirectUrl: ROUTES[feature].corporate.requestInfoNew,
                  testId: dictionary[feature].corporate.dashboard.linkTestId
                }
              : null
          }
        />

        {!summaries.length && (
          <DepositLoanStartMessage
            canCrudCreditAppetite={canCrudDepositLoan}
            isFinancialInstitution={false}
            feature={feature}
          />
        )}

        {summaries.length ? <DisclosedDepositLoanSummariesTable items={summaries} feature={feature} /> : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IDepositLoanSummariesDashboardProps => {
  const { feature } = ownProps

  return {
    summaries: populateDisclosedDepositLoanSummariesWithCurrencyAndTenorInfo(
      state
        .get('depositsAndLoans')
        .get(feature)
        .get('summaries')
        .toJS()
    )
  }
}

export default compose<any>(
  withLoaders({
    actions: [DepositLoanActionType.FetchDisclosedDepositLoanSummariesRequest]
  }),
  withPermissions,
  connect<IDepositLoanSummariesDashboardProps, IDepositLoanSummariesDashboardActions>(mapStateToProps, {
    fetchDisclosedSummaries
  })
)(DepositLoanSummariesDashboard)
