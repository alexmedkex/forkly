import { tradeFinanceManager } from '@komgo/permissions'
import Helmet from 'react-helmet'
import {
  ErrorMessage,
  Unauthorized,
  withPermissions,
  WithPermissionsProps,
  LoadingTransition,
  Wizard
} from '../../../components'
import { fetchConnectedCounterpartiesAsync } from '../../counterparties/store/actions'
import { Counterparty, CounterpartiesActionType } from '../../counterparties/store/types'
import {
  CargoMovementsStep,
  LetterOfCreditDetailsStep,
  LetterOfCreditTypeStep,
  ParticipantsStep,
  ReviewStep,
  SummaryOfTradesStep
} from '../../letter-of-credit-legacy/components'
import { RejectLCForm, STEP } from '../../letter-of-credit-legacy/constants'
import {
  acceptLetterOfCreditAsync,
  changeActionStatus,
  createLetterOfCreditAsync,
  rejectLetterOfCreditAsync
} from '../../letter-of-credit-legacy/store/actions'
import {
  findTasksByLetterOfCreditId,
  prepareStateHistory,
  getTimer
} from '../../letter-of-credit-legacy/utils/selectors'
import { findRole } from '../../financial-instruments/utils/selectors'
import { IMember } from '../../members/store/types'
import { getTasks } from '../../tasks/store/actions'
import { Task, TaskWithUser, TaskManagementActionType } from '../../tasks/store/types'
import { ITradeEnriched } from '../../trades/store/types'
import { addBuyerSellerEnrichedData } from '../../trades/utils/displaySelectors'
import { loadingSelector } from '../../../store/common/selectors'
import { ApplicationState } from '../../../store/reducers'
import { stringOrNull } from '../../../utils/types'
import Ajv from 'ajv'
import { get } from 'lodash'
import { Fragment } from 'react'
import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { compose, Dispatch } from 'redux'
import { Header, Segment } from 'semantic-ui-react'

import LetterOfCreditActions from '../components/actions/LetterOfCreditActions'
import { LetterOfCreditValues } from '../constants'
import { findLabel } from '../constants/fieldsByStep'
import LETTER_OF_CREDIT_SCHEMA from '../schemas/letter-of-credit.schema.json'
import { clearLetterOfCreditError, getLetterOfCredit } from '../store/actions'
import { ActionType, UploadLCForm, IStateTransitionEnriched, LetterOfCreditActionType } from '../store/types'
import { ILetterOfCredit, ILetterOfCreditStatus } from '../types/ILetterOfCredit'
import { selectInitialValuesFromLetterOfCredit } from '../utils/selectors'
import { ILetterOfCreditEnriched } from './LetterOfCreditDashboard'
import StateTransitionSteps from '../components/StateTransitionSteps'
import { getLetterOfCreditDocument } from '../utils/createAndGetLetterOfCredit'
import styled from 'styled-components'
import LCDocumentList from '../components/documents/LCDocumentList'
import {
  LetterOfCreditViewStateMachine,
  initialStateMachineStatesWithoutReviewStep
} from '../state-machines/ViewStateMachine'
import { sentenceCaseWithAcronyms } from '../../../utils/casings'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import Timer from '../../../components/timer/Timer'
import LCTimer from '../components/timer/LCTimer'
import { Roles } from '../constants/roles'
import { ICargo, ITrade } from '@komgo/types'

const VALIDATOR = new Ajv({ allErrors: true }).addSchema(LETTER_OF_CREDIT_SCHEMA)

const Italic = styled.span`
  font-style: italic;
  margin-right: 20px;
`

export interface LetterOfCreditViewProps extends WithPermissionsProps, RouteComponentProps<any> {
  letterOfCredit: ILetterOfCreditEnriched
  actions: ActionType
  applicantCompanyName: string
  applicantCountry: string
  applicantAddress: string
  company: string
  trade?: ITradeEnriched
  tradeId: string | null
  cargoMovements: ICargo[]
  isFetching: boolean
  getLetterOfCredit: (params?: {}) => null
  getTasks: (params?: {}) => null
  fetchMembers: (params?: {}) => null
  fetchConnectedCounterpartiesAsync: (params?: {}) => null
  createLetterOfCreditAsync: (uploadLCFormData: UploadLCForm, id: string) => void
  rejectLetterOfCreditAsync: (RejectLCForm: RejectLCForm, letterOfCredit: ILetterOfCreditEnriched, task: Task) => void
  acceptLetterOfCreditAsync: (letterOfCredit: ILetterOfCreditEnriched) => void
  clearLetterOfCreditError: () => void
  error: stringOrNull
  counterparties: Counterparty[]
  members: IMember[]
  initialValues: LetterOfCreditValues
  dispatch: Dispatch<any>
  tasks: Task[]
  stateHistory: IStateTransitionEnriched[]
  role: string
}

