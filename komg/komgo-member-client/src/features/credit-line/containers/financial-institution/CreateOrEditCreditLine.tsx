import * as React from 'react'
import _ from 'lodash'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { compose } from 'redux'
import qs from 'querystring'
import {
  createCreditLine,
  fetchCreditLines,
  getCreditLine,
  editCreditLine,
  fetchReceivedRequests,
  declineRequests
} from '../../store/actions'
import CreateOrEditRiskCoverForm from '../../components/financial-institution/create/CreateOrEditCreditLineForm'
import { loadingSelector } from '../../../../store/common/selectors'
import {
  CreditLineActionType,
  ICreateOrEditCreditLineForm,
  IExtendedCreditLine,
  IExtendedCreditLineRequest,
  IProductProps,
  CreditLineType
} from '../../store/types'
import { ApplicationState } from '../../../../store/reducers'
import { defaultShared } from '../../constants'
import SubmitConfirm from '../../components/financial-institution/create/SubmitConfirm'
import { withRouter, RouteComponentProps } from 'react-router'
import { WithLoaderProps } from '../../../../components/with-loaders'
import { CounterpartiesActionType, Counterparty } from '../../../counterparties/store/types'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import {
  LoadingTransition,
  ErrorMessage,
  withPermissions,
  WithPermissionsProps,
  Unauthorized
} from '../../../../components'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { ServerError } from '../../../../store/common/types'
import { IMember } from '../../../members/store/types'
import { clearError } from '../../../../store/common/actions'
import { populateCreditLineData, groupRequestsByBuyerId, populateRequestsData } from '../../utils/selectors'
import { CreditLineRequestStatus, ICreditLineResponse, ICreditLineRequest } from '@komgo/types'
import {
  cutOutRequestCompaniesThatAreNotDisclosedAnyInfo,
  generateSharedDataFromRequests
} from '../../utils/formatters'
import { getCompanyName } from '../../../counterparties/utils/selectors'
import DeclineAllRequests from '../../components/financial-institution/create/DeclineAllRequests'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { createInitialCreditLine } from '../../utils/factories'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { dictionary } from '../../dictionary'
import { displayDate, dateFormats } from '../../../../utils/date'
import { getCrudPermission } from '../../utils/permissions'

const DEFAULT_ACTION = [
  CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
  CreditLineActionType.FetchCreditLinesRequest,
  CreditLineActionType.FetchRequestsRequest
]

export enum Action {
  CreateNewRiskCover = 'createNew',
  CreateNewFromRequestRiskCover = 'createNewFromRequest',
  EditRiskCover = 'editRiskCover',
  EditRiskCoverFromRequest = 'editRiskCoverFromRequest'
}

interface IProps extends RouteComponentProps<any>, IStateProps, IPropsActions, WithPermissionsProps, IProductProps {}

interface IStateProps extends WithLoaderProps {
  submittingErrors: ServerError[]
  isSubmitting: boolean
  counterparties: Counterparty[]
  id?: string
  creditLine?: IExtendedCreditLine
  counterparty?: IMember
  requestsByCounterpartyId: {
    [counterpartyId: string]: IExtendedCreditLineRequest[]
  }
  isDeclining: boolean
  decliningErrors: ServerError[]
  feature: CreditLineType
  members: IMember[]
  counterpartyId?: string
}

interface IPropsActions {
  fetchCreditLines(productId: Products, subProductId: SubProducts): void
  createCreditLine(data: ICreateOrEditCreditLineForm, buyerName: string): void
  editCreditLine(data: ICreateOrEditCreditLineForm, id: string, buyerName: string): void
  fetchConnectedCounterpartiesAsync(params?: {}): void
  clearError(action: string): void
  getCreditLine(id: string, productId: string, subProductId: string): void
  fetchReceivedRequests(productId: Products, subProductId: SubProducts): void
  declineRequests(productId: Products, subProductId: SubProducts, buyerId: string, requests: string[]): void
}

interface IState {
  openConfirm: boolean
  values?: ICreateOrEditCreditLineForm
  declineRequests?: IExtendedCreditLineRequest[]
}

