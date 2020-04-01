import * as React from 'react'
import { Fragment } from 'react'
import Ajv from 'ajv'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { ApplicationState } from '../../../store/reducers'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { tradeFinanceManager } from '@komgo/permissions'
import { Header, Divider, Modal, Button, Segment } from 'semantic-ui-react'
import { fetchConnectedCounterpartiesAsync } from '../../counterparties/store/actions'
import { getTrade, fetchMovements } from '../../trades/store/actions'
import { fetchMembers } from '../../members/store/actions'
import { submitLetterOfCredit, clearLetterOfCreditError } from '../store/actions'
import { loadingSelector } from '../../../store/common/selectors'

import {
  WithPermissionsProps,
  withPermissions,
  Unauthorized,
  ErrorMessage,
  LoadingTransition,
  Wizard
} from '../../../components'
import { STEP, LetterOfCreditValues, emptyCounterparty, TIMER_VALIDATION_RULES } from '../constants'
import {
  ParticipantsStep,
  LetterOfCreditDetailsStep,
  LetterOfCreditTypeStep,
  SummaryOfTradesStep,
  CargoMovementsStep,
  CreateAndReviewStep,
  DropdownOptions
} from '../components'
import { findCounterpartyByStatic, participantDetailsFromMember, selectInitialValues } from '../utils/selectors'
import { findLabel } from '../constants/fieldsByStep'
import { ITradeEnriched, TradeActionType } from '../../trades/store/types'
import { stringOrNull, stringOrUndefined } from '../../../utils/types'
import { addBuyerSellerEnrichedData } from '../../trades/utils/displaySelectors'
import { ILetterOfCredit } from '../types/ILetterOfCredit'
import LETTER_OF_CREDIT_SCHEMA from '../schemas/letter-of-credit.schema.json'
import { Counterparty, CounterpartiesActionType } from '../../counterparties/store/types'
import { IMember, MemberActionType } from '../../members/store/types'
import { formDataCleansing } from '../utils/formDataCleansing'
import { Roles } from '../constants/roles'
import { gradeIsAllowedValue } from '../utils/checkGrade'
import { LetterOfCreditApplicationStateMachine } from '../state-machines/ApplicationStateMachine'
import { createAndGetLetterOfCreditDocument } from '../utils/createAndGetLetterOfCredit'
import { buildLetterOfCreditTemplateFields } from '../utils/buildLetterOfCreditTemplateFields'
import { MemberState } from '../../../features/members/store/types'
import { User } from '../../../store/common/types'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { toFormikErrors } from '../../../utils/validator'
import { validate as validateTimer } from '../../../utils/timer'
import { ITrade, ICargo } from '@komgo/types'

const VALIDATOR = new Ajv({ allErrors: true }).addSchema(LETTER_OF_CREDIT_SCHEMA)

interface LetterOfCreditApplicationState {
  showConfirmationModal: boolean
  formValues?: LetterOfCreditValues
  isSubmitting: boolean
}

export interface LetterOfCreditApplicationProps extends WithPermissionsProps, RouteComponentProps<any> {
  applicantCompanyName: string
  applicantCountry: string
  applicantAddress: string
  applicantId: string
  company: string
  trade: ITradeEnriched
  tradeId: string | null
  cargoMovements: ICargo[]
  fetchMembers: (params?: {}) => any
  fetchConnectedCounterpartiesAsync: (params?: {}) => any
  fetchMovements: (id: string) => any
  getTrade: (id: string) => any
  submitLetterOfCredit: (values: ILetterOfCredit) => any
  clearLetterOfCreditError: () => void
  error: stringOrNull
  submissionError: stringOrNull
  counterparties: Counterparty[]
  members: IMember[]
  issuingBankIdOptions: DropdownOptions[]
  beneficiaryIdOptions: DropdownOptions[]
  initialValues: LetterOfCreditValues
  isFetching: boolean
  // TODO LS it isn't used ask to Olek
  // memberState: MemberState
  // user: User
}

export class LetterOfCreditApplication extends React.Component<
  LetterOfCreditApplicationProps,
  LetterOfCreditApplicationState
