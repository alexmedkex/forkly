import * as React from 'react'
import { compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router'
import {
  withPermissions,
  WithPermissionsProps,
  Unauthorized,
  ErrorMessage,
  LoadingTransition,
  withLicenseCheck,
  WithLicenseCheckProps
} from '../../../components'
import { connect } from 'react-redux'
import { withLoaders, WithLoaderProps } from '../../../components/with-loaders'
import { ApplicationState } from '../../../store/reducers'
import { IStandbyLetterOfCredit, StandbyLetterOfCreditTaskType } from '@komgo/types'
import { productLC } from '@komgo/products'
import { Counterparty } from '../../counterparties/store/types'
import { tradeFinanceManager } from '@komgo/permissions'
import { Header, Divider, Segment, Icon } from 'semantic-ui-react'
import FullpageModal from '../../../components/fullpage-modal'
import { FullHeader } from '../../../components/full-header'
import { AgreementView } from '../components/agreement-view'
import { findFinancialInstitutions, findMembersByStatic } from '../../letter-of-credit-legacy/utils/selectors'
import {
  getStandbyLetterOfCredit,
  fetchSBLCDocuments,
  issueStandbyLetterOfCredit,
  rejectStandbyLetterOfCreditRequest
} from '../store/actions'
import { ViewContainer } from '../components/view-container'
import { Preview } from '../components/preview'
import { SidePanel } from '../components/side-panel'
import { IMember } from '../../members/store/types'
import StandbyLetterOfCreditDetails from '../components/standby-letter-of-credit-details/StandbyLetterOfCreditDetails'
import { StandbyLetterOfCreditActionType } from '../store/types'
import { Document } from '../../document-management/store/types'
import { getTasks } from '../../tasks/store/actions'
import { clearError } from '../../../store/common/actions'
import { ReviewDecision, IssueFormValues, IssueForm } from '../components/issue-form'
import { ServerError } from '../../../store/common/types'
import { Confirm } from '../components/confirm-modal'
import { loadingSelector } from '../../../store/common/selectors'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { TaskStatus } from '../../tasks/store/types'
import { ViewConfirm } from '../components/view-confirm-text'
import { HideableButton } from '../components/hideable-button'
import { camelCaseToSentenceCase } from '../../../utils/casings'
import { findActiveFields, isSubmitResponseEnabled, viewSubmitHandler } from '../utils/viewUtils'
import { goBackOrFallBackTo } from '../utils/goBackOrFallback'

interface ViewStandbyLetterOfCreditProps {
  standbyLetterOfCredit: IStandbyLetterOfCredit
  applicant: IMember
  beneficiary: IMember
  standbyLetterOfCreditId: string
  banks: Counterparty[]
  documents: Document[]
  taskType: StandbyLetterOfCreditTaskType | null
  isSubmitting: boolean
  submitErrors: ServerError[]
}

interface ViewStandbyLetterOfCreditActions {
  getStandbyLetterOfCredit: (staticId: string) => void
  fetchSBLCDocuments: (staticId: string) => void
  issueStandbyLetterOfCredit: (standbyLetterOfCredit: IStandbyLetterOfCredit, file: File) => void
  getTasks: () => void
  clearError: (action: string) => null
  rejectStandbyLetterOfCreditRequest: (staticId: string, issuingBankReference: string) => void
}

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    WithLicenseCheckProps,
    RouteComponentProps<any>,
    ViewStandbyLetterOfCreditProps,
    ViewStandbyLetterOfCreditActions {}

interface ViewStandbyLetterOfCreditState {
  openConfirm: boolean
  values: IssueFormValues
}

const submissionActions = [
  StandbyLetterOfCreditActionType.ISSUE_STANDBY_LETTER_OF_CREDIT_REQUEST,
  StandbyLetterOfCreditActionType.REJECT_STANDBY_LETTER_OF_CREDIT_REQUEST
  // other beneficiary ones todo sprint 7
]

export class ViewStandbyLetterOfCredit extends React.Component<IProps, ViewStandbyLetterOfCreditState> {
  constructor(props) {
    super(props)
    this.state = {
      openConfirm: false,
      values: {
        standbyLetterOfCredit: { ...this.props.standbyLetterOfCredit },
        reviewDecision: ReviewDecision.ApproveApplication
      }
    }
  }

  componentDidMount() {
    this.props.getStandbyLetterOfCredit(this.props.standbyLetterOfCreditId)
    this.props.fetchSBLCDocuments(this.props.standbyLetterOfCreditId)
    this.props.getTasks()
  }

  componentDidUpdate(prevProps: IProps) {
    const { standbyLetterOfCredit, isFetching } = this.props
    if (prevProps.isFetching && !isFetching && standbyLetterOfCredit) {
      this.setState({
        values: { ...this.state.values, standbyLetterOfCredit }
      })
    }
  }

  isAuthorized() {
    const { isAuthorized, isLicenseEnabled } = this.props

    if (!isLicenseEnabled(productLC)) {
      return false
    }

    return (
      isAuthorized(tradeFinanceManager.canManageSBLCRequests) ||
      isAuthorized(tradeFinanceManager.canReadReviewSBLC) ||
      isAuthorized(tradeFinanceManager.canCrudReviewSBLC)
    )
  }

  componentWillUnmount() {
    submissionActions.forEach(action => this.props.clearError(action))
  }

  setConfirmModal = (openConfirm: boolean) => this.setState({ openConfirm })

  hideConfirmModal = () => {
    this.setConfirmModal(false)
    submissionActions.forEach(action => this.props.clearError(action))
  }

  onFormChange = (values: IssueFormValues) => this.setState({ values })

  onGoBack = () => {
    goBackOrFallBackTo({ fallbackURL: '/financial-instruments?tab=Standby%20Letters%20of%20Credit' })
  }

  render() {
    const {
      isFetching,
      errors,
      standbyLetterOfCredit,
      banks,
      applicant,
      beneficiary,
      documents,
      isSubmitting,
      submitErrors,
      taskType,
      history,
      issueStandbyLetterOfCredit: issueSBLC,
      rejectStandbyLetterOfCreditRequest: rejectSBLCRequest
    } = this.props
    const { openConfirm, values } = this.state

    if (!this.isAuthorized()) {
      return <Unauthorized />
    }

    const [error] = errors
    if (error) {
      return <ErrorMessage title="View SBLC" error={error} />
    }

    return (
      <>
        <Header>SBLC review</Header>
        <Divider />
        {isFetching ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading SBLC data" />
          </Segment>
        ) : (
          <FullpageModal
            open={true}
            header={() => (
              <FullHeader margin={'0px'} padding={'0px 20px 0px 20px'}>
                <Icon name="arrow left" size="large" onClick={this.onGoBack} style={{ cursor: 'pointer' }} />
                <Header as="h3" style={{ margin: '12px', flexGrow: 2 }}>
                  SBLC review
                  <Header.Subheader>{standbyLetterOfCredit.reference}</Header.Subheader>
                </Header>
                <HideableButton
                  data-test-id="submit-application-button"
                  type="button"
                  disabled={!isSubmitResponseEnabled(values, beneficiary, taskType)}
                  hidden={taskType === null}
                  onClick={() => this.setConfirmModal(true)}
                  primary={true}
                >
                  Submit response
                </HideableButton>
                <HideableButton
                  data-test-id="close-view-sblc"
                  type="button"
                  onClick={this.onGoBack}
                  hidden={taskType !== null}
                >
                  Close
                </HideableButton>
              </FullHeader>
            )}
          >
            <ViewContainer>
              <Preview>
                <Segment id="template" style={{ minWith: '600px', maxWidth: '1024px' }}>
                  <AgreementView
                    letter={values.standbyLetterOfCredit}
                    applicant={applicant}
                    beneficiary={beneficiary}
                    issuingBanks={banks}
                    beneficiaryBanks={banks as any}
                    activeFields={findActiveFields(taskType, values.reviewDecision)}
                  />
                </Segment>
              </Preview>
              <SidePanel>
                <StandbyLetterOfCreditDetails
                  standbyLetterOfCredit={standbyLetterOfCredit}
                  documents={documents}
                  applicant={applicant}
                  beneficiary={beneficiary}
                />
                <IssueForm
                  taskType={taskType}
                  standbyLetterOfCredit={standbyLetterOfCredit}
                  onChange={this.onFormChange}
                  beneficiaryIsMember={beneficiary.isMember}
                />
              </SidePanel>
            </ViewContainer>
            <Confirm
              errors={submitErrors}
              isSubmitting={isSubmitting}
              onCancel={this.hideConfirmModal}
              onSubmit={() => viewSubmitHandler(values, taskType, issueSBLC, rejectSBLCRequest)}
              open={openConfirm}
              title={camelCaseToSentenceCase(values.reviewDecision)}
            >
              <ViewConfirm
                taskType={taskType}
                reviewDecision={values.reviewDecision}
                applicant={applicant}
                standbyLetterOfCredit={values.standbyLetterOfCredit}
              />
            </Confirm>
          </FullpageModal>
        )}
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): ViewStandbyLetterOfCreditProps => {
  const membersArray = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const sblcStaticId = ownProps.match.params.id

  const standbyLetterOfCredit: IStandbyLetterOfCredit =
    state
      .get('standByLettersOfCredit')
      .get('byId')
      .toJS()[sblcStaticId] || {}

  const [task] = state
    .get('tasks')
    .get('tasks')
    .filter(t => t.task.status === TaskStatus.ToDo)
    .filter(t => Object.values(StandbyLetterOfCreditTaskType).includes(t.task.taskType))
    .filter(t => t.task.context.sblcStaticId === sblcStaticId)

  const taskType = task ? (task.task.taskType as StandbyLetterOfCreditTaskType) : null

  let applicant: IMember
  let beneficiary: IMember
  if (standbyLetterOfCredit) {
    // if the task is StandbyLetterOfCreditTaskType.ReviewRequested, initialise issuingBankPostalAddress to original address
    if (taskType === StandbyLetterOfCreditTaskType.ReviewRequested) {
      const myStaticId = state.get('uiState').get('profile').company
      const {
        x500Name: { CN, STREET, L, PC, C }
      }: IMember = membersArray.find((m: IMember) => m.staticId === myStaticId)

      standbyLetterOfCredit.issuingBankPostalAddress = [CN, STREET, L, PC, C].join(', ')
      standbyLetterOfCredit.issuingBankReference = ''
    }
    applicant = findMembersByStatic(membersArray, standbyLetterOfCredit.applicantId)
    beneficiary = findMembersByStatic(membersArray, standbyLetterOfCredit.beneficiaryId)
  }

  const isSubmitting = loadingSelector(state.get('loader').get('requests'), submissionActions, false)

  const submitErrors = findErrors(state.get('errors').get('byAction'), submissionActions)

  return {
    applicant,
    beneficiary,
    standbyLetterOfCredit,
    banks: findFinancialInstitutions(membersArray),
    standbyLetterOfCreditId: sblcStaticId,
    documents: state.get('documents').get('allDocuments'),
    taskType,
    isSubmitting,
    submitErrors
  }
}

export default compose(
  withRouter,
  withPermissions,
  withLicenseCheck,
  connect<ViewStandbyLetterOfCreditProps, ViewStandbyLetterOfCreditActions>(mapStateToProps, {
    getStandbyLetterOfCredit,
    fetchSBLCDocuments,
    issueStandbyLetterOfCredit,
    getTasks,
    clearError,
    rejectStandbyLetterOfCreditRequest
  }),
  withLoaders({
    actions: [
      StandbyLetterOfCreditActionType.FETCH_STANDBY_LETTER_OF_CREDIT_DOCUMENTS_REQUEST,
      StandbyLetterOfCreditActionType.GET_STANDBY_LETTER_OF_CREDIT_REQUEST
    ]
  })
)(ViewStandbyLetterOfCredit)