interface IState {
  step: STEP
}
export class LetterOfCreditView extends React.Component<LetterOfCreditViewProps, IState> {
  constructor(props: LetterOfCreditViewProps) {
    super(props)
    const urlSearchParams = new URLSearchParams(props.location.search)
    const step = urlSearchParams.get('step')
    this.state = {
      step: STEP[step] || STEP.SUMMARY_OF_TRADE
    }
  }

  componentDidMount() {
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.getTasks()
    this.props.getLetterOfCredit({ id: this.props.match.params.id })
    this.props.clearLetterOfCreditError()
  }

  restartActions = () => {
    this.props.dispatch(changeActionStatus({ name: null, status: null }))
  }

  loading = () => this.props.isFetching

  isAuthorizedToViewPage = () => {
    const { isAuthorized } = this.props

    return (
      isAuthorized(tradeFinanceManager.canReadReviewIssuedLC) ||
      isAuthorized(tradeFinanceManager.canManageLCRequests) ||
      isAuthorized(tradeFinanceManager.canManageCollections) ||
      isAuthorized(tradeFinanceManager.canManagePresentations) ||
      isAuthorized(tradeFinanceManager.canReadReviewPresentation) ||
      isAuthorized(tradeFinanceManager.canReadReviewLCApp)
    )
  }

  render() {
    const { members, trade, company, error, initialValues, cargoMovements, role, letterOfCredit } = this.props
    const { step } = this.state
    const timerDueDate = getTimer(letterOfCredit)
    if (error) {
      return <ErrorMessage title="Letter of Credit Application Error" error={error} />
    }

    if (!this.isAuthorizedToViewPage()) {
      return <Unauthorized />
    }

    return (
      <StyledPage>
        <Helmet>
          <title>Letter of Credit</title>
        </Helmet>
        <Header as="h1" style={{ marginBottom: 0 }}>
          LC application {letterOfCredit.reference}
        </Header>
        <div>
          <Italic data-test-id="lc-status">{sentenceCaseWithAcronyms(letterOfCredit.status)}</Italic>
          {timerDueDate && letterOfCredit.status === ILetterOfCreditStatus.REQUESTED ? (
            <Timer
              dueDate={timerDueDate}
              render={(dueDateMoment, leftMinutes) => (
                <LCTimer dueDateMoment={dueDateMoment} leftMinutes={leftMinutes} />
              )}
            />
          ) : null}
        </div>
        {this.loading() ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading LC application" />
          </Segment>
        ) : (
          <Fragment>
            <Wizard
              readonly={true}
              initialValues={initialValues}
              validator={VALIDATOR}
              validationSchemaKeyRef="http://komgo.io/letter-of-credit"
              fieldToLabel={findLabel}
              onSubmit={() => null}
              initialStateMachine={LetterOfCreditViewStateMachine({
                step,
                states: initialStateMachineStatesWithoutReviewStep
              })}
            >
              <Wizard.Page step={STEP.PARTICIPANTS}>
                <ParticipantsStep disabled={true} members={members} />
              </Wizard.Page>
              <Wizard.Page step={STEP.LC_TYPE}>
                <LetterOfCreditTypeStep disabled={true} />
              </Wizard.Page>
              <Wizard.Page step={STEP.SUMMARY_OF_TRADE}>
                <SummaryOfTradesStep
                  trade={trade}
                  cargos={cargoMovements}
                  company={company}
                  disabled={true}
                  role={role}
                />
              </Wizard.Page>
              <Wizard.Page step={STEP.LC_DETAILS}>
                <LetterOfCreditDetailsStep disabled={true} />
              </Wizard.Page>
              <Wizard.Page step={STEP.CARGO_MOVEMENTS}>
                <CargoMovementsStep cargos={cargoMovements} />
              </Wizard.Page>
              <Wizard.Page step={STEP.LC_DOCUMENTS}>
                <LCDocumentList />
              </Wizard.Page>
              <Wizard.Page step={STEP.REVIEW}>
                <ReviewStep letterOfCredit={letterOfCredit} getDocument={getLetterOfCreditDocument} />
              </Wizard.Page>
            </Wizard>
            <StateTransitionSteps stateHistory={this.props.stateHistory} />
            <LetterOfCreditActions
              create={this.props.createLetterOfCreditAsync}
              reject={this.props.rejectLetterOfCreditAsync}
              letterOfCredit={this.props.letterOfCredit}
              restartActions={this.restartActions}
              actions={this.props.actions}
              accept={this.props.acceptLetterOfCreditAsync}
              members={this.props.members}
              tasks={this.props.tasks}
              isAuthorized={this.props.isAuthorized}
            />
          </Fragment>
        )}
      </StyledPage>
    )
  }
}