> {
  constructor(props: LetterOfCreditApplicationProps) {
    super(props)
    this.state = { showConfirmationModal: false, isSubmitting: false }
  }

  componentDidMount() {
    const { isAuthorized, tradeId } = this.props

    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchMembers()
    if (
      tradeId &&
      isAuthorized(tradeFinanceManager.canReadTrades) &&
      isAuthorized(tradeFinanceManager.canManageLCRequests)
    ) {
      this.props.getTrade(tradeId)
      this.props.fetchMovements(tradeId)
    }

    window.onbeforeunload = e => {
      e.returnValue = 'Are you sure?'
      return e
    }
  }

  componentWillUnmount() {
    this.props.clearLetterOfCreditError()

    window.onbeforeunload = () => undefined
  }
  wizardSubmitHandler = (values: LetterOfCreditValues) => {
    this.setState({ showConfirmationModal: true, formValues: values })
  }

  cancelSubmit = () => {
    this.clearErrorIfExists()
    this.setState({ showConfirmationModal: false, isSubmitting: false })
  }

  clearErrorIfExists = () => {
    if (this.props.submissionError) {
      this.props.clearLetterOfCreditError()
    }
  }

  handleSubmitLetterOfCredit = () => {
    const { formValues } = this.state
    this.setState({ isSubmitting: true })

    if (formValues) {
      const letterOfCreditData: ILetterOfCredit = formDataCleansing(formValues)
      this.clearErrorIfExists()
      this.props.submitLetterOfCredit(letterOfCreditData)
    }
  }

  loading = () => this.props.isFetching

  isAuthorizedToViewPage = () => {
    const { isAuthorized, tradeId } = this.props
    return (
      isAuthorized(tradeFinanceManager.canManageLCRequests) &&
      (tradeId ? isAuthorized(tradeFinanceManager.canReadTrades) : true)
    )
  }

  renderModalContent = (trade: ITradeEnriched | undefined, issuingBankName: stringOrUndefined) => {
    const { submissionError } = this.props

    if (submissionError) {
      return <ErrorMessage title="Letter of Credit Submission Error" error={submissionError} />
    } else {
      return (
        <>
          You are about to submit an LC application for the financing of{' '}
          {trade ? 'trade #' + trade.buyerEtrmId : 'a new trade'} to {issuingBankName}
        </>
      )
    }
  }

  isDisabledOnSubmission = () => this.state.isSubmitting && !this.props.submissionError

  validate = (values: LetterOfCreditValues) => {
    const isValid = VALIDATOR.validate('http://komgo.io/letter-of-credit', values)
    let errors = this.validateTimer(values)
    if (!isValid) {
      errors = { ...toFormikErrors(VALIDATOR.errors), ...errors }
    }
    return errors
  }

  validateTimer = (values: LetterOfCreditValues) => {
    let error = {}
    if (values.issueDueDateActive) {
      const isValid = validateTimer(values.issueDueDateUnit, values.issueDueDateDuration, TIMER_VALIDATION_RULES)
      if (!isValid) {
        error = { issueDueDateDuration: 'Deadline for response should be between 1 hour and 1 week' }
      }
    }
    return error
  }

  render() {
    const {
      members,
      counterparties,
      trade,
      company,
      error,
      submissionError,
      initialValues,
      cargoMovements
    } = this.props

    const { showConfirmationModal, formValues, isSubmitting } = this.state

    const issuingBankName =
      formValues &&
      participantDetailsFromMember(findCounterpartyByStatic(counterparties, formValues.issuingBankId)).companyName

    // RR todo - we should only have 1 cargo movement anyway so should just be cargoMovement.grade
    const grade = cargoMovements.length > 0 ? cargoMovements[0].grade : undefined
    if (error) {
      return <ErrorMessage title="Letter of Credit Application Error" error={error} />
    }

    if (!this.isAuthorizedToViewPage()) {
      return <Unauthorized />
    }

    return (
      <Fragment>
        <Header>LC application</Header>
        <Helmet>
          <title>Letter of Credit Application</title>
        </Helmet>
        <Divider />
        {this.loading() && !isSubmitting ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading LC application" />
          </Segment>
        ) : (
          <Fragment>
            <Modal size="tiny" open={showConfirmationModal}>
              <Modal.Header>Submit LC application</Modal.Header>
              <Modal.Content>
                {isSubmitting && !submissionError ? (
                  <LoadingTransition title="Submitting LC application" marginTop="0" />
                ) : (
                  this.renderModalContent(trade, issuingBankName)
                )}
              </Modal.Content>
              <Modal.Actions>
                <Button onClick={this.cancelSubmit} content="Cancel" disabled={this.isDisabledOnSubmission()} />
                <Button
                  primary={true}
                  onClick={this.handleSubmitLetterOfCredit}
                  content="Submit application"
                  disabled={this.isDisabledOnSubmission()}
                />
              </Modal.Actions>
            </Modal>
            <Wizard
              initialValues={initialValues}
              onSubmit={this.wizardSubmitHandler}
              validator={this.validate}
              validationSchemaKeyRef="http://komgo.io/letter-of-credit"
              fieldToLabel={findLabel}
              submitting={this.isDisabledOnSubmission()}
              initialStateMachine={LetterOfCreditApplicationStateMachine()}
              leaveWizardWarningText="Are you sure you wish to leave this unsubmitted Letter of Credit application?"
            >
              <Wizard.Page step={STEP.PARTICIPANTS}>
                <ParticipantsStep members={members} counterparties={counterparties} />
              </Wizard.Page>
              <Wizard.Page step={STEP.LC_TYPE}>
                <LetterOfCreditTypeStep grade={grade} />
              </Wizard.Page>
              <Wizard.Page step={STEP.SUMMARY_OF_TRADE}>
                <SummaryOfTradesStep trade={trade} cargos={cargoMovements} company={company} role={Roles.APPLICANT} />
              </Wizard.Page>
              <Wizard.Page step={STEP.LC_DETAILS}>
                <LetterOfCreditDetailsStep />
              </Wizard.Page>
              <Wizard.Page step={STEP.CARGO_MOVEMENTS}>
                <CargoMovementsStep cargos={cargoMovements} />
              </Wizard.Page>
              <Wizard.Page step={STEP.REVIEW}>
                <CreateAndReviewStep
                  createAndGetDocument={createAndGetLetterOfCreditDocument}
                  buildLetterOfCreditFields={(values: LetterOfCreditValues) =>
                    buildLetterOfCreditTemplateFields(values, members, trade, cargoMovements)
                  }
                />
              </Wizard.Page>
            </Wizard>
          </Fragment>
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: LetterOfCreditApplicationProps) => {
  const tradeId = new URLSearchParams(ownProps.location.search).get('tradeId')

  const counterparties = state.get('counterparties').get('counterparties')
  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const applicantId = state.get('uiState').get('profile')!.company

  const me = members.find((m: IMember) => m.staticId === applicantId) || emptyCounterparty

  let tradeEnriched: ITradeEnriched | undefined
  if (tradeId) {
    const trade: ITrade | undefined = state
      .get('trades')
      .get('trades')
      .toJS()[tradeId]

    tradeEnriched = addBuyerSellerEnrichedData(applicantId, trade ? [trade] : [], members)[0]
  }

  const cargoMovements = state
    .get('trades')
    .get('tradeMovements')
    .toJS()

  // This should be deleted when we refactor all error handlers
  const fetchingConnectedCounterpartiesErrors = findErrors(state.get('errors').get('byAction'), [
    CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
  ])
  const counterpartyError =
    fetchingConnectedCounterpartiesErrors.length > 0 ? fetchingConnectedCounterpartiesErrors[0].message : null

  return {
    trade: tradeEnriched,
    tradeId,
    members,
    counterparties,
    cargoMovements,
    applicantId,
    company: state.get('uiState').get('profile')!.company,
    error: state.get('members').get('error') || state.get('trades').get('error') || counterpartyError,
    isFetching: loadingSelector(state.get('loader').get('requests'), [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      TradeActionType.TRADE_REQUEST,
      MemberActionType.FetchMembersRequest,
      TradeActionType.TRADE_MOVEMENTS_REQUEST
    ]),
    submissionError: state.get('lettersOfCredit').get('error'),
    initialValues: selectInitialValues({
      applicantId,
      members: [...counterparties, me],
      tradeEnriched,
      cargoMovements
    })
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  connect(mapStateToProps, {
    fetchConnectedCounterpartiesAsync,
    getTrade,
    submitLetterOfCredit,
    clearLetterOfCreditError,
    fetchMovements,
    fetchMembers
  })
)(LetterOfCreditApplication)
