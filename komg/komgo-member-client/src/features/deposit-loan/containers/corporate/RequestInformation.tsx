import * as React from 'react'
import {
  CreditAppetiteDepositLoanFeature,
  DepositLoanActionType,
  DepositLoanDetailsQuery,
  IRequestDepositLoanInformationForm
} from '../../store/types'
import { ApplicationState } from '../../../../store/reducers'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Helmet from 'react-helmet'
import { DepositLoanPeriod, Currency, IDisclosedDepositLoan } from '@komgo/types'
import _ from 'lodash'
import { withRouter, RouteComponentProps } from 'react-router'

import { createRequestInformation, fetchDisclosedDepositsLoans, fetchDisclosedSummaries } from '../../store/actions'
import { IMailToData } from '../../../credit-line/store/types'
import { CounterpartiesActionType, Counterparty } from '../../../counterparties/store/types'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  ErrorMessage
} from '../../../../components'
import { clearError } from '../../../../store/common/actions'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { loadingSelector } from '../../../../store/common/selectors'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { WithLoaderProps } from '../../../../components/with-loaders'
import { ServerError } from '../../../../store/common/types'
import { getCrudPermission } from '../../../credit-line/utils/permissions'
import { dictionary } from '../../dictionary'
import { Divider } from 'semantic-ui-react'
import {
  getCurrencyWithTenor,
  filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration
} from '../../utils/selectors'
import RequestInformationForm from '../../../credit-line/components/corporate/request-information/RequestInformationForm'
import { createDefaultCurrencyAndPeriodDropdownOptions, createInititialRequestInformation } from '../../utils/factories'
import { formatRequestInfoData, createCurrencyAndPeriodStringValue } from '../../utils/formatters'
import ConfirmWrapper from '../../../credit-line/components/credit-appetite-shared-components/ConfirmWrapper'
import RequestInformationConfirmContent from '../../components/corporate/create/RequestInformationConfirmContent'

interface IRequestInformationProps extends WithLoaderProps {
  params?: DepositLoanDetailsQuery
  counterparties: Counterparty[]
  isSubmitting: boolean
  submittingErrors: ServerError[]
  summariesSignatures: string[]
  disclosedDepositsLoans: IDisclosedDepositLoan[]
}

interface IRequestInformationActions {
  createRequestInformation(data: any, feature: CreditAppetiteDepositLoanFeature, mailTo?: IMailToData)
  fetchConnectedCounterpartiesAsync(params?: {}): void
  clearError(action: string): void
  fetchDisclosedDepositsLoans(feature: CreditAppetiteDepositLoanFeature, params: DepositLoanDetailsQuery): void
  fetchDisclosedSummaries(feature: CreditAppetiteDepositLoanFeature): void
}

interface IProps
  extends WithPermissionsProps,
    IRequestInformationProps,
    IRequestInformationActions,
    RouteComponentProps<{ currency: Currency; period: DepositLoanPeriod; periodDuration?: string }> {
  feature: CreditAppetiteDepositLoanFeature
}

interface IState {
  values?: IRequestDepositLoanInformationForm
}

