import * as React from 'react'
import { compose } from 'redux'
import { connect, Dispatch } from 'react-redux'
import { tradeFinanceManager } from '@komgo/permissions'
import { Header, Form, Button, Message } from 'semantic-ui-react'
import { Formik, FormikProps } from 'formik'
import styled from 'styled-components'
import { withRouter, RouteComponentProps, Prompt } from 'react-router'
import Helmet from 'react-helmet'
import qs from 'qs'

import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  LoadingTransition,
  ErrorMessage
} from '../../../components'
import { IMember, MemberActionType } from '../../members/store/types'
import { ApplicationState } from '../../../store/reducers'
import {
  TRADING_ROLE_OPTIONS,
  TradingRole as TradingRoleEnum,
  initialTradeData,
  initialCargoData,
  TradingRole
} from '../constants'
import { ITradeEnriched, ICreateOrUpdateTrade, TradeActionType } from '../store/types'
import TradeData from '../components/trade-form-fields/TradeData'
import CommodityAndPrice from '../components/trade-form-fields/CommodityAndPrice'
import ContractData from '../components/trade-form-fields/ContractData'
import FormErrors from '../components/trade-form-fields/FormErrors'
import DeliveryTerms from '../components/trade-form-fields/DeliveryTerms'
import Documents from '../components/documents-form-fields/Documents'
import { fetchMembers } from '../../members/store/actions'
import { emptyCounterparty } from '../../letter-of-credit-legacy/constants'
import SubmitConfirm from '../components/trade-form-fields/SubmitConfirm'
import { stringOrNull } from '../../../utils/types'
import { clearError } from '../../../store/common/actions'

import {
  createTrade,
  fetchTradesDashboardData,
  editTrade,
  deleteTrade,
  deleteTradeError,
  fetchTradeWithDocuments
} from '../store/actions'
import { fetchDocumentTypesAsync } from '../../document-management/store/document-types/actions'
import { DocumentType } from '../../document-management/store/types/document-type'
import { addBuyerSellerEnrichedData } from '../utils/displaySelectors'
import { generateInitialFormData, replaceEmptyStringsAndNullWithUndefined } from '../utils/formatters'
import { fetchMovements } from '../store/actions'
import { loadingSelector } from '../../../store/common/selectors'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../../letter-of-credit-legacy/types/ILetterOfCredit'
import DeleteTradeConfirm from '../components/trade-form-fields/DeleteTradeConfirm'
import { validate, createEditTradeValidator } from '../utils/validator'
import { CreditRequirements, IStandbyLetterOfCredit, ICargo, IReceivablesDiscountingInfo, RDStatus } from '@komgo/types'
import { getLatestFinancialInstrumentsForTrade } from '../utils/selectors'
import { User, ServerError } from '../../../store/common/types'
import { canEditTrade, canDeleteTrade, isDisabledFieldForRd, isDisabledFieldForRole } from '../utils/tradeActionUtils'
import { Document } from '../../document-management'
import { isMemberKomgo } from '../../members/store/selectors'
import { sanitiseCreateOrUpdateTrade } from '../utils/sanitiser'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { LetterOfCreditActionType as LegacyLetterOfCreditActionType } from '../../letter-of-credit-legacy/store/types'
import { StandbyLetterOfCreditActionType } from '../../standby-letter-of-credit-legacy/store/types'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { ReceivableDiscountingApplicationActionType } from '../../receivable-discounting-legacy/store/application/types'
import { ReturnContext } from '../../receivable-discounting-legacy/utils/constants'
import { LetterOfCreditActionType, ILetterOfCreditWithData } from '../../letter-of-credit/store/types'
import { getCurrentCompanyStaticId } from '../../../store/common/selectors/state-selectors'

const LEAVE_WARNING = 'You have made changes to this trade. Are you sure you want to leave the page?'

interface CreateOrUpdateTradeProps {
  profile: User
  company: IMember
  members: IMember[]
  documentTypes: DocumentType[]
  documentTypesError: Error
  trade?: ITradeEnriched
  tradeMovements: ICargo[]
  letterOfCredit?: ILetterOfCredit
  standbyLetterOfCredit?: IStandbyLetterOfCredit
  newLetterOfCredit?: ILetterOfCreditWithData
  deleteTradeLoader: boolean
  createEditLoader: boolean
  isUploadingDocs: boolean
  uploadedDocuments: Document[]
  confirmError?: ServerError
  rdInfo?: IReceivablesDiscountingInfo
}

