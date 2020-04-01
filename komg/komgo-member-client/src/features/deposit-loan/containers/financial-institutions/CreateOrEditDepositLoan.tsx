import * as React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { RouteComponentProps, withRouter } from 'react-router'
import Helmet from 'react-helmet'
import { IDepositLoanResponse, Currency, DepositLoanPeriod } from '@komgo/types'
import _ from 'lodash'

import {
  CreditAppetiteDepositLoanFeature,
  DepositLoanActionType,
  IExtendedDepositLoanResponse,
  IDepositLoanForm,
  RequestType,
  IDepositLoanRequestDocument,
  DepositLoanRequestStatus,
  IExtendRequestDepositLoan,
  DepositLoanDetailsQuery
} from '../../store/types'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { CounterpartiesActionType, Counterparty } from '../../../counterparties/store/types'
import { ApplicationState } from '../../../../store/reducers'
import { WithLoaderProps } from '../../../../components/with-loaders'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  ErrorMessage
} from '../../../../components'
import {
  getDepositLoan,
  fetchDepositsLoans,
  createDepositLoan,
  editDepositLoan,
  fetchRequests,
  declineAllRequests
} from '../../store/actions'
import {
  populateDepoistLoanWithSharedCompanyName,
  getCurrencyWithTenor,
  populateRequestsData,
  findDepositLoanBasedOnCurrencyPeriodAndPeriodDuration
} from '../../utils/selectors'
import { getCrudPermission } from '../../../credit-line/utils/permissions'
import { dictionary } from '../../dictionary'
import { createInitialDepositLoan } from '../../utils/factories'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { loadingSelector } from '../../../../store/common/selectors'
import CreateOrEditDepositLoanForm from '../../components/financial-institutions/create/CreateOrEditDepositLoanForm'
import ConfirmWrapper from '../../../credit-line/components/credit-appetite-shared-components/ConfirmWrapper'
import ConfirmSubmitContent from '../../components/financial-institutions/create/ConfirmSubmitContent'
import { ServerError } from '../../../../store/common/types'
import { clearError } from '../../../../store/common/actions'
import {
  groupRequestByCurrencyAndPeriodStringValue,
  generateSharedDataFromRequests,
  createCurrencyAndPeriodStringValue,
  generateSharedDataFromRequestWhenDepositLoanExists,
  filterOutSharedDepositLoanData
} from '../../utils/formatters'
import DeclineAllRequestContent from '../../components/financial-institutions/create/DeclineAllRequestContent'

const DEFAULT_ACTION = [
  CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
  DepositLoanActionType.FetchDepositsLoansRequest,
  DepositLoanActionType.FetchReqsDepositLoanRequest
]

interface ICreateOrEditDepositLoanProps extends WithLoaderProps {
  id: string
  depositLoan: IExtendedDepositLoanResponse
  depositsLoans: IDepositLoanResponse[]
  counterparties: Counterparty[]
  isSubmitting: boolean
  submittingErrors: ServerError[]
  requests: { [currencyAndTenorStringValue: string]: IExtendRequestDepositLoan[] }
  requestParams?: DepositLoanDetailsQuery
}

interface ICreateOrEditDepositLoanActions {
  getDepositLoan(id: string, feature: CreditAppetiteDepositLoanFeature): void
  fetchConnectedCounterpartiesAsync(params?: {}): void
  fetchDepositsLoans(feature: CreditAppetiteDepositLoanFeature): void
  createDepositLoan(data: IDepositLoanForm, feature: CreditAppetiteDepositLoanFeature): void
  editDepositLoan(data: IDepositLoanForm, id: string, feature: CreditAppetiteDepositLoanFeature): void
  clearError(action: string): void
  fetchRequests(feature: CreditAppetiteDepositLoanFeature, requestType: RequestType): void
  declineAllRequests(requests: string[], feature: CreditAppetiteDepositLoanFeature): void
}

interface IProps
  extends ICreateOrEditDepositLoanProps,
    WithPermissionsProps,
    RouteComponentProps<{ id: string; currency: Currency; period: DepositLoanPeriod; periodDuration?: string }>,
    ICreateOrEditDepositLoanActions {
  feature: CreditAppetiteDepositLoanFeature
}

interface IState {
  values?: IDepositLoanForm
  declineRequests?: IExtendRequestDepositLoan[]
}