export class CreateOrEditCreditLine extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      openConfirm: false
    }
  }

  componentDidMount() {
    this.props.fetchConnectedCounterpartiesAsync()
    this.fetchData()
  }

  companyDidUpdate(prevProps: IProps) {
    if (prevProps.feature !== this.props.feature) {
      this.fetchData()
    }
  }

  fetchData = () => {
    const { id, productId, subProductId } = this.props
    this.props.fetchCreditLines(productId, subProductId)
    this.props.fetchReceivedRequests(productId, subProductId)
    if (id) {
      this.props.getCreditLine(id, productId, subProductId)
    }
  }

  getCurrentAction = (): Action => {
    const { id, counterparty, creditLine } = this.props
    if (id) {
      return Action.EditRiskCover
    }
    if (!id && counterparty && creditLine) {
      return Action.EditRiskCoverFromRequest
    }
    if (!id && counterparty && !creditLine) {
      return Action.CreateNewFromRequestRiskCover
    }
    return Action.CreateNewRiskCover
  }

  handleConfirmSubmit = () => {
    const { creditLine, members } = this.props
    const { values } = this.state
    const currentAction = this.getCurrentAction()
    const counterparty = members.find(c => c.staticId === values.counterpartyStaticId)
    if (currentAction === Action.EditRiskCover || currentAction === Action.EditRiskCoverFromRequest) {
      this.props.editCreditLine(values, creditLine.staticId, creditLine.counterpartyName)
    } else {
      this.props.createCreditLine(values, getCompanyName(counterparty))
    }
  }

  handleOpenConfirm = (values: ICreateOrEditCreditLineForm) => {
    this.setState({
      openConfirm: true,
      values: cutOutRequestCompaniesThatAreNotDisclosedAnyInfo(values)
    })
  }

  handleCloseConfirm = () => {
    this.setState({
      openConfirm: false,
      values: undefined
    })
    this.props.clearError(CreditLineActionType.CreateCreditLineRequest)
    this.props.clearError(CreditLineActionType.EditCreditLineRequest)
  }

  handleOpenConfirmForDeclineAllRequests = (declineRequests: IExtendedCreditLineRequest[]) => {
    this.setState({
      declineRequests
    })
  }

  handleConfirmDeclineAllRequests = () => {
    const { declineRequests } = this.state
    if (declineRequests) {
      this.props.declineRequests(
        this.props.productId,
        this.props.subProductId,
        declineRequests[0].counterpartyStaticId,
        declineRequests.map(request => request.staticId)
      )
    }
  }

  handleCloseConfirmDeclineAllRequests = () => {
    this.setState({
      declineRequests: undefined
    })
    this.props.clearError(CreditLineActionType.DeclineAllRequestsRequest)
  }

  getInitialValues = () => {
    const { counterparty, requestsByCounterpartyId, productId, subProductId, counterpartyId } = this.props
    const currentAction = this.getCurrentAction()
    const initialCreditLineValues = createInitialCreditLine(productId, subProductId, counterpartyId)
    if (currentAction === Action.CreateNewFromRequestRiskCover) {
      const sharedCreditLines = generateSharedDataFromRequests(requestsByCounterpartyId[counterparty.staticId] || [])
      return { ...initialCreditLineValues, counterpartyStaticId: counterparty.staticId, sharedCreditLines }
    }
    if (currentAction === Action.EditRiskCoverFromRequest || currentAction === Action.EditRiskCover) {
      return this.getInitialDataForEditFromRequest()
    }
    return initialCreditLineValues
  }

  getInitialDataForEditFromRequest = () => {
    const { creditLine, requestsByCounterpartyId } = this.props
    let { sharedCreditLines } = creditLine
    const requestForSpecificCounterparty = requestsByCounterpartyId[creditLine.counterpartyStaticId] || []
    const sharedCreditLinesFromRequests = requestForSpecificCounterparty
      ? requestForSpecificCounterparty.map(request => {
          const existingSharedInfo = sharedCreditLines.find(
            creditLine => creditLine.sharedWithStaticId === request.companyStaticId
          )
          if (existingSharedInfo) {
            sharedCreditLines = sharedCreditLines.filter(
              creditLine => creditLine.staticId !== existingSharedInfo.staticId
            )
            return {
              ...existingSharedInfo,
              requestStaticId: request.staticId
            }
          }
          return {
            ..._.cloneDeep(defaultShared),
            sharedWithStaticId: request.companyStaticId,
            counterpartyStaticId: creditLine.counterpartyStaticId,
            requestStaticId: request.staticId
          }
        })
      : []
    return {
      ...creditLine,
      creditExpiryDate: creditLine.creditExpiryDate ? displayDate(creditLine.creditExpiryDate, dateFormats.inputs) : '',
      counterpartyStaticId: creditLine.counterpartyStaticId,
      sharedCreditLines: [...sharedCreditLinesFromRequests, ...sharedCreditLines, _.cloneDeep(defaultShared)]
    }
  }

  render() {
    const {
      isSubmitting,
      history,
      isFetching,
      errors,
      counterparties,
      submittingErrors,
      creditLine,
      isAuthorized,
      counterparty,
      requestsByCounterpartyId,
      isDeclining,
      decliningErrors,
      feature,
      members
    } = this.props
    const { openConfirm, values, declineRequests } = this.state
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
    const currentAction = this.getCurrentAction()
    const isEdit = currentAction === Action.EditRiskCover || currentAction === Action.EditRiskCoverFromRequest
    const title =
      isEdit && creditLine
        ? creditLine.counterpartyName
        : dictionary[feature].financialInstitution.createOrEdit.createTitle
    const helmetTitle = `${dictionary[feature].common.title} - ${title}`
    return (
      <React.Fragment>
        <Helmet>
          <title>{helmetTitle}</title>
        </Helmet>
        <h1>{title}</h1>
        <CreateOrEditRiskCoverForm
          initialValues={this.getInitialValues()}
          handleSubmit={this.handleOpenConfirm}
          history={history}
          counterparties={counterparties}
          members={members}
          currentAction={currentAction}
          buyer={counterparty}
          requests={requestsByCounterpartyId}
          handleDeclineAllRequests={this.handleOpenConfirmForDeclineAllRequests}
          feature={feature}
        />
        {values && (
          <SubmitConfirm
            isEdit={isEdit}
            open={openConfirm}
            handleCancel={this.handleCloseConfirm}
            handleConfirm={this.handleConfirmSubmit}
            isSubmitting={isSubmitting}
            submittingError={submittingErrors}
            values={values}
            requests={requestsByCounterpartyId[values.counterpartyStaticId]}
            feature={feature}
          />
        )}
        {declineRequests && (
          <DeclineAllRequests
            open={!!declineRequests}
            handleCancel={this.handleCloseConfirmDeclineAllRequests}
            handleConfirm={this.handleConfirmDeclineAllRequests}
            isSubmitting={isDeclining}
            submittingErrors={decliningErrors}
            requests={declineRequests}
            feature={feature}
          />
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IStateProps => {
  const { id, counterpartyId } = ownProps.match.params
  const query = qs.parse(ownProps.location.search.replace('?', ''))

  const feature = findFeature({ productId: ownProps.productId, subProductId: ownProps.subProductId })

  const errorsState = state.get('errors').get('byAction')
  const loadingState = state.get('loader').get('requests')
  const requests: ICreditLineRequest[] = state
    .get('creditLines')
    .get(feature)
    .get('requestsById')
    .toList()
    .toJS()
  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()
  const creditLines = state
    .get('creditLines')
    .get(feature)
    .get('creditLinesById')
    .toJS()

  let creditLine: IExtendedCreditLine
  if (id && creditLines[id]) {
    creditLine = populateCreditLineData(creditLines[id], members)
  } else if (counterpartyId) {
    const creditLineObj: any = Object.values(creditLines).find(
      (creditLine: ICreditLineResponse) => creditLine.counterpartyStaticId === counterpartyId
    )
    if (creditLineObj) {
      creditLine = populateCreditLineData(creditLineObj, members)
    }
  }

  const actions = id ? [...DEFAULT_ACTION, CreditLineActionType.GetCreditLineRequest] : DEFAULT_ACTION
  return {
    errors: findErrors(errorsState, actions),
    isFetching: loadingSelector(loadingState, actions),
    id,
    counterparty: counterpartyId ? members.find(member => member.staticId === counterpartyId) : undefined,
    requestsByCounterpartyId: groupRequestsByBuyerId(
      populateRequestsData(requests.filter(request => request.status === CreditLineRequestStatus.Pending), members)
    ),
    creditLine,
    isSubmitting: loadingSelector(
      loadingState,
      [CreditLineActionType.CreateCreditLineRequest, CreditLineActionType.EditCreditLineRequest],
      false
    ),
    submittingErrors: findErrors(errorsState, [
      CreditLineActionType.CreateCreditLineRequest,
      CreditLineActionType.EditCreditLineRequest
    ]),
    isDeclining: loadingSelector(loadingState, [CreditLineActionType.DeclineAllRequestsRequest], false),
    decliningErrors: findErrors(errorsState, [CreditLineActionType.DeclineAllRequestsRequest]),
    counterparties: state
      .get('counterparties')
      .get('counterparties')
      .filter(c => !c.isFinancialInstitution && c.x500Name && c.isMember),
    feature,
    members,
    counterpartyId: query.counterpartyId as string
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  connect(mapStateToProps, {
    createCreditLine,
    fetchConnectedCounterpartiesAsync,
    fetchCreditLines,
    clearError,
    getCreditLine,
    editCreditLine,
    fetchReceivedRequests,
    declineRequests
  })
)(CreateOrEditCreditLine)