const StyledPage = styled.section`
  @media (min-width: 1251px) {
    width: calc(100% - 200px);
  }
  margin-bottom: 40px;
`

const mapStateToProps = (state: ApplicationState, ownProps: LetterOfCreditViewProps) => {
  const letterOfCreditId = ownProps.match.params.id

  const letter: ILetterOfCredit =
    state
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[letterOfCreditId] || {}

  const tradeId = get(letter, 'tradeAndCargoSnapshot.trade._id')

  const actions: ActionType = state
    .get('lettersOfCredit')
    .get('action')
    .toJS()

  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const company = state.get('uiState').get('profile')!.company

  let tradeEnriched: ITradeEnriched | undefined
  if (tradeId) {
    const trade: ITrade | undefined = letter.tradeAndCargoSnapshot!.trade
    tradeEnriched = addBuyerSellerEnrichedData(company, trade ? [trade] : [], members)[0]
  }

  const cargo = get(letter, 'tradeAndCargoSnapshot.cargo')

  const tasks: Task[] = findTasksByLetterOfCreditId(
    state
      .get('tasks')
      .get('tasks')
      .map((t: TaskWithUser) => t.task),
    get(letter, '_id')
  )

  const stateHistory = prepareStateHistory(letter, members)

  // This should be deleted when we refactor all error handlers
  const fetchingConnectedCounterpartiesErrors = findErrors(state.get('errors').get('byAction'), [
    CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST
  ])
  const counterpartyError =
    fetchingConnectedCounterpartiesErrors.length > 0 ? fetchingConnectedCounterpartiesErrors[0].message : null
  const fetchingNotConnectedCounterpartiesErrors = findErrors(state.get('errors').get('byAction'), [
    CounterpartiesActionType.FETCH_NOT_CONNECTED_COUNTERPARTIES_REQUEST
  ])
  const notConnectedCounterpartyError =
    fetchingNotConnectedCounterpartiesErrors.length > 0 ? fetchingConnectedCounterpartiesErrors[0].message : null

  return {
    letterOfCredit: letter,
    tradeId,
    actions,
    trade: tradeEnriched,
    stateHistory,
    members,
    cargoMovements: cargo ? [cargo] : [],
    company,
    error:
      state.get('members').get('error') ||
      counterpartyError ||
      notConnectedCounterpartyError ||
      state.get('lettersOfCredit').get('error'),
    fetching: state.get('lettersOfCredit').get('fetching'),
    initialValues: selectInitialValuesFromLetterOfCredit(letter, members, tradeId),
    tasks: findTasksByLetterOfCreditId(tasks, get(letter, '_id')),
    isFetching: loadingSelector(state.get('loader').get('requests'), [
      CounterpartiesActionType.FETCH_CONNECTED_COUNTERPARTIES_REQUEST,
      TaskManagementActionType.TASKS_REQUEST,
      LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST
    ]),
    role: findRole(letter, company)
  }
}

export default compose<any>(
  withPermissions,
  withRouter,
  connect(mapStateToProps, {
    fetchConnectedCounterpartiesAsync,
    getTasks,
    clearLetterOfCreditError,
    getLetterOfCredit,
    acceptLetterOfCreditAsync,
    rejectLetterOfCreditAsync,
    createLetterOfCreditAsync
  })
)(LetterOfCreditView)