export class CreateOrEditDepositLoan extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {}

    this.handleConfirmSubmit = this.handleConfirmSubmit.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCloseSubmit = this.handleCloseSubmit.bind(this)
    this.handleOpenDeclineRequests = this.handleOpenDeclineRequests.bind(this)
    this.handleCloseDeclineRequests = this.handleCloseDeclineRequests.bind(this)
    this.handleConfirmDeclineRequests = this.handleConfirmDeclineRequests.bind(this)
    this.clearAllErrors = this.clearAllErrors.bind(this)
  }

  componentDidMount() {
    this.props.fetchConnectedCounterpartiesAsync()
    this.fetchDepositLoanData()
  }

  componentDidUpdate(oldProps: IProps) {
    const { feature, id } = this.props
    if (oldProps.feature !== feature || id !== oldProps.id) {
      this.fetchDepositLoanData()
    }
  }

  fetchDepositLoanData() {
    const { id, feature } = this.props
    this.props.fetchRequests(feature, RequestType.Received)
    this.props.fetchDepositsLoans(feature)
    if (id) {
      this.props.getDepositLoan(id, feature)
    }
  }

  handleSubmit(values: IDepositLoanForm) {
    // TODO: filter shared info that don't have appetite adn have requestId but also don't have static id
    // chech if static id is passed it should be
    // generateSharedDataFromRequestWhenDepositLoanExists is responsible to create init info for shared part
    this.setState({
      values: filterOutSharedDepositLoanData(values)
    })
  }

  handleConfirmSubmit() {
    if (this.isEdit()) {
      this.props.editDepositLoan(this.state.values, this.props.depositLoan.staticId, this.props.feature)
    } else {
      this.props.createDepositLoan(this.state.values, this.props.feature)
    }
  }

  handleCloseSubmit() {
    this.setState({
      values: undefined
    })
    if (this.props.submittingErrors.length) {
      this.clearAllErrors()
    }
  }

  clearAllErrors() {
    this.props.clearError(DepositLoanActionType.CreateDepositLoanRequest)
    this.props.clearError(DepositLoanActionType.EditDepositLoanRequest)
    this.props.clearError(DepositLoanActionType.DeclineReqsDepositLoanRequest)
  }

  handleOpenDeclineRequests(currencyAndTenor: string) {
    this.setState({
      declineRequests: this.props.requests[currencyAndTenor]
    })
  }

  handleCloseDeclineRequests() {
    this.setState({
      declineRequests: undefined
    })
    if (this.props.submittingErrors.length) {
      this.clearAllErrors()
    }
  }

  handleConfirmDeclineRequests() {
    const { declineRequests } = this.state
    if (declineRequests && declineRequests.length) {
      this.props.declineAllRequests(declineRequests.map(r => r.staticId), this.props.feature)
    }
  }

  getInitialData() {
    const { requestParams } = this.props
    if (requestParams) {
      return this.getInitialDataWhenRequestParamsExists()
    } else {
      return this.getInitialDataWhenRequestParamsNotExists()
    }
  }

  getInitialDataWhenRequestParamsNotExists() {
    const { depositLoan, requests } = this.props
    if (depositLoan) {
      // Edit
      const currencyAndTenor = createCurrencyAndPeriodStringValue({
        currency: depositLoan.currency,
        period: depositLoan.period,
        periodDuration: depositLoan.periodDuration
      })
      return {
        ...depositLoan,
        currencyAndTenor,
        sharedWith: generateSharedDataFromRequestWhenDepositLoanExists(requests[currencyAndTenor] || [], depositLoan)
      } as IDepositLoanForm
    }
    // Create
    return createInitialDepositLoan(this.props.feature) as IDepositLoanForm
  }

  getInitialDataWhenRequestParamsExists() {
    const { depositLoan, requestParams, requests } = this.props
    if (depositLoan) {
      // Edit with requests
      return {
        ...depositLoan,
        currencyAndTenor: createCurrencyAndPeriodStringValue(requestParams),
        sharedWith: generateSharedDataFromRequestWhenDepositLoanExists(
          requests[createCurrencyAndPeriodStringValue(requestParams)] || [],
          depositLoan
        )
      } as IDepositLoanForm
    }
    return {
      // Create with requests
      ...(createInitialDepositLoan(this.props.feature) as IDepositLoanForm),
      ...requestParams,
      currencyAndTenor: createCurrencyAndPeriodStringValue(requestParams),
      sharedWith: generateSharedDataFromRequests(requests[createCurrencyAndPeriodStringValue(requestParams)] || [])
    }
  }

  isEdit() {
    return this.props.depositLoan !== undefined
  }

  render() {
    const {
      feature,
      isFetching,
      errors,
      depositLoan,
      isAuthorized,
      history,
      depositsLoans,
      counterparties,
      isSubmitting,
      submittingErrors,
      requests,
      requestParams
    } = this.props
    const [error] = errors

    if (!isAuthorized(getCrudPermission(feature))) {
      return <Unauthorized />
    }
    if (isFetching) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }

    const isEdit = this.isEdit()
    const title = isEdit ? getCurrencyWithTenor(depositLoan) : 'Add currency and tenor'
    const helmetTitle = `${dictionary[feature].common.title} - ${title}`
    const { values, declineRequests } = this.state

    const currencyAndTenor = depositLoan
      ? createCurrencyAndPeriodStringValue({
          currency: depositLoan.currency,
          period: depositLoan.period,
          periodDuration: depositLoan.periodDuration
        })
      : requestParams
        ? createCurrencyAndPeriodStringValue({
            currency: requestParams.currency,
            period: requestParams.period,
            periodDuration: requestParams.periodDuration
          })
        : null

    return (
      <React.Fragment>
        <Helmet>
          <title>{helmetTitle}</title>
        </Helmet>
        <h1>{title}</h1>

        <CreateOrEditDepositLoanForm
          initialValues={this.getInitialData()}
          isEdit={isEdit}
          handleGoBack={history.goBack}
          handleSubmit={this.handleSubmit}
          depositsLoans={depositsLoans}
          counterparties={counterparties}
          requests={requests}
          requestParams={requestParams}
          handleDeclineRequests={this.handleOpenDeclineRequests}
        />

        {values ? (
          /* TODO: edit body to print declining requests  */
          <ConfirmWrapper
            isSubmitting={isSubmitting}
            submittingErrors={submittingErrors}
            handleClose={this.handleCloseSubmit}
            handleConfirm={this.handleConfirmSubmit}
            header={isEdit ? 'Update information' : 'Add currency and tenor'}
          >
            <ConfirmSubmitContent depositLoan={values} isEdit={isEdit} requests={requests[currencyAndTenor]} />
          </ConfirmWrapper>
        ) : null}

        {declineRequests ? (
          // It is posible to render just one confirm but that will increase complexisty of the render function
          <ConfirmWrapper
            isSubmitting={isSubmitting}
            submittingErrors={submittingErrors}
            handleClose={this.handleCloseDeclineRequests}
            handleConfirm={this.handleConfirmDeclineRequests}
            header="Decline all requests"
          >
            <DeclineAllRequestContent declinedRequests={declineRequests} />
          </ConfirmWrapper>
        ) : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): ICreateOrEditDepositLoanProps => {
  const { id, currency, period } = ownProps.match.params
  const periodDuration = ownProps.match.params.periodDuration
    ? parseInt(ownProps.match.params.periodDuration, 10)
    : null
  const counterparties = state.get('counterparties').get('counterparties')
  const depositLoanByIdState = state
    .get('depositsAndLoans')
    .get(ownProps.feature)
    .get('byId')
  let depositLoan

  if (id) {
    depositLoan = depositLoanByIdState.toJS()[id]
  } else if (currency && depositLoanByIdState.toList().toJS().length > 0) {
    depositLoan = findDepositLoanBasedOnCurrencyPeriodAndPeriodDuration(depositLoanByIdState.toList().toJS(), {
      currency,
      period,
      periodDuration
    })
  }

  const pendingRequests: IDepositLoanRequestDocument[] = state
    .get('depositsAndLoans')
    .get(ownProps.feature)
    .get('requestsById')
    .toList()
    .toJS()
    .filter(request => request.status === DepositLoanRequestStatus.Pending)

  const actions = id ? [...DEFAULT_ACTION, DepositLoanActionType.GetDepositLoanRequest] : DEFAULT_ACTION
  const errorsState = state.get('errors').get('byAction')
  const loadingState = state.get('loader').get('requests')

  return {
    errors: findErrors(state.get('errors').get('byAction'), actions),
    isFetching: loadingSelector(state.get('loader').get('requests'), actions),
    isSubmitting: loadingSelector(
      loadingState,
      [
        DepositLoanActionType.CreateDepositLoanRequest,
        DepositLoanActionType.EditDepositLoanRequest,
        DepositLoanActionType.DeclineReqsDepositLoanRequest
      ],
      false
    ),
    submittingErrors: findErrors(errorsState, [
      DepositLoanActionType.CreateDepositLoanRequest,
      DepositLoanActionType.EditDepositLoanRequest,
      DepositLoanActionType.DeclineReqsDepositLoanRequest
    ]),
    depositLoan: depositLoan ? populateDepoistLoanWithSharedCompanyName(depositLoan, counterparties) : undefined,
    depositsLoans: depositLoanByIdState.toList().toJS(),
    id,
    counterparties: state
      .get('counterparties')
      .get('counterparties')
      .filter(c => !c.isFinancialInstitution && c.x500Name && c.isMember),
    requests: groupRequestByCurrencyAndPeriodStringValue(populateRequestsData(pendingRequests, counterparties)),
    requestParams: currency ? { currency, period, periodDuration } : undefined
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  connect<ICreateOrEditDepositLoanProps, ICreateOrEditDepositLoanActions>(mapStateToProps, {
    getDepositLoan,
    fetchConnectedCounterpartiesAsync,
    fetchDepositsLoans,
    createDepositLoan,
    editDepositLoan,
    clearError,
    fetchRequests,
    declineAllRequests
  })
)(CreateOrEditDepositLoan)