interface CreateOrUpdateTradeActions {
  fetchMembers(params?: {}): void
  fetchDocumentTypesAsync(product: string, categoryId?: string): void
  fetchTradesDashboardData(params?: {}): void
  fetchMovements(id: string): void
  fetchTradeWithDocuments(id: string): void
  createTrade(values: ICreateOrUpdateTrade, profile: User, role: TradingRoleEnum): void
  editTrade(
    id: string,
    values: ICreateOrUpdateTrade,
    sourceId: string,
    profile: User,
    role: TradingRoleEnum,
    returnURL?: string
  ): void
  deleteTrade(id: string): void
  clearError(action: string): void
}

export interface IProps
  extends WithPermissionsProps,
    WithLoaderProps,
    RouteComponentProps<any>,
    CreateOrUpdateTradeProps,
    CreateOrUpdateTradeActions {
  dispatch: Dispatch<any>
}

interface State {
  formik?: FormikProps<ICreateOrUpdateTrade>
  values: ICreateOrUpdateTrade
  openConfirm: boolean
  lcInfoPromp: boolean
  confirmDeleteTradeOpen: boolean
  tradingRole: string
}

const submissionActions = [
  TradeActionType.CREATE_CARGO_REQUEST,
  TradeActionType.CREATE_TRADE_REQUEST,
  TradeActionType.EDIT_CARGO_REQUEST,
  TradeActionType.EDIT_TRADE_REQUEST,
  TradeActionType.DELETE_TRADE_REQUEST,
  TradeActionType.DELETE_CARGO_REQUEST,
  TradeActionType.UPLOAD_TRADE_DOCUMENT_REQUEST
]

const CREATE_TRADE = 'Create trade'