export class RequestInformation extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {}

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCloseSubmit = this.handleCloseSubmit.bind(this)
    this.handleConfirmSubmit = this.handleConfirmSubmit.bind(this)
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { params, feature } = this.props
    if (params) {
      this.props.fetchDisclosedDepositsLoans(feature, params)
    } else {
      this.props.fetchDisclosedSummaries(feature)
    }
    this.props.fetchConnectedCounterpartiesAsync()
  }

  handleSubmit(values: IRequestDepositLoanInformationForm) {
    this.setState({ values })
  }

  handleCloseSubmit() {
    this.setState({ values: undefined })
    if (this.props.submittingErrors.length) {
      this.props.clearError(DepositLoanActionType.CreateReqDepositLoanInformationRequest)
    }
  }

  handleConfirmSubmit() {
    const { data, mailToInfo } = formatRequestInfoData(this.state.values, this.props.feature)
    this.props.createRequestInformation(data, this.props.feature, mailToInfo)
  }

  getTitle() {
    if (this.props.params) {
      return `${dictionary[this.props.feature].corporate.createOrEdit.editTitle} ${getCurrencyWithTenor(
        this.props.params
      )}`
    }
    return dictionary[this.props.feature].corporate.createOrEdit.createTitle
  }

  getSubtitle() {
    if (this.props.params) {
      return `${dictionary[this.props.feature].corporate.createOrEdit.editSubtitle} ${getCurrencyWithTenor(
        this.props.params
      )}.`
    }
    return dictionary[this.props.feature].corporate.createOrEdit.createSubtitle
  }

  getInitialInfo(): IRequestDepositLoanInformationForm {
    const { params, feature } = this.props
    if (params) {
      return {
        ...createInititialRequestInformation(feature),
        requestForId: createCurrencyAndPeriodStringValue(params)
      }
    }
    return createInititialRequestInformation(feature)
  }

  getCurrencyAndTenorDropodownOptions() {
    const { summariesSignatures } = this.props
    return createDefaultCurrencyAndPeriodDropdownOptions().filter(
      currencyAndPeriod => !summariesSignatures.includes(currencyAndPeriod.content)
    )
  }

  render() {
    const {
      isAuthorized,
      feature,
      isFetching,
      errors,
      counterparties,
      history,
      params,
      isSubmitting,
      submittingErrors,
      disclosedDepositsLoans
    } = this.props
    const [error] = errors

    const { values } = this.state

    if (!isAuthorized(getCrudPermission(feature))) {
      return <Unauthorized />
    }
    if (isFetching) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{dictionary[feature].corporate.createOrEdit.htmlPageTitle}</title>
        </Helmet>

        <h1>{this.getTitle()}</h1>
        <p>{this.getSubtitle()}</p>

        <Divider />

        <RequestInformationForm
          handleSubmit={this.handleSubmit}
          requestingIdOptions={this.getCurrencyAndTenorDropodownOptions()}
          counterparties={counterparties}
          handleGoBack={history.goBack}
          updatingItemName={params ? getCurrencyWithTenor(params) : undefined}
          disclosedItems={disclosedDepositsLoans}
          initialValues={this.getInitialInfo()}
          dictionary={dictionary[feature].corporate.createOrEdit}
        />

        {values ? (
          <ConfirmWrapper
            isSubmitting={isSubmitting}
            submittingErrors={submittingErrors}
            handleClose={this.handleCloseSubmit}
            handleConfirm={this.handleConfirmSubmit}
            header="Request information"
          >
            <RequestInformationConfirmContent values={values} isUpdate={params ? true : false} />
          </ConfirmWrapper>
        ) : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IRequestInformationProps => {
  const { feature, match } = ownProps
  const { currency, period } = match.params
  const periodDuration = match.params.periodDuration ? parseInt(match.params.periodDuration, 10) : undefined

  const errorsState = state.get('errors').get('byAction')
  const loadingState = state.get('loader').get('requests')

  const summariesSignatures = state
    .get('depositsAndLoans')
    .get(feature)
    .get('summaries')
    .toJS()
    .map(summary => getCurrencyWithTenor(summary))

  const disclosedDepositLoansById = state
    .get('depositsAndLoans')
    .get(feature)
    .get('disclosedById')
    .toList()
    .toJS()

  const actions: string[] = [CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST]
  if (currency) {
    actions.push(DepositLoanActionType.FetchDisclosedDepositsLoansForCurrencyAndTenorRequest)
  } else {
    actions.push(DepositLoanActionType.FetchDisclosedDepositLoanSummariesRequest)
  }

  return {
    errors: findErrors(errorsState, actions),
    isFetching: loadingSelector(loadingState, actions),
    counterparties: state.get('counterparties').get('counterparties'),
    isSubmitting: loadingSelector(
      state.get('loader').get('requests'),
      [DepositLoanActionType.CreateReqDepositLoanInformationRequest],
      false
    ),
    submittingErrors: findErrors(state.get('errors').get('byAction'), [
      DepositLoanActionType.CreateReqDepositLoanInformationRequest
    ]),
    params: currency ? { currency, period, periodDuration } : undefined,
    summariesSignatures: !currency ? summariesSignatures : [],
    disclosedDepositsLoans: currency
      ? filterDisclosedDepositLoanBasedOnCurrencyPeriodAndPeriodDuration(disclosedDepositLoansById, {
          currency,
          period,
          periodDuration
        })
      : []
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  connect<IRequestInformationProps, IRequestInformationActions>(mapStateToProps, {
    createRequestInformation,
    fetchConnectedCounterpartiesAsync,
    clearError,
    fetchDisclosedDepositsLoans,
    fetchDisclosedSummaries
  })
)(RequestInformation)
