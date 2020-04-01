import { Divider, Header, Icon, Segment, Button } from 'semantic-ui-react'
import { clearError } from '../../../store/common/actions'
import * as React from 'react'
import styled from 'styled-components'
import { compose } from 'redux'
import { parse } from 'qs'
import {
  Fee,
  Currency,
  DuplicateClause,
  SBLC_SCHEMA_VERSIONS,
  CompanyRoles,
  IStandbyLetterOfCreditBase,
  IStandbyLetterOfCredit,
  ITrade,
  ICargo
} from '@komgo/types'

import { withPermissions, WithPermissionsProps } from '../../../components/with-permissions'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { RouteComponentProps, withRouter } from 'react-router'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'

import { ErrorMessage } from '../../../components/error-message'
import { LoadingTransition } from '../../../components/loading-transition'
import { Unauthorized, WithLicenseCheckProps } from '../../../components'
import { tradeFinanceManager } from '@komgo/permissions'
import { FullpageModal } from '../../../components/fullpage-modal/FullPageModal'
import { FullHeader } from '../../../components/full-header'
import { CreateForm } from '../components/create-form'
import { Confirm } from '../components/confirm-modal'
import { fetchConnectedCounterpartiesAsync } from '../../counterparties/store/actions'
import { CounterpartiesActionType, Counterparty } from '../../counterparties/store/types'
import { IMember, MemberActionType } from '../../members/store/types'
import { findFinancialInstitutions, findByStaticId } from '../../letter-of-credit-legacy/utils/selectors'
import { submitStandbyLetterOfCredit } from '../store/actions'
import { loadingSelector } from '../../../store/common/selectors'
import { ITradeId, StandbyLetterOfCreditActionType } from '../store/types'
import { TradeActionType } from '../../trades/store/types'
import { fetchTradesWithCargos, FindTradeBySourceAndSourceId } from '../../trades/store/actions'
import { AgreementView } from '../components/agreement-view'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { ServerError } from '../../../store/common/types'
import { ViewContainer } from '../components/view-container'
import { SidePanel } from '../components/side-panel'
import { Preview } from '../components/preview'
import { OVERRIDE_STANDARD_TEMPLATE } from '../components/create-form/constants'
import { CreateConfirm } from '../components/create-confirm-text'
import { Link } from 'react-router-dom'
import { isStandbyLetterOfCreditValid } from '../components/create-form/validateStandbyLetterOfCredit'

const ButtonLink = styled(Link)`
  &&&& {
    border: 0;
    padding: 0;
    &:hover,
    :active,
    :visited,
    :focus {
      text-decoration: none;
      box-shadow: none !important;
    }
  }
`

interface StandbyLetterOfCreditProps {
  submitErrors: ServerError[]
  initialValues: IStandbyLetterOfCreditBase
  trade: ITrade
  cargo: ICargo
  tradeId: ITradeId
  applicantId: string
  applicant: IMember
  beneficiary: IMember
  issuingBanks: Counterparty[]
  beneficiaryBanks: IMember[]
  isSubmitting: boolean
}

interface StandbyLetterOfCreditActions {
  submitStandbyLetterOfCredit: (letter: IStandbyLetterOfCreditBase) => any
  fetchConnectedCounterpartiesAsync: (params?: {}) => void
  fetchTradesWithCargos: (params: FindTradeBySourceAndSourceId) => void
  clearError: (action: string) => any
}

export interface IProps
  extends StandbyLetterOfCreditProps,
    StandbyLetterOfCreditActions,
    WithLicenseCheckProps,
    WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any> {}

export interface StandbyLetterOfCreditState {
  openConfirm: boolean
  letter: IStandbyLetterOfCreditBase | IStandbyLetterOfCredit
  isValid: boolean
}

