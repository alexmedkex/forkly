import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import { tradeFinanceManager } from '@komgo/permissions'
import { DiscrepantForm } from '../../components/presentation/ReviewPresentationDocumentsForm'
import { withDocuments } from '../../../document-management/hoc'
import { ApplicationState } from '../../../../store/reducers'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { LetterOfCreditActionType } from '../../store/types'
import { getLetterOfCredit } from '../../store/actions'
import { LoadingTransition, Unauthorized, withPermissions, WithPermissionsProps } from '../../../../components'
import { ILCPresentation } from '../../types/ILCPresentation'
import { LCPresentationActionType } from '../../store/presentation/types'
import { withLoaders } from '../../../../components/with-loaders'
import { ErrorMessage } from '../../../../components/error-message'
import { ServerError } from '../../../../store/common/types'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { clearError } from '../../../../store/common/actions'
import { Document } from '../../../document-management/store/types'
import { IMember } from '../../../members/store/types'
import PresentationDetails from '../../components/presentation/PresentationDetails'
import { getLcPresentationWithDocuments } from '../../utils/selectors'
import LCPresentationDetailsHeader from '../../components/presentation/LCPresentationDetailsHeader'
import { getTasks } from '../../../tasks/store/actions'
import { Task, TaskWithUser, TaskManagementActionType, TaskStatus } from '../../../tasks/store/types'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import ReviewPresentationDocuments from '../../components/presentation/ReviewPresentationDocuments'
import withDocumentsReview from '../../../review-documents/hoc/withDocumentsReview'
import { loadingSelector } from '../../../../store/common/selectors'
import {
  setPresentationDocumentsCompliant,
  setPresentationDocumentsDiscrepant,
  requestWaiverOfDiscrepancies
} from '../../store/presentation/actions'
import { IFullDocumentReviewResponse } from '../../../review-documents/store/types'

interface IProps extends WithPermissionsProps, RouteComponentProps<{ lcId: string; presentationId: string }> {
  letterOfCredit: ILetterOfCredit
  presentation: ILCPresentation
  isFetching: boolean
  documents: Document[]
  errors: ServerError[]
  fetchingDocumentError: ServerError[]
  members: IMember[]
  task: Task
  documentsReview: IFullDocumentReviewResponse[]
  requestId: string
  isReviewingPresentation: boolean
  reviewingPresentationError: ServerError[]
  getLetterOfCredit(params?: any): void
  getTasks(params?: {}): any
  fetchDocumentsReceivedAsync(idReceivedDocumentsRequest: string, productId: string): void
  setPresentationDocumentsCompliant(presentation: ILCPresentation, lcId: string): void
  clearError(action: string): void
  fetchPresentationDocumentsReceived(lcId: string, presentationId: string): void
  setPresentationDocumentsDiscrepant(presentation: ILCPresentation, lcId: string, data: DiscrepantForm): void
  requestWaiverOfDiscrepancies(presentation: ILCPresentation, lcId: string, data: DiscrepantForm): void
}

