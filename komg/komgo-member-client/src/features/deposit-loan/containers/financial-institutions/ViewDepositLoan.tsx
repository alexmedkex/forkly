import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { RouteComponentProps, withRouter } from 'react-router'
import Helmet from 'react-helmet'

import {
  DepositLoanActionType,
  CreditAppetiteDepositLoanFeature,
  IExtendedDepositLoanResponse
} from '../../store/types'
import {
  withPermissions,
  WithPermissionsProps,
  LoadingTransition,
  ErrorMessage,
  Unauthorized
} from '../../../../components'
import { withLoaders, WithLoaderProps } from '../../../../components/with-loaders'
import { getDepositLoan, fetchDepositsLoans } from '../../store/actions'
import { ApplicationState } from '../../../../store/reducers'
import { dictionary } from '../../dictionary'
import { getCurrencyWithTenor, populateDepoistLoanWithSharedCompanyName } from '../../utils/selectors'
import ViewDepositLoanWrapper from '../../components/financial-institutions/view/ViewDepositLoanWrapper'
import { getReadPermission, getCrudPermission } from '../../../credit-line/utils/permissions'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { CounterpartiesActionType } from '../../../counterparties/store/types'

interface IViewDepositLoanProps {
  depositLoan: IExtendedDepositLoanResponse
  id: string
}

interface IViewDepositLoanActions {
  getDepositLoan(id: string, feature: CreditAppetiteDepositLoanFeature): void
  fetchConnectedCounterpartiesAsync(params?: {}): void
}

interface IProps
  extends IViewDepositLoanProps,
    WithPermissionsProps,
    WithLoaderProps,
    RouteComponentProps<{ id: string }>,
    IViewDepositLoanActions {
  feature: CreditAppetiteDepositLoanFeature
}

export class ViewDepositLoan extends React.Component<IProps> {
  componentDidMount() {
    this.props.getDepositLoan(this.props.id, this.props.feature)
    this.props.fetchConnectedCounterpartiesAsync()
  }

  componentDidUpdate(oldProps: IProps) {
    const { feature, id } = this.props
    if (oldProps.feature !== feature || id !== oldProps.id) {
      this.props.getDepositLoan(id, feature)
    }
  }

  render() {
    const { feature, isFetching, errors, depositLoan, isAuthorized } = this.props
    const [error] = errors
    if (!isAuthorized(getReadPermission(feature))) {
      return <Unauthorized />
    }
    if (isFetching || !depositLoan) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }

    const title = getCurrencyWithTenor(depositLoan)
    const htmlTitle = `${dictionary[feature].common.title} - ${title}`

    const canCrudDepositLoan = isAuthorized(getCrudPermission(feature))

    return (
      <React.Fragment>
        <Helmet>
          <title>{htmlTitle}</title>
        </Helmet>

        <h1 data-test-id="currency-tenor-name">{title}</h1>

        <ViewDepositLoanWrapper
          depositLoan={depositLoan}
          feature={feature}
          canCrudCreditAppetite={canCrudDepositLoan}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IViewDepositLoanProps => {
  const { id } = ownProps.match.params
  const counterparties = state.get('counterparties').get('counterparties')
  const depositLoan = state
    .get('depositsAndLoans')
    .get(ownProps.feature)
    .get('byId')
    .toJS()[id]
  return {
    depositLoan: depositLoan ? populateDepoistLoanWithSharedCompanyName(depositLoan, counterparties) : undefined,
    id
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      DepositLoanActionType.GetDepositLoanRequest,
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
    ]
  }),
  withPermissions,
  withRouter,
  connect<IViewDepositLoanProps, IViewDepositLoanActions>(mapStateToProps, {
    getDepositLoan,
    fetchConnectedCounterpartiesAsync
  })
)(ViewDepositLoan)
