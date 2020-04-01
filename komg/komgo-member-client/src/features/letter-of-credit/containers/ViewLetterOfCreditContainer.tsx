import * as React from 'react'
import { compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router'

import { connect } from 'react-redux'
import { ServerError } from '../../../store/common/types'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { WithPermissionsProps, withPermissions } from '../../../components/with-permissions'
import { Unauthorized, ErrorMessage, LoadingTransition } from '../../../components'
import { ApplicationState } from '../../../store/reducers'
import { loadingSelector } from '../../../store/common/selectors'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { clearError, clearLoader } from '../../../store/common/actions'
import {
  ILetterOfCredit,
  IDataLetterOfCredit,
  ILetterOfCreditBase,
  IDataLetterOfCreditBase,
  LetterOfCreditTaskType
} from '@komgo/types'
import { ImmutableObject, ImmutableMap } from '../../../utils/types'
import { LetterOfCreditActionType } from '../store/types'
import { Confirm } from '../../standby-letter-of-credit-legacy/components/confirm-modal'
import { issueLetterOfCredit, rejectRequestedLetterOfCredit, getLetterOfCreditWithDocument } from '../store/actions'
import { ViewLetterOfCredit } from '../components/ViewLetterOfCredit'
import { IssueFormData } from '../components/ReviewStandbyLetterOfCreditIssuingBank'
import { ConfirmStandbyLetterOfCreditReview } from '../components/ConfirmStandbyLetterOfCreditReview'
import { ReviewDecision } from '../constants'
import { buildLetterOfCreditBaseFromImmutable } from '../utils/buildLetterOfCreditBaseFromImmutable'
import { getTasks } from '../../tasks/store/actions'
import { TaskManagementActionType, TaskStatus } from '../../tasks/store/types'
import { SPACES } from '@komgo/ui-components'
import { Spacer } from '../../../components/spacer/Spacer'
import { hasSomeLetterOfCreditPermissions } from '../utils/permissions'
import { DocumentActionType, Document, DocumentStateFields } from '../../document-management/store/types'

interface ViewProps {
  isSubmitting: boolean
  submitErrors: ServerError[]
  getDocumentErrors: ServerError[]
  letterOfCreditStaticId: string
  letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>>
  companyStaticId: string
  taskType: LetterOfCreditTaskType | null
  issuanceDocument?: ImmutableMap<DocumentStateFields>
  issuanceDocumentMetadata?: Document
  isFetchingDocument: boolean
}

interface ViewActions {
  clearError: (action: string) => null
  clearLoader: (action: string) => null
  getLetterOfCreditWithDocument: (staticId: string) => void
  issueLetterOfCredit: (staticId: string, data: ILetterOfCreditBase<IDataLetterOfCreditBase>, file: File) => void
  rejectRequestedLetterOfCredit: (
    staticId: string,
    data: ILetterOfCreditBase<IDataLetterOfCreditBase>,
    comment: string
  ) => void
  getTasks: () => void
}

export interface IProps
  extends WithLoaderProps,
    WithPermissionsProps,
    RouteComponentProps<any>,
    ViewProps,
    ViewActions {}

interface IState {
  confirmModalIsOpen: boolean
  issueFormData: IssueFormData
  templateModel: any
}

const submissionActions = [
  LetterOfCreditActionType.ISSUE_LETTER_OF_CREDIT_REQUEST,
  LetterOfCreditActionType.REJECT_LETTER_OF_CREDIT_REQUEST
]

const loadingActions = [LetterOfCreditActionType.GET_LETTER_OF_CREDIT_REQUEST, TaskManagementActionType.TASKS_REQUEST]
const documentLoadingActions = [
  DocumentActionType.FETCH_DOCUMENT_CONTENT_REQUEST,
  DocumentActionType.FETCH_DOCUMENTS_REQUEST
]

export class ViewLetterOfCreditContainer extends React.Component<IProps, IState> {
  constructor(props) {
    super(props)
    this.state = {
      confirmModalIsOpen: false,
      issueFormData: null,
      templateModel: null
    }
  }

  componentDidMount() {
    const { letterOfCreditStaticId } = this.props
    this.props.getLetterOfCreditWithDocument(letterOfCreditStaticId)
    this.props.getTasks()
  }

  componentDidUpdate(prevProps: IProps) {
    const { letterOfCreditStaticId } = this.props
    if (letterOfCreditStaticId !== prevProps.letterOfCreditStaticId) {
      this.props.getLetterOfCreditWithDocument(letterOfCreditStaticId)
      this.props.getTasks()
    }
  }

  componentWillUnmount() {
    submissionActions.forEach(action => this.props.clearError(action))
    loadingActions.forEach(action => this.props.clearLoader(action))
    documentLoadingActions.forEach(action => this.props.clearLoader(action))
  }

  onSubmit = () => {
    const { issueFormData, templateModel } = this.state
    const { comment, file, reviewDecision, ...letterOfCreditData } = issueFormData
    const { letterOfCredit } = this.props

    const letterOfCreditUpdate = buildLetterOfCreditBaseFromImmutable(letterOfCredit, letterOfCreditData, templateModel)

    if (reviewDecision === ReviewDecision.IssueSBLC) {
      this.props.issueLetterOfCredit(this.props.letterOfCreditStaticId, letterOfCreditUpdate, file)
    } else {
      this.props.rejectRequestedLetterOfCredit(this.props.letterOfCreditStaticId, letterOfCreditUpdate, comment)
    }
  }

  render() {
    const {
      isFetching,
      errors,
      isSubmitting,
      submitErrors,
      letterOfCredit,
      issuanceDocument,
      issuanceDocumentMetadata,
      companyStaticId,
      taskType,
      isFetchingDocument,
      isAuthorized,
      getDocumentErrors
    } = this.props

    const { confirmModalIsOpen, issueFormData } = this.state

    if (!hasSomeLetterOfCreditPermissions(isAuthorized)) {
      return (
        <Spacer padding={SPACES.DEFAULT}>
          <Unauthorized />
        </Spacer>
      )
    }

    const [error] = [...errors, ...getDocumentErrors]
    if (error) {
      return (
        <Spacer padding={SPACES.DEFAULT}>
          <ErrorMessage title="View Letter of Credit error" error={error} />
        </Spacer>
      )
    }

    if (isFetching) {
      return <LoadingTransition title="Loading Letter of Credit data" />
    }

    if (!!letterOfCredit.get('issuingDocumentHash') && isFetchingDocument) {
      return <LoadingTransition title="Loading Letter of Credit document" />
    }

    return (
      <>
        <ViewLetterOfCredit
          companyStaticId={companyStaticId}
          letterOfCredit={letterOfCredit}
          issuanceDocument={issuanceDocument}
          issuanceDocumentMetadata={issuanceDocumentMetadata}
          onSubmit={(issueFormData, templateModel) =>
            this.setState({ issueFormData, templateModel, confirmModalIsOpen: true })
          }
          taskType={taskType}
        />
        {issueFormData && (
          <Confirm
            title={issueFormData.reviewDecision === ReviewDecision.IssueSBLC ? 'Issue SBLC' : 'Reject application'}
            errors={submitErrors}
            isSubmitting={isSubmitting}
            open={confirmModalIsOpen}
            onCancel={() => {
              submissionActions.forEach(action => this.props.clearError(action))
              this.setState({ confirmModalIsOpen: false })
            }}
            onSubmit={this.onSubmit}
          >
            <ConfirmStandbyLetterOfCreditReview
              applicant={
                letterOfCredit
                  .get('templateInstance')
                  .get('data')
                  .get('applicant')
                  .toJS() as any
              }
              beneficiary={
                letterOfCredit
                  .get('templateInstance')
                  .get('data')
                  .get('beneficiary')
                  .toJS() as any
              }
              reviewDecision={issueFormData.reviewDecision as ReviewDecision}
            />
          </Confirm>
        )}
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps): ViewProps => {
  const { staticId } = ownProps.match.params

  const isSubmitting = loadingSelector(state.get('loader').get('requests'), submissionActions, false)
  const submitErrors = findErrors(state.get('errors').get('byAction'), submissionActions)
  const companyStaticId = state.get('uiState').get('profile').company

  const letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>> = state
    .get('templatedLettersOfCredit')
    .get('byStaticId')
    .get(staticId)

  const [task] = state
    .get('tasks')
    .get('tasks')
    .filter(t => t.task.status === TaskStatus.ToDo)
    .filter(t => Object.values(LetterOfCreditTaskType).includes(t.task.taskType as LetterOfCreditTaskType))
    .filter(t => t.task.context.staticId === staticId)

  const taskType = task ? (task.task.taskType as LetterOfCreditTaskType) : null

  const isFetchingDocument = loadingSelector(state.get('loader').get('requests'), documentLoadingActions, true)
  const getDocumentErrors = findErrors(state.get('errors').get('byAction'), documentLoadingActions)

  const issuanceDocumentHash = letterOfCredit && letterOfCredit.get('issuingDocumentHash')

  const issuanceDocumentMetadata = state
    .get('documents')
    .get('allDocuments')
    .find(d => d.hash === issuanceDocumentHash)

  return {
    isSubmitting,
    submitErrors,
    letterOfCreditStaticId: staticId,
    letterOfCredit,
    companyStaticId,
    taskType,
    issuanceDocument: state.get('document'),
    issuanceDocumentMetadata,
    isFetchingDocument,
    getDocumentErrors
  }
}

export default compose<any>(
  withRouter,
  withPermissions,
  connect<ViewProps, ViewActions>(mapStateToProps, {
    clearError,
    clearLoader,
    getLetterOfCreditWithDocument,
    issueLetterOfCredit,
    rejectRequestedLetterOfCredit,
    getTasks
  }),
  withLoaders({
    actions: loadingActions
  })
)(ViewLetterOfCreditContainer)
