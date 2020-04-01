import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { IDepositLoanResponse } from '@komgo/types'

import {
  DepositLoanActionType,
  CreditAppetiteDepositLoanFeature,
  IExtendedDepositLoanResponse
} from '../../store/types'
import { ServerError } from '../../../../store/common/types'
import {
  withPermissions,
  WithPermissionsProps,
  LoadingTransition,
  ErrorMessage,
  Unauthorized
} from '../../../../components'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import { clearError } from '../../../../store/common/actions'
import { fetchDepositsLoans, removeDepositLoan } from '../../store/actions'
import { loadingSelector } from '../../../../store/common/selectors'
import { ApplicationState } from '../../../../store/reducers'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import Helmet from 'react-helmet'
import { dictionary } from '../../dictionary'
import { ROUTES } from '../../routes'
import PageHeader from '../../../credit-line/components/credit-appetite-shared-components/PageHeader'
import DepositLoanStartMessage from '../../components/common/DepositLoanStartMessage'
import DepositsLoansTable from '../../components/financial-institutions/dashboard/DepositsLoansTable'
import RemoveConfirmContent from '../../components/financial-institutions/dashboard/RemoveConfirmContent'
import { getReadPermission, getCrudPermission } from '../../../credit-line/utils/permissions'
import ConfirmWrapper, {
  ConfirmAction
} from '../../../credit-line/components/credit-appetite-shared-components/ConfirmWrapper'
import { populateDepositLoansWithCurrencyAndTenorInfo } from '../../utils/selectors'

interface IDepositLoanDashboardProps {
  removingErrors: ServerError[]
  isRemoving: boolean
  items: IExtendedDepositLoanResponse[]
}

interface IDepositLoanDashboardActions {
  fetchDepositsLoans(feature: CreditAppetiteDepositLoanFeature): void
  removeDepositLoan(creditLine: IExtendedDepositLoanResponse, feature: CreditAppetiteDepositLoanFeature): void
  clearError(action: string): void
}

interface IProps
  extends IDepositLoanDashboardProps,
    IDepositLoanDashboardActions,
    WithLoaderProps,
    WithPermissionsProps {
  feature: CreditAppetiteDepositLoanFeature
}

interface IState {
  removeDepositLoan?: IExtendedDepositLoanResponse
}

export class DepositLoanDashboard extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {}

    this.handleCloseRemove = this.handleCloseRemove.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
    this.handleConfirmRemove = this.handleConfirmRemove.bind(this)
  }

  componentDidMount() {
    this.props.fetchDepositsLoans(this.props.feature)
  }

  componentDidUpdate(prevProps: IProps) {
    const { isRemoving, removingErrors, feature } = this.props
    if (prevProps.isRemoving && !isRemoving && removingErrors.length === 0) {
      this.handleCloseRemove()
    }
    if (prevProps.feature !== feature) {
      this.props.fetchDepositsLoans(feature)
    }
  }

  handleRemove(removeDepositLoan: IExtendedDepositLoanResponse) {
    this.setState({
      removeDepositLoan
    })
  }

  handleConfirmRemove() {
    this.props.removeDepositLoan(this.state.removeDepositLoan, this.props.feature)
  }

  handleCloseRemove() {
    this.setState({
      removeDepositLoan: undefined
    })
    if (this.props.removingErrors.length) {
      this.props.clearError(DepositLoanActionType.RemoveDepositLoanRequest)
    }
  }

  render() {
    const { feature, isFetching, errors, items, isRemoving, removingErrors, isAuthorized } = this.props
    const [error] = errors
    const { removeDepositLoan } = this.state

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
          <title>{dictionary[feature].financialInstitution.dashboard.htmlPageTitle}</title>
        </Helmet>

        <PageHeader
          canCrudCreditAppetite={canCrudDepositLoan}
          headerContent={dictionary[feature].common.title}
          subTitleContent={items.length ? dictionary[feature].common.subTitleContent : ''}
          buttonProps={
            items.length > 0
              ? {
                  content: dictionary[feature].financialInstitution.dashboard.linkText,
                  redirectUrl: ROUTES[feature].financialInstitution.new,
                  testId: dictionary[feature].financialInstitution.dashboard.linkTestId
                }
              : null
          }
        />

        {!items.length && (
          <DepositLoanStartMessage
            canCrudCreditAppetite={canCrudDepositLoan}
            isFinancialInstitution={true}
            feature={feature}
          />
        )}

        {items.length ? (
          <DepositsLoansTable
            items={items}
            canCrudCreditAppetite={canCrudDepositLoan}
            handleRemoveDepositLoan={this.handleRemove}
            feature={feature}
          />
        ) : null}

        {removeDepositLoan && (
          <ConfirmWrapper
            handleClose={this.handleCloseRemove}
            isSubmitting={isRemoving}
            submittingErrors={removingErrors}
            handleConfirm={this.handleConfirmRemove}
            header="Remove currency and tenor"
            action={ConfirmAction.Remove}
          >
            <RemoveConfirmContent depoistLoan={removeDepositLoan} />
          </ConfirmWrapper>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IDepositLoanDashboardProps => {
  return {
    items: populateDepositLoansWithCurrencyAndTenorInfo(
      state
        .get('depositsAndLoans')
        .get(ownProps.feature)
        .get('byId')
        .toList()
        .toJS()
    ),
    isRemoving: loadingSelector(
      state.get('loader').get('requests'),
      [DepositLoanActionType.RemoveDepositLoanRequest],
      false
    ),
    removingErrors: findErrors(state.get('errors').get('byAction'), [DepositLoanActionType.RemoveDepositLoanRequest])
  }
}

export default compose<any>(
  withLoaders({
    actions: [DepositLoanActionType.FetchDepositsLoansRequest]
  }),
  withPermissions,
  connect<IDepositLoanDashboardProps, IDepositLoanDashboardActions>(mapStateToProps, {
    fetchDepositsLoans,
    clearError,
    removeDepositLoan
  })
)(DepositLoanDashboard)
