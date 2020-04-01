import * as React from 'react'
import Helmet from 'react-helmet'
import { compose } from 'redux'
import qs from 'querystring'

import RequestInformationForm from '../../components/corporate/request-information/RequestInformationForm'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  ErrorMessage,
  LoadingTransition
} from '../../../../components'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../../store/reducers'
import { IMember } from '../../../members/store/types'
import {
  createRequestInformation,
  fetchDisclosedCreditLineSummaries,
  fetchDisclosedCreditLines
} from '../../store/actions'
import { fetchConnectedCounterpartiesAsync } from '../../../counterparties/store/actions'
import { Counterparty, CounterpartiesActionType } from '../../../counterparties/store/types'
import { WithLoaderProps } from '../../../../components/with-loaders'
import {
  CreditLineActionType,
  IDisclosedCreditLineSummary,
  IDisclosedCreditLine,
  IProductProps,
  CreditLineType,
  IRequestInformationForm,
  IMailToData,
  IRequestCreditLineForm
} from '../../store/types'
import { Divider } from 'semantic-ui-react'
import { withRouter, RouteComponentProps } from 'react-router'
import { ServerError } from '../../../../store/common/types'
import { loadingSelector } from '../../../../store/common/selectors'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { clearError } from '../../../../store/common/actions'
import { Products } from '../../../document-management/constants/Products'
import { SubProducts } from '../../../document-management/constants/SubProducts'
import { createInitialRequestInforamtion } from '../../utils/factories'
import { findFeature } from '../../utils/creditAppetiteTypes'
import { dictionary } from '../../dictionary'
import { getCrudPermission } from '../../utils/permissions'
import { getCompanyName } from '../../../counterparties/utils/selectors'
import { prepareRequestInfoData } from '../../utils/formatters'
import { ICreateCreditLineRequest } from '@komgo/types'
import ConfirmWrapper from '../../components/credit-appetite-shared-components/ConfirmWrapper'
import RequestInformationConfirmContent from '../../components/corporate/request-information/RequestInformationConfirmContent'

interface IRequestInformationProps extends WithLoaderProps {
  members: IMember[]
  counterparties: Counterparty[]
  isSubmitting: boolean
  submittingErrors: ServerError[]
  id?: string
  memberToUpdate?: IMember
  disclosedCreditLines: IDisclosedCreditLine[]
  feature: CreditLineType
  counterpartyId?: string
}

interface IRequestInformationActions {
  createRequestInformation(data: ICreateCreditLineRequest, mailToData?: IMailToData): void
  fetchConnectedCounterpartiesAsync(params?: {}): void
  clearError(action: string): void
  fetchDisclosedCreditLineSummaries(productId: Products, subProductId: SubProducts): void
  fetchDisclosedCreditLines(productId: Products, subProductId: SubProducts, buyerId: string): void
}

interface IProps
  extends IRequestInformationProps,
    IRequestInformationActions,
    WithPermissionsProps,
    RouteComponentProps<any>,
    IProductProps {}

interface IState {
  values?: IRequestCreditLineForm
}