export class CreateStandbyLetterOfCredit extends React.Component<IProps, StandbyLetterOfCreditState> {
  constructor(props) {
    super(props)
    this.state = {
      openConfirm: false,
      letter: {} as any,
      isValid: false
    }
    this.openConfirmModal = this.openConfirmModal.bind(this)
    this.onFormChange = this.onFormChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  componentDidMount() {
    const {
      tradeId: { source, sourceId },
      initialValues
    } = this.props
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchTradesWithCargos({
      source,
      filter: {
        projection: undefined,
        options: {},
        query: { source, sourceId }
      }
    })
    this.setState({ letter: initialValues })
  }

  openConfirmModal(open) {
    this.setState({ openConfirm: open })
  }

  onFormChange(values) {
    this.setState({ letter: { ...values } })
    this.setState({ isValid: isStandbyLetterOfCreditValid(values) as boolean })
  }

  onCancel() {
    this.setState({ openConfirm: false })
    this.props.clearError(StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_REQUEST)
  }

  onSubmit(values) {
    this.props.submitStandbyLetterOfCredit(values)
  }

  render() {
    const {
      isAuthorized,
      isSubmitting,
      isFetching,
      initialValues,
      errors,
      submitErrors,
      trade,
      cargo,
      tradeId,
      applicant,
      beneficiary,
      issuingBanks,
      beneficiaryBanks
    } = this.props

    const { letter, isValid } = this.state
    if (!isAuthorized(tradeFinanceManager.canManageSBLCRequests)) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return <ErrorMessage title="SBLC Request" error={error} />
    }

    const grade = cargo ? cargo.grade : undefined

    return (
      <React.Fragment>
        <Header>SBLC Request</Header>
        <Divider />
        {isFetching ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading SBLC data" />
          </Segment>
        ) : !trade.sourceId ? (
          <ErrorMessage title="Trade Not Found" error={`Trade ${tradeId.source}/${tradeId.sourceId} not found`} />
        ) : (
          <FullpageModal
            open={true}
            header={() => (
              /*TODO LS we need a grid system */
              <FullHeader margin={'0px'} padding={'0px 20px 0px 20px'}>
                <ButtonLink to="/trades">
                  <Icon name="arrow left" size="large" style={{ cursor: 'pointer' }} />
                </ButtonLink>

                <Header as="h3" style={{ margin: '12px', flexGrow: 2 }}>
                  SBLC Application
                  <Header.Subheader>Trade {trade.buyerEtrmId}</Header.Subheader>
                </Header>
                <Button
                  data-test-id="submit-application-button"
                  type="button"
                  disabled={isSubmitting || !isValid}
                  onClick={() => this.openConfirmModal(true)}
                  primary={true}
                >
                  Submit application
                </Button>
              </FullHeader>
            )}
          >
            <ViewContainer>
              <SidePanel>
                <CreateForm
                  initialValues={initialValues}
                  issuingBanks={issuingBanks}
                  beneficiaryBanks={beneficiaryBanks}
                  onChange={this.onFormChange}
                  onSubmit={this.onSubmit}
                />
              </SidePanel>
              <Preview>
                <Segment id="template" style={{ minWith: '600px', maxWidth: '1024px' }}>
                  <AgreementView
                    trade={trade}
                    cargo={cargo}
                    letter={letter}
                    applicant={applicant}
                    beneficiary={beneficiary}
                    issuingBanks={issuingBanks}
                    beneficiaryBanks={beneficiaryBanks}
                    activeFields={[
                      'additionalInformation',
                      'overrideStandardTemplate',
                      'duplicateClause',
                      'feesPayableBy',
                      'expiryDate',
                      'amount',
                      'beneficiaryBankId',
                      'issuingBankId',
                      'contractDate',
                      'contractReference'
                    ]}
                  />
                </Segment>
              </Preview>
            </ViewContainer>
            <Confirm
              title="Submit SBLC application"
              formId="create-standby-letter-of-credit"
              errors={submitErrors}
              isSubmitting={isSubmitting}
              open={this.state.openConfirm}
              onCancel={this.onCancel}
            >
              <CreateConfirm trade={trade} issuingBanks={issuingBanks} letter={letter} />
            </Confirm>
          </FullpageModal>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): StandbyLetterOfCreditProps => {
  const applicantId = state.get('uiState').get('profile').company
  const counterparties = state.get('counterparties').get('counterparties')
  const members: IMember[] = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()
  const { source, sourceId } = parse(ownProps.location.search.replace('?', ''))
  const trades: ITrade[] =
    state
      .get('trades')
      .get('trades')
      .toList()
      .toJS() || []

  const trade: ITrade = trades.find(t => t.source === source && t.sourceId === sourceId) || ({} as any)

  const cargos: ICargo[] =
    state
      .get('trades')
      .get('tradeMovements')
      .toList()
      .toJS() || []
  // Notice: source & sourceId are actual tradeSource and tradeSourceId
  const cargo: ICargo = cargos.find(t => t.source === source && t.sourceId === sourceId) || ({} as any)

  const isSubmitting = loadingSelector(
    state.get('loader').get('requests'),
    [StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_REQUEST],
    false
  )

  const submitErrors = findErrors(state.get('errors').get('byAction'), [
    StandbyLetterOfCreditActionType.SUBMIT_STANDBY_LETTER_OF_CREDIT_REQUEST
  ])

  const applicant = findByStaticId(members, applicantId)
  const beneficiary = findByStaticId(members, trade.seller)

  const amount = parseFloat(Number(trade.quantity * trade.price).toFixed())
  const initialValues: IStandbyLetterOfCreditBase = {
    version: SBLC_SCHEMA_VERSIONS.V1,
    applicantId,
    beneficiaryId: beneficiary ? beneficiary.staticId : undefined,
    issuingBankId: undefined,
    beneficiaryBankId: undefined,
    beneficiaryBankRole: undefined,
    tradeId: { source, sourceId },
    amount,
    expiryDate: undefined,
    availableWith: CompanyRoles.IssuingBank,
    contractDate: undefined,
    contractReference: '',
    currency: Currency.USD,
    duplicateClause: DuplicateClause.Yes,
    feesPayableBy: Fee.Applicant,
    additionalInformation: undefined,
    overrideStandardTemplate: OVERRIDE_STANDARD_TEMPLATE
  }

  return {
    applicantId,
    applicant,
    beneficiary,
    trade,
    cargo,
    tradeId: { source, sourceId },
    initialValues,
    issuingBanks: findFinancialInstitutions<Counterparty>(counterparties),
    beneficiaryBanks: findFinancialInstitutions<IMember>(members),
    isSubmitting,
    submitErrors
  }
}

export default compose<any>(
  withLoaders({
    actions: [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      MemberActionType.FetchMembersRequest,
      TradeActionType.TRADES_REQUEST, // TODO LS refactor to  FETCH_TRADES_REQUEST
      TradeActionType.TRADE_MOVEMENTS_REQUEST // TODO LS refactor to  FETCH_MOVEMENTS_REQUEST
    ]
  }),
  withPermissions,
  withRouter,
  connect<StandbyLetterOfCreditProps, StandbyLetterOfCreditActions>(mapStateToProps, {
    clearError,
    fetchTradesWithCargos,
    fetchConnectedCounterpartiesAsync,
    submitStandbyLetterOfCredit
  })
)(CreateStandbyLetterOfCredit)
