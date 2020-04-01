import * as React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  CreditLineActionType,
  IDisclosedCreditLineSummaryEnriched,
  IDisclosedCreditLineSummary,
  IProductProps,
  CreditLineType,
  IMemberWithDisabledFlag
} from '../../store/types'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  ErrorMessage
} from '../../../../components'
import { ApplicationState } from '../../../../store/reducers'
import { fetchDisclosedCreditLineSummaries } from '../../store/actions'
import Helmet from 'react-helmet'
import PageHeader from '../../components/credit-appetite-shared-components/PageHeader'
import { populateDisclosedCreditLineSummaryData, getMembersWithDisabledFlag } from '../../utils/selectors'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import CreditLineStartMessage from '../../components/common/CreditLineStartMessage'
import DisclosedCreditLinesSummaryTable from '../../components/corporate/dashboard/DisclosedCreditLinesSummaryTable'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { dictionary } from '../../dictionary'
import { getReadPermission, getCrudPermission } from '../../utils/permissions'
import { ROUTES } from '../../routes'
import { withRouter, RouteComponentProps } from 'react-router'

interface DisclosedCreditLineSummaryDashboardProps {
  disclosedCreditLineSummaries: IDisclosedCreditLineSummaryEnriched[]
  feature: CreditLineType
  membersForRequestModal: IMemberWithDisabledFlag[]
}

interface DisclosedCreditLineSummaryDashboardActions {
  fetchDisclosedCreditLineSummaries(productId: Products, subProductId: SubProducts): void
}
interface IProps
  extends DisclosedCreditLineSummaryDashboardProps,
    DisclosedCreditLineSummaryDashboardActions,
    WithPermissionsProps,
    WithLoaderProps,
    RouteComponentProps<any>,
    IProductProps {}

export class DisclosedCreditLineSummaryDashboard extends React.Component<IProps> {
  componentDidMount() {
    this.props.fetchDisclosedCreditLineSummaries(this.props.productId, this.props.subProductId)
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.feature !== this.props.feature) {
      this.props.fetchDisclosedCreditLineSummaries(this.props.productId, this.props.subProductId)
    }
  }

  redirectToRequestNew = (counterpartyId: string) => {
    this.props.history.push(`${ROUTES[this.props.feature].corporate.requestInfoNew}?counterpartyId=${counterpartyId}`)
  }

  render() {
    const {
      isFetching,
      errors,
      isAuthorized,
      disclosedCreditLineSummaries,
      feature,
      membersForRequestModal
    } = this.props
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

    const canCrudRiskCover = isAuthorized(getCrudPermission(feature))

    const withModalProps = {
      members: membersForRequestModal,
      title: dictionary[feature].financialInstitution.createOrEdit.selectCounterpartyModalTitle,
      counterpartyTablePrint: dictionary[feature].financialInstitution.dashboard.counterpartyName,
      onNext: this.redirectToRequestNew
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{dictionary[feature].corporate.dashboard.htmlPageTitle}</title>
        </Helmet>
        <PageHeader
          canCrudCreditAppetite={canCrudRiskCover}
          headerContent={dictionary[feature].common.title}
          buttonProps={
            disclosedCreditLineSummaries.length > 0
              ? {
                  content: dictionary[feature].corporate.dashboard.linkText,
                  redirectUrl: ROUTES[feature].corporate.requestInfoNew,
                  testId: 'rc-intro-request-information'
                }
              : null
          }
          withModalProps={withModalProps}
        />
        {!disclosedCreditLineSummaries.length && (
          <CreditLineStartMessage
            canCrudRiskCover={canCrudRiskCover}
            isFinancialInstitution={false}
            feature={feature}
            withModalProps={withModalProps}
          />
        )}
        {disclosedCreditLineSummaries.length ? (
          <DisclosedCreditLinesSummaryTable items={disclosedCreditLineSummaries} feature={feature} />
        ) : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): DisclosedCreditLineSummaryDashboardProps => {
  const feature = findFeature({ productId: ownProps.productId, subProductId: ownProps.subProductId })
  const company = state.get('uiState').get('profile').company
  const membersByStaticId = state
    .get('members')
    .get('byStaticId')
    .toJS()
  const disclosedData: IDisclosedCreditLineSummary[] = Object.values(
    state
      .get('creditLines')
      .get(feature)
      .get('disclosedCreditLineSummariesById')
      .toJS()
  )
  const disclosedCreditLineSummaries = populateDisclosedCreditLineSummaryData(disclosedData, membersByStaticId)
  const membersForRequestModal = getMembersWithDisabledFlag(
    Object.values(membersByStaticId),
    feature,
    disclosedData,
    company
  )
  return {
    disclosedCreditLineSummaries,
    feature,
    membersForRequestModal
  }
}

export default compose<any>(
  withLoaders({
    actions: [CreditLineActionType.FetchDisclosedCreditLineSummariesRequest]
  }),
  withPermissions,
  withRouter,
  connect<DisclosedCreditLineSummaryDashboardProps, DisclosedCreditLineSummaryDashboardActions>(mapStateToProps, {
    fetchDisclosedCreditLineSummaries
  })
)(DisclosedCreditLineSummaryDashboard)