export class CreateOrUpdateTrade extends React.Component<IProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      values: {
        documents: [],
        lawOther: '',
        commodityOther: '',
        eventBaseOther: '',
        deliveryTermsOther: '',
        cargo: initialCargoData as any,
        trade: initialTradeData as any
      },
      openConfirm: false,
      lcInfoPromp: true,
      confirmDeleteTradeOpen: false,
      tradingRole: ''
    }
  }

  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchMembers()
    this.props.fetchDocumentTypesAsync('tradeFinance', 'trade-documents')
    if (id) {
      this.fetchTradeInfo(id)
    }

    if (!this.isEditMode()) {
      this.setState({
        tradingRole: TRADING_ROLE_OPTIONS.BUYER
      })
    } else {
      this.resolveTradingRole()
    }
  }

  componentDidUpdate() {
    const { tradingRole } = this.state
    if (!!tradingRole) {
      return
    }

    this.resolveTradingRole()
  }

  componentWillUnmount() {
    submissionActions.forEach(action => this.props.clearError(action))
  }

  resolveTradingRole() {
    if (this.isEditMode()) {
      const { tradingRole } = this.state
      const { trade, profile } = this.props

      if (!tradingRole && trade && profile) {
        this.setState({
          tradingRole:
            this.props.trade.seller === this.props.profile!.company
              ? TRADING_ROLE_OPTIONS.SELLER
              : TRADING_ROLE_OPTIONS.BUYER
        })
      }
    }
  }

  fetchTradeInfo(id: string) {
    this.props.fetchMovements(id)
    this.props.fetchTradeWithDocuments(id)
    this.props.fetchTradesDashboardData({
      filter: {
        query: { ['_id']: id }
      }
    })
  }

  handleSubmit = (values: ICreateOrUpdateTrade, formik: FormikProps<ICreateOrUpdateTrade>) => {
    formik.setSubmitting(false)
    this.setState({
      formik,
      values,
      openConfirm: true
    })
  }

  handleCancelSubmit = () => {
    this.setState({
      openConfirm: false
    })
    if (this.props.confirmError) {
      submissionActions.forEach(action => this.props.clearError(action))
    }
  }

  handleConfirmSubmit = () => {
    const { tradingRole, values, formik } = this.state

    if (formik) {
      formik.setSubmitting(true)
    }
    const sanitisedFormData = sanitiseCreateOrUpdateTrade(values, tradingRole, this.props.company.staticId)

    if (this.props.match.params.id) {
      const queryParams = new URLSearchParams(this.props.location.search)
      const returnContext = queryParams.get('returnContext')
      const returnId = queryParams.get('returnId')

      let returnURL: string
      if (returnContext === ReturnContext.RDViewRequest && returnId) {
        returnURL = `/receivable-discounting/${returnId}`
      }

      this.props.editTrade(
        this.props.match.params.id,
        sanitisedFormData,
        this.props.trade.sourceId,
        this.props.profile,
        tradingRole === TRADING_ROLE_OPTIONS.SELLER ? TradingRoleEnum.SELLER : TradingRoleEnum.BUYER,
        returnURL
      )
    } else {
      this.props.createTrade(
        sanitisedFormData,
        this.props.profile,
        tradingRole === TRADING_ROLE_OPTIONS.SELLER ? TradingRoleEnum.SELLER : TradingRoleEnum.BUYER
      )
    }
  }

  validate = (values: ICreateOrUpdateTrade) => {
    const { rdInfo } = this.props
    const quoteAcceptedOnTrade = rdInfo && rdInfo.status === RDStatus.QuoteAccepted

    const validator =
      this.isEditMode() && quoteAcceptedOnTrade
        ? createEditTradeValidator(
            generateInitialFormData(
              this.props.trade,
              this.props.tradeMovements,
              this.props.uploadedDocuments,
              this.state.tradingRole,
              this.props.company.x500Name.O
            )
          )
        : validate
    return validator(values)
  }

  getPageTitle() {
    if (this.props.match.params.id) {
      return 'Edit trade'
    }
    return CREATE_TRADE
  }

  toggleLcInfoProps = () => {
    this.setState({
      lcInfoPromp: !this.state.lcInfoPromp
    })
  }

  deleteTradeToggleConfirm = () => {
    this.setState({
      confirmDeleteTradeOpen: !this.state.confirmDeleteTradeOpen
    })
    this.props.dispatch(deleteTradeError(null))
  }

  deleteTrade = () => {
    this.props.deleteTrade(this.props.match.params.id)
  }

  switchToTradingRole = (tradingRole: string, formik: FormikProps<ICreateOrUpdateTrade>) => {
    // resetForm synchronously now otherwise the DocumentList component can throw errors due to the
    // document type not being present on Buyer/Seller side
    formik.resetForm()

    if (this.canSwitchTradingRole()) {
      // Set the state of tradingRole
      this.setState(
        {
          tradingRole
        },
        () => {
          // Following lines are required to update the conditional formatted fields that are altered based on the toggle.
          const toggleValueUpdate = generateInitialFormData(
            null,
            this.props.tradeMovements,
            this.props.uploadedDocuments,
            this.state.tradingRole,
            this.props.company.x500Name.O
          )

          if (tradingRole === TRADING_ROLE_OPTIONS.BUYER) {
            formik.setFieldValue('trade.seller', '')
            formik.setFieldValue('trade.buyer', toggleValueUpdate.trade.buyer)
            formik.setFieldValue('trade.creditRequirement', CreditRequirements.StandbyLetterOfCredit)
          } else {
            formik.setFieldValue('trade.buyer', '')
            formik.setFieldValue('trade.seller', toggleValueUpdate.trade.seller)
            formik.setFieldValue('trade.creditRequirement', CreditRequirements.OpenCredit)
          }
        }
      )
    }
  }

  getTradingMembersDropdownOptions = (members: IMember[], company: IMember) => {
    return members
      .filter(
        m =>
          m.staticId &&
          m.x500Name &&
          !m.isFinancialInstitution &&
          m.x500Name.O !== company.x500Name.O &&
          !isMemberKomgo(m)
      )
      .map(member => ({
        value: member.staticId,
        text: member.x500Name.O,
        content: member.x500Name.O
      }))
  }

  canSwitchTradingRole = () => {
    return !this.props.trade ? true : false
  }

  isEditMode = () => {
    return this.props.match.params.id !== undefined
  }

  isDisabled = (field: string) => {
    const { rdInfo, trade } = this.props
    const { tradingRole } = this.state
    if (isDisabledFieldForRole(field, tradingRole)) {
      return true
    }
    if (this.isEditMode() && trade && trade.tradingRole === TradingRole.SELLER && rdInfo) {
      return isDisabledFieldForRd(field, rdInfo.status)
    } else {
      return false
    }
  }

  canEditTrade() {
    if (!this.props.trade) {
      return false
    }
    return canEditTrade(this.props.trade, this.props.rdInfo && this.props.rdInfo.status)
  }
  buttons = (formik: FormikProps<ICreateOrUpdateTrade>, history, initialData) => (
    <>
      <Button
        content="Cancel"
        onClick={e => {
          e.preventDefault()
          history.goBack()
        }}
      />
      {this.isEditMode() &&
        canDeleteTrade(
          initialData.trade,
          this.props.letterOfCredit,
          this.props.standbyLetterOfCredit,
          this.props.newLetterOfCredit
        ) && (
          <Button type="button" onClick={this.deleteTradeToggleConfirm} data-test-id="delete-trade">
            Delete
          </Button>
        )}
      <Button
        primary={true}
        type="submit"
        data-test-id="create-or-update-trade"
        onClick={() => {
          formik.handleSubmit()
          window.scrollTo(0, 0)
        }}
      >
        {this.isEditMode() ? 'Update trade' : CREATE_TRADE}
      </Button>
    </>
  )

  errors = (): string => {
    const { errors, documentTypesError } = this.props
    return errors.length > 0
      ? errors[0].message
      : documentTypesError
        ? documentTypesError.message
        : this.isEditMode() && !this.canEditTrade()
          ? `Can't edit this trade`
          : ''
  }

  render() {
    const {
      isAuthorized,
      members,
      company,
      confirmError,
      match,
      documentTypes,
      isFetching,
      letterOfCredit,
      standbyLetterOfCredit,
      newLetterOfCredit,
      deleteTradeLoader,
      createEditLoader,
      isUploadingDocs,
      history
    } = this.props
    const { id } = match.params
    if (!isAuthorized(tradeFinanceManager.canCrudTrades)) {
      return <Unauthorized />
    }

    if (this.isEditMode() && isFetching) {
      return <LoadingTransition title="Loading Trade" />
    }

    const error = this.errors()
    if (error) {
      return <ErrorMessage title="Something went wrong" error={error} />
    }

    // const initialData = this.findInitialData(this.props.trade)
    const initialData = generateInitialFormData(
      this.props.trade,
      this.props.tradeMovements,
      this.props.uploadedDocuments,
      this.state.tradingRole,
      this.props.company.x500Name.O
    )

    if (!initialData) {
      return null
    }

    const title = this.getPageTitle()
    const tradingMemberDropdownOptions = this.getTradingMembersDropdownOptions(members, company)

    return (
      <StyledPage>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <Formik
          initialValues={initialData}
          onSubmit={this.handleSubmit}
          validate={this.validate}
          validateOnBlur={true}
          validateOnChange={true}
          render={(formik: FormikProps<ICreateOrUpdateTrade>) => (
            <React.Fragment>
              <Prompt when={formik.dirty && !formik.isSubmitting} message={LEAVE_WARNING} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {this.buttons(formik, history, initialData)}
              </div>
              <Header as="h1" content={title} />
              {(letterOfCredit !== undefined ||
                standbyLetterOfCredit !== undefined ||
                newLetterOfCredit !== undefined) && (
                <Message
                  data-test-id="live-financial-instruments-warning"
                  icon="info circle"
                  header="This trade has live financial instrument(s)!"
                  content="Any trade updates will not apply to live financial instrument(s)."
                  style={{ backgroundColor: '#f2f5f8' }}
                />
              )}
              <FormErrors showAllValidations={formik.submitCount > 0} dataTestId="createOrUpdateTradeForm-errors" />
              <Form onSubmit={formik.handleSubmit}>
                <TradeData
                  initialData={initialData}
                  tradingMembersDropdownOptions={tradingMemberDropdownOptions}
                  tradingRole={this.state.tradingRole}
                  switchToTradingRole={this.switchToTradingRole}
                  canSwitchTradingRole={this.canSwitchTradingRole()}
                  isDisabled={this.isDisabled}
                />
                <CommodityAndPrice
                  initialData={initialData}
                  tradingRole={this.state.tradingRole}
                  isDisabled={this.isDisabled}
                />
                <DeliveryTerms isDisabled={this.isDisabled} tradingRole={this.state.tradingRole} />
                <ContractData isDisabled={this.isDisabled} />
                <Documents formik={formik} documentTypes={documentTypes} tradingRole={this.state.tradingRole} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {this.buttons(formik, history, initialData)}
                </div>
              </Form>
            </React.Fragment>
          )}
        />
        <SubmitConfirm
          isSubmitting={createEditLoader}
          isUploadingDocs={isUploadingDocs}
          open={this.state.openConfirm}
          cancelSubmit={this.handleCancelSubmit}
          submit={this.handleConfirmSubmit}
          error={confirmError && confirmError.message}
          trade={this.state.values.trade}
          tradeId={match.params.id}
          role={this.state.tradingRole}
        />
        <DeleteTradeConfirm
          cancel={this.deleteTradeToggleConfirm}
          confirm={this.deleteTrade}
          open={this.state.confirmDeleteTradeOpen}
          tradeId={id}
          error={confirmError && confirmError.message}
          isDeleting={deleteTradeLoader}
        />
      </StyledPage>
    )
  }
}