export class LetterOfCreditPresentationDetails extends React.Component<IProps> {
  componentDidMount() {
    const { match, presentation, task, documents } = this.props
    const { lcId } = match.params
    if (!presentation || !documents) {
      this.props.getLetterOfCredit({ id: lcId, withDocuments: true })
    }
    this.props.getTasks()
    if (task) {
      this.props.fetchPresentationDocumentsReceived(match.params.lcId, match.params.presentationId)
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { task, match } = this.props
    if (!prevProps.task && task && task.status !== TaskStatus.Done) {
      this.props.fetchPresentationDocumentsReceived(match.params.lcId, match.params.presentationId)
    }
  }

  viewClickHandler = (document: Document) => {
    const { match, history } = this.props
    history.push(`/financial-instruments/letters-of-credit/${match.params.lcId}/documents/${document.id}`)
  }

  reviewClickHandler = (document: Document) => {
    const { documentsReview, location, history, requestId } = this.props
    history.push({
      pathname: `/evaluation`,
      state: {
        requestId,
        documents: documentsReview,
        documentId: document.id,
        sendDocumentsRequestId: requestId,
        redirectBackUrl: location.pathname
      }
    })
  }

  setDocumentsCompliant = () => {
    this.props.setPresentationDocumentsCompliant(this.props.presentation, this.props.match.params.lcId)
  }

  setDocumentsDiscrepant = (data: DiscrepantForm) => {
    this.props.setPresentationDocumentsDiscrepant(this.props.presentation, this.props.match.params.lcId, data)
  }

  reqWaiverOfDiscrepancies = (data: DiscrepantForm) => {
    this.props.requestWaiverOfDiscrepancies(this.props.presentation, this.props.match.params.lcId, data)
  }

  renderReviewPresentation() {
    const {
      presentation,
      documents,
      task,
      documentsReview,
      location,
      history,
      requestId,
      clearError,
      members,
      isReviewingPresentation,
      reviewingPresentationError
    } = this.props
    if (presentation && documents && task && documentsReview.length > 0) {
      return (
        <ReviewPresentationDocuments
          documentsReview={documentsReview}
          history={history}
          location={location}
          setPresentationDocumentsCompliant={this.setDocumentsCompliant}
          presentation={presentation}
          clearError={clearError}
          requestId={requestId}
          setPresentationDocumentsDiscrepant={this.setDocumentsDiscrepant}
          members={members}
          requestWaiverOfDiscrepancies={this.reqWaiverOfDiscrepancies}
          isReviewingPresentation={isReviewingPresentation}
          reviewingPresentationError={reviewingPresentationError}
        />
      )
    }
    return null
  }

  renderPresentationDetails() {
    const { presentation, documents, task, documentsReview, members } = this.props
    if (presentation && documents) {
      return (
        <PresentationDetails
          documents={documents}
          presentation={presentation}
          members={members}
          documentViewClickHandler={this.viewClickHandler}
          documentReviewClickHandler={task && documentsReview.length > 0 ? this.reviewClickHandler : undefined}
          documentsReview={documentsReview}
        />
      )
    }
    return null
  }

  render() {
    const { isFetching, presentation, errors, fetchingDocumentError, members, isAuthorized } = this.props
    if (!isAuthorized(tradeFinanceManager.canReadWriteReviewPresentation)) {
      return <Unauthorized />
    }
    if (errors && errors.length > 0) {
      return <ErrorMessage title="LC presentation fetching error" error={errors[0].message} />
    }
    if (isFetching) {
      return <LoadingTransition title="Loading LC Presentation" />
    }
    return (
      <React.Fragment>
        <Helmet>
          <title>Documents Presentation</title>
        </Helmet>
        <LCPresentationDetailsHeader members={members} presentation={presentation} />
        {fetchingDocumentError &&
          fetchingDocumentError.length > 0 && (
            <ErrorMessage title="LC presentation documents fetching error" error={fetchingDocumentError[0].message} />
          )}
        {this.renderPresentationDetails()}
        {this.renderReviewPresentation()}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps) => {
  const { lcId, presentationId } = ownProps.match.params

  const { letterOfCredit, presentation, documents } = getLcPresentationWithDocuments(state, lcId, presentationId)

  const tasks: Task[] = state
    .get('tasks')
    .get('tasks')
    .map((t: TaskWithUser) => t.task)

  const [task] = tasks.filter(
    t =>
      t.taskType === LetterOfCreditTaskType.REVIEW_PRESENTATION && presentationId === t.context.lcPresentationStaticId
  )

  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  return {
    letterOfCredit,
    presentation,
    documents,
    members,
    task,
    fetchingDocumentError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_REQUEST
    ]),
    isReviewingPresentation: loadingSelector(
      state.get('loader').get('requests'),
      [
        LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_REQUEST,
        LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_REQUEST,
        LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_REQUEST
      ],
      false
    ),
    reviewingPresentationError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_DISCREPANT_REQUEST,
      LCPresentationActionType.SET_PRESENTATION_DOCUMENTS_COMPLIANT_REQUEST,
      LCPresentationActionType.REQ_WAIVER_OF_DISCREPANCIES_REQUEST
    ])
  }
}

export default compose(
  withDocuments,
  withRouter,
  withPermissions,
  withDocumentsReview,
  withLoaders({
    actions: [LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST, TaskManagementActionType.TASKS_REQUEST]
  }),
  connect(mapStateToProps, {
    getLetterOfCredit,
    clearError,
    getTasks,
    setPresentationDocumentsCompliant,
    setPresentationDocumentsDiscrepant,
    requestWaiverOfDiscrepancies
  })
)(LetterOfCreditPresentationDetails)