export class RequestInformation extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.feature !== this.props.feature) {
      this.fetchData()
    }
  }

  fetchData() {
    this.props.fetchConnectedCounterpartiesAsync()
    if (this.props.id) {
      this.props.fetchDisclosedCreditLines(this.props.productId, this.props.subProductId, this.props.id)
    } else {
      this.props.fetchDisclosedCreditLineSummaries(this.props.productId, this.props.subProductId)
    }
  }

  handleSubmit = (values: IRequestCreditLineForm) => {
    this.setState({ values })
  }

  handleConfirmSubmit = () => {
    const { members, memberToUpdate, feature } = this.props
    const { values } = this.state
    const member = members.find(member => member.staticId === values.requestForId) || memberToUpdate
    const { data, mailToInfo } = prepareRequestInfoData(values, feature, getCompanyName(member))
    this.props.createRequestInformation(data, mailToInfo)
  }

  handleCancelSubmit = () => {
    this.setState({ values: undefined })
    if (this.props.submittingErrors.length > 0) {
      this.props.clearError(CreditLineActionType.CreateReqInformationRequest)
    }
  }

  getTitle = () => {
    const { memberToUpdate, feature } = this.props
    return memberToUpdate
      ? `Request an update ${memberToUpdate.x500Name ? `for ${memberToUpdate.x500Name.CN}` : ''}`
      : dictionary[feature].corporate.createOrEdit.createTitle
  }

  getSubtitle = () => {
    const { memberToUpdate, feature } = this.props
    return memberToUpdate
      ? `${dictionary[feature].corporate.createOrEdit.editSubtitle} ${
          memberToUpdate.x500Name ? `on ${memberToUpdate.x500Name.CN}.` : ''
        }`
      : dictionary[feature].corporate.createOrEdit.createSubtitle
  }

  getInitialInfo = (): IRequestCreditLineForm => {
    const { memberToUpdate, productId, subProductId, counterpartyId } = this.props
    if (memberToUpdate) {
      return {
        ...createInitialRequestInforamtion(productId, subProductId, counterpartyId),
        requestForId: memberToUpdate.staticId
      }
    }
    return createInitialRequestInforamtion(productId, subProductId, counterpartyId)
  }

  getCounterpartyDropdownItems = () => {
    return this.props.members
      .filter(member => {
        const fi =
          this.props.feature === CreditLineType.BankLine
            ? member.isFinancialInstitution
            : !member.isFinancialInstitution
        return fi && member.staticId
      })
      .map(member => ({
        text: getCompanyName(member),
        value: member.staticId
      }))
  }

  render() {
    const {
      members,
      counterparties,
      isAuthorized,
      errors,
      isFetching,
      history,
      isSubmitting,
      submittingErrors,
      memberToUpdate,
      disclosedCreditLines,
      feature,
      counterpartyId
    } = this.props
    const [error] = errors
    const { values } = this.state
    if (!isAuthorized(getCrudPermission(feature))) {
      return <Unauthorized />
    }
    if (error) {
      return <ErrorMessage title={dictionary[feature].common.title} error={error} />
    }
    if (isFetching) {
      return <LoadingTransition title={dictionary[feature].common.loadingTitle} />
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
          requestingIdOptions={this.getCounterpartyDropdownItems()}
          counterparties={counterparties}
          handleGoBack={history.goBack}
          updatingItemName={memberToUpdate ? getCompanyName(memberToUpdate) : undefined}
          disclosedItems={disclosedCreditLines}
          initialValues={this.getInitialInfo()}
          dictionary={dictionary[feature].corporate.createOrEdit}
          predefinedRequestFor={counterpartyId && members.find(member => member.staticId === counterpartyId)}
        />

        {values ? (
          <ConfirmWrapper
            isSubmitting={isSubmitting}
            submittingErrors={submittingErrors}
            handleClose={this.handleCancelSubmit}
            handleConfirm={this.handleConfirmSubmit}
            header="Request information"
          >
            <RequestInformationConfirmContent
              member={members.find(member => member.staticId === values.requestForId) || memberToUpdate}
              isUpdate={!!memberToUpdate}
              feature={feature}
            />
          </ConfirmWrapper>
        ) : null}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): IRequestInformationProps => {
  const id = ownProps.match.params.id
  const counterpartyId = qs.parse(ownProps.location.search.replace('?', '')).counterpartyId as string
  const feature = findFeature({ productId: ownProps.productId, subProductId: ownProps.subProductId })

  const members = state
    .get('members')
    .get('byStaticId')
    .toList()
    .toJS()

  const counterpartiesWithAlreadyDisclosedData = Object.values(
    state
      .get('creditLines')
      .get(feature)
      .get('disclosedCreditLineSummariesById')
      .toJS()
  ).map((summary: IDisclosedCreditLineSummary) => summary.counterpartyStaticId)

  const disclosedCreditLines: IDisclosedCreditLine[] = Object.values(
    state
      .get('creditLines')
      .get(feature)
      .get('disclosedCreditLinesById')
      .toJS()
  )

  const company = state.get('uiState').get('profile').company
  const errorsState = state.get('errors').get('byAction')
  const loadingState = state.get('loader').get('requests')

  const actions = id
    ? [
        CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
        CreditLineActionType.FetchDisclosedCreditLinesForCounterpartyRequest
      ]
    : [
        CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
        CreditLineActionType.FetchDisclosedCreditLineSummariesRequest
      ]
  return {
    id,
    counterpartyId,
    errors: findErrors(errorsState, actions),
    isFetching: loadingSelector(loadingState, actions),
    members: members.filter(
      member => company !== member.staticId && !counterpartiesWithAlreadyDisclosedData.includes(member.staticId)
    ),
    memberToUpdate: id ? members.find(member => id === member.staticId) : undefined,
    counterparties: state.get('counterparties').get('counterparties'),
    isSubmitting: loadingSelector(
      state.get('loader').get('requests'),
      [CreditLineActionType.CreateReqInformationRequest],
      false
    ),
    submittingErrors: findErrors(state.get('errors').get('byAction'), [
      CreditLineActionType.CreateReqInformationRequest
    ]),
    disclosedCreditLines,
    feature
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  connect<IRequestInformationProps, IRequestInformationActions>(mapStateToProps, {
    createRequestInformation,
    fetchConnectedCounterpartiesAsync,
    clearError,
    fetchDisclosedCreditLineSummaries,
    fetchDisclosedCreditLines
  })
)(RequestInformation)