export const StyledPage = styled.section`
  padding-bottom: 30px;
`

export const mapStateToProps = (state: ApplicationState, ownProps: IProps): CreateOrUpdateTradeProps => {
  const tradeId = ownProps.match.params.id

  let tradeGlobal
  let rdInfo
  if (tradeId) {
    const trade = state
      .get('trades')
      .get('trades')
      .toJS()[tradeId]
    const [tradeEnriched] = addBuyerSellerEnrichedData(
      getCurrentCompanyStaticId(state),
      trade ? [trade] : [],
      state
        .get('members')
        .get('byId')
        .toList()
        .toJS()
    )
    tradeGlobal = tradeEnriched
    rdInfo = state
      .get('receivableDiscountingApplication')
      .get('byId')
      .toList()
      .toJS()
      .find((rdInfo: IReceivablesDiscountingInfo) => trade && rdInfo.rd.tradeReference.sourceId === trade.sourceId)
  }
  const profile = state.get('uiState').get('profile')
  const applicantId = profile!.company
  const emptyCompany = { ...emptyCounterparty, x500Name: { ...emptyCounterparty, O: applicantId } }

  const members = state
    .get('members')
    .get('byStaticId')
    .toList()
    .toJS()

  const company = members.find((m: IMember) => m.staticId === applicantId) || emptyCompany

  const { letterOfCredit, standbyLetterOfCredit, newLetterOfCredit } = getLatestFinancialInstrumentsForTrade(
    state,
    tradeGlobal
  )

  const submissionErrors = findErrors(state.get('errors').get('byAction'), submissionActions)

  return {
    profile,
    company,
    members,
    confirmError: submissionErrors.length > 0 ? submissionErrors[0] : undefined,
    documentTypes: state.get('documentTypes').get('documentTypes'),
    documentTypesError: state.get('documentTypes').get('error'),
    trade: tradeGlobal,
    uploadedDocuments: state
      .get('trades')
      .get('tradeDocuments')
      .toJS(),
    tradeMovements: state
      .get('trades')
      .get('tradeMovements')
      .toJS(),
    letterOfCredit,
    standbyLetterOfCredit,
    newLetterOfCredit,
    deleteTradeLoader: loadingSelector(
      state.get('loader').get('requests'),
      [TradeActionType.DELETE_TRADE_REQUEST],
      false
    ),
    createEditLoader: loadingSelector(state.get('loader').get('requests'), submissionActions, false),
    isUploadingDocs: loadingSelector(
      state.get('loader').get('requests'),
      [TradeActionType.UPLOAD_TRADE_DOCUMENT_REQUEST],
      false
    ),
    rdInfo
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  connect<CreateOrUpdateTradeProps, CreateOrUpdateTradeActions>(mapStateToProps, {
    fetchMembers,
    createTrade,
    fetchDocumentTypesAsync,
    fetchTradesDashboardData,
    editTrade,
    fetchMovements,
    deleteTrade,
    fetchTradeWithDocuments,
    clearError
  }),
  withLoaders({
    actions: [
      TradeActionType.TRADES_REQUEST,
      TradeActionType.TRADE_MOVEMENTS_REQUEST,
      TradeActionType.TRADE_DOCUMENTS_REQUEST,
      TradeActionType.TRADE_REQUEST,
      MemberActionType.FetchMembersRequest,
      ReceivableDiscountingApplicationActionType.FETCH_MULTIPLE_APPLICATION_REQUEST,
      LegacyLetterOfCreditActionType.LETTERS_OF_CREDIT_REQUEST,
      StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTERS_OF_CREDIT_REQUEST,
      LetterOfCreditActionType.FETCH_LETTERS_OF_CREDIT_REQUEST
    ]
  })
)(CreateOrUpdateTrade)
