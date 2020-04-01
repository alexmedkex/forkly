import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import { Header, Confirm, Button } from 'semantic-ui-react'

import { withCategories, withDocuments, withDocumentTypes } from '../../../document-management/hoc'
import { Category, DocumentType, ProductId, Document } from '../../../document-management/store/types'
import { ApplicationState } from '../../../../store/reducers'
import withLCDocuments from '../../hoc/withLCDocuments'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { CreateLetterOfCreditDocumentRequest, LetterOfCreditActionType } from '../../store/types'
import { getLetterOfCredit } from '../../store/actions'
import { loadingSelector } from '../../../../store/common/selectors'
import { LoadingTransition } from '../../../../components'
import NoPresentationExists from '../../components/presentation/NoPresentationExists'
import AttachNewLetterOfCreditVaktDocumentForm from '../../components/presentation/AttachNewLetterOfCreditVaktDocumentForm'
import Presentation from '../../components/presentation/Presentation'
import { AddNewDocumentModal } from '../../../document-management/components'
import AddNewLetterOfCreditDocumentForm from '../../components/AddNewLetterOfCreditDocumentForm'
import {
  createPresentation,
  removePresentation,
  deletePresentationDocument,
  submitPresentation,
  fetchVaktDocuments
} from '../../store/presentation/actions'
import { ILCPresentation } from '../../types/ILCPresentation'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import { LCPresentationActionType, SubmitPresentation } from '../../store/presentation/types'
import { withLoaders } from '../../../../components/with-loaders'
import { ErrorMessage } from '../../../../components/error-message'
import { ServerError } from '../../../../store/common/types'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { clearError } from '../../../../store/common/actions'
import SubmitPresentationModal from '../../components/presentation/SubmitPresentationModal'
import { IMember } from '../../../members/store/types'
import { PollingService } from '../../../../utils/PollingService'
import { getTasks } from '../../../tasks/store/actions'
import { Task, TaskWithUser, TaskManagementActionType } from '../../../tasks/store/types'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import { IParcel } from '@komgo/types'

const PRODUCT_ID = 'tradeFinance'

interface IProps extends RouteComponentProps<{ id: string }> {
  categories: Category[]
  documentTypes: DocumentType[]
  isLoading: boolean
  letterOfCredit: ILetterOfCredit
  presentations: ILCPresentation[]
  isFetching: boolean
  documents: any
  vaktDocuments: any
  isRemoving: boolean
  isAttaching: boolean
  errors: ServerError[]
  fetchingDocumentError: ServerError[]
  removingError: ServerError[]
  attachingDocumentsError: ServerError[]
  isSubmitting: boolean
  submittingError: ServerError[]
  members: IMember[]
  isFetchingVaktDocuments: boolean
  fetchingVaktDocumentErrors: ServerError[]
  readOnly: boolean
  getLetterOfCredit(params?: any): void
  createPresentation(lcId: string): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  createLCDocumentAsync(createDocumentRequest: CreateLetterOfCreditDocumentRequest): void
  attachLCVaktDocument(lcId: string, presentationId: string, ids: string[]): void
  removePresentation(lcId: string, presentationId: string): void
  clearError(action: string): void
  deletePresentationDocument(lcId: string, presentationId: string, documentId: string): void
  submitPresentation(presentation: ILCPresentation, data: SubmitPresentation): void
  fetchVaktDocuments(lcId: string, presentationId: string): void
  getTasks(params?: {}): any
}

interface IState {
  addNewDocumentModal: boolean
  attachNewDocumentModal: boolean
  activePresentation?: ILCPresentation
  removeModalOpen: boolean
  activeDocument?: Document
  submitPresentationModal: boolean
}

export class LetterOfCreditPresentation extends React.Component<IProps, IState> {
  private pollingService: PollingService

  constructor(props: IProps) {
    super(props)
    this.state = {
      addNewDocumentModal: false,
      attachNewDocumentModal: false,
      removeModalOpen: false,
      submitPresentationModal: false
    }
    this.fetchLCPresentationChanges = this.fetchLCPresentationChanges.bind(this)
    this.pollingService = new PollingService(5000, [this.fetchLCPresentationChanges])
  }

  componentDidMount() {
    this.props.fetchCategoriesAsync(PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(PRODUCT_ID)
    this.props.getLetterOfCredit({ id: this.props.match.params.id, withDocuments: true })
    this.props.getTasks()
  }

  componentDidUpdate(prevProps: IProps) {
    const { isRemoving, removingError, isSubmitting, submittingError, presentations } = this.props
    if (prevProps.isRemoving && !isRemoving && removingError.length === 0) {
      this.removePresentationOrDocumentSuccessfully()
    }
    if (prevProps.isSubmitting && !isSubmitting && submittingError.length === 0) {
      this.submitPresentationSuccessfully()
    }
    if (prevProps.presentations && prevProps.presentations !== presentations) {
      this.checkForMiningPresentations(prevProps.presentations, presentations)
    }
    this.componentDidUpdateIsAttaching(prevProps)
  }

  componentWillUnmount() {
    this.pollingService.stop()
  }

  componentDidUpdateIsAttaching(prevProps: IProps) {
    const { isAttaching, attachingDocumentsError } = this.props
    if (prevProps.isAttaching && !isAttaching && attachingDocumentsError.length === 0) {
      this.attachDocumentSuccessfully()
    }
  }

  submitPresentationSuccessfully() {
    this.setState({
      submitPresentationModal: false,
      activePresentation: null
    })
    this.pollingService.start()
  }

  async fetchLCPresentationChanges() {
    this.props.getLetterOfCredit({ id: this.props.match.params.id, polling: true })
  }

  removePresentationOrDocumentSuccessfully() {
    this.setState({
      removeModalOpen: false,
      activePresentation: null,
      activeDocument: null
    })
  }

  attachDocumentSuccessfully() {
    this.setState({
      attachNewDocumentModal: false,
      activePresentation: null
    })
  }

  checkForMiningPresentations(oldPresentations: ILCPresentation[], presentations: ILCPresentation[]) {
    const miningPresentationsOldProps = oldPresentations.filter(p => !!p.destinationState)
    if (miningPresentationsOldProps.length === 1) {
      const miningPresentations = presentations.filter(p => !!p.destinationState)
      if (miningPresentations.length === 0) {
        this.pollingService.stop()
      }
    }
  }

  toggleDocumentUpload = (presentation: ILCPresentation) => {
    this.setState({
      addNewDocumentModal: !this.state.addNewDocumentModal,
      activePresentation: presentation
    })
  }

  toggleDocumentAttach = (presentation: ILCPresentation) => {
    if (!this.state.attachNewDocumentModal) {
      this.props.fetchVaktDocuments(this.props.match.params.id, presentation.staticId)
    }
    this.setState({
      attachNewDocumentModal: !this.state.attachNewDocumentModal,
      activePresentation: presentation
    })
  }

  closeDocumentUpload = () => {
    this.setState({
      addNewDocumentModal: false,
      activePresentation: null
    })
  }

  handleCreateDocument = (formData: CreateLetterOfCreditDocumentRequest) => {
    formData.context.lcId = this.props.match.params.id
    this.props.createLCDocumentAsync(formData)
    this.closeDocumentUpload()
  }

  handleAttachDocument = (ids: string[]) => {
    this.props.attachLCVaktDocument(this.props.match.params.id, this.state.activePresentation.staticId, ids)
  }

  getParcels(): IParcel[] {
    if (!this.props.letterOfCredit.tradeAndCargoSnapshot) {
      return []
    }
    if (!this.props.letterOfCredit.tradeAndCargoSnapshot.cargo) {
      return []
    }
    if (!this.props.letterOfCredit.tradeAndCargoSnapshot.cargo.parcels) {
      return []
    }
    return this.props.letterOfCredit.tradeAndCargoSnapshot.cargo.parcels
  }

  renderNewDocumentModal() {
    const { activePresentation } = this.state
    const allowedDocumentTypes = ['warrantyOfTitle', 'invoice', 'other', 'letterOfIndemnity']
    const presentationId = activePresentation ? activePresentation.staticId : null
    return (
      <AddNewDocumentModal
        toggleVisible={this.closeDocumentUpload}
        visible={this.state.addNewDocumentModal}
        title="Add document"
      >
        <AddNewLetterOfCreditDocumentForm
          context={{ presentationId }}
          categories={this.props.categories}
          documentTypes={this.props.documentTypes.filter(type => allowedDocumentTypes.includes(type.id))}
          handleSubmit={this.handleCreateDocument}
          parcels={this.getParcels()}
        />
      </AddNewDocumentModal>
    )
  }

  renderAttachDocumentModal(vaktDocuments: any) {
    const { activePresentation } = this.state
    const { isAttaching, isFetchingVaktDocuments, fetchingVaktDocumentErrors, attachingDocumentsError } = this.props
    const presentationId = activePresentation ? activePresentation.staticId : null
    const docs = vaktDocuments && presentationId ? vaktDocuments[presentationId] : null
    return (
      <AttachNewLetterOfCreditVaktDocumentForm
        toggleVisible={this.closeDocumentAttach}
        visible={this.state.attachNewDocumentModal}
        title="Attach Vakt Documents"
        vaktDocuments={docs}
        handleSubmit={this.handleAttachDocument}
        isAttaching={isAttaching}
        isFetchingVaktDocuments={isFetchingVaktDocuments}
        fetchingVaktDocumentErrors={fetchingVaktDocumentErrors}
        attachingDocumentsError={attachingDocumentsError}
      />
    )
  }

  addNewPresentation = () => {
    this.props.createPresentation(this.props.letterOfCredit._id!)
  }

  setRemovePresentation = (show: boolean, presentation?: ILCPresentation) => {
    this.setState({
      removeModalOpen: show,
      activePresentation: show ? presentation : null
    })
  }

  removePresentation = () => {
    this.props.removePresentation(this.props.match.params.id, this.state.activePresentation.staticId)
  }

  toggleDeleteDocument = (presentation?: ILCPresentation, document?: Document) => {
    this.setState({
      activePresentation: presentation || null,
      removeModalOpen: !this.state.removeModalOpen,
      activeDocument: document || null
    })
  }

  deleteDocument = () => {
    const { activePresentation, activeDocument } = this.state
    this.props.deletePresentationDocument(this.props.match.params.id, activePresentation.staticId, activeDocument.id)
  }

  closeDeleteConfirm = () => {
    this.setState({
      activePresentation: null,
      removeModalOpen: false,
      activeDocument: null
    })
    this.props.clearError(LCPresentationActionType.REMOVE_PRESENTATION_REQUEST)
    this.props.clearError(LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_REQUEST)
  }

  closeDocumentAttach = () => {
    this.setState({
      attachNewDocumentModal: false,
      activePresentation: null
    })
    this.props.clearError(LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_REQUEST)
  }

  toggleSubmitPresentationModal = (presentation?: ILCPresentation) => {
    this.setState({
      submitPresentationModal: !this.state.submitPresentationModal,
      activePresentation: presentation || null
    })
    if (!presentation) {
      this.props.clearError(LCPresentationActionType.SUBMIT_PRESENTATION_REQUEST)
    }
  }

  submitPresentation = (presentation: ILCPresentation, data: SubmitPresentation) => {
    this.props.submitPresentation(presentation, data)
  }

  getDeleteConfirmContent(message: string) {
    const { removingError, isRemoving } = this.props
    return (
      <div className="content">
        {isRemoving ? (
          <LoadingTransition title="Removing" marginTop="15px" />
        ) : removingError && removingError.length > 0 ? (
          <ErrorMessage title="Error" error={removingError[0].message} />
        ) : (
          message
        )}
      </div>
    )
  }

  renderConfirmDeletePresentation() {
    const { removeModalOpen, activePresentation, activeDocument } = this.state
    const { isRemoving } = this.props
    if (activePresentation && !activeDocument && removeModalOpen) {
      let message = `Are you sure you want to remove presentation?`
      if (activePresentation.documents && activePresentation.documents.length) {
        message += ' All documents will be deleted also!'
      }
      return (
        <Confirm
          open={removeModalOpen}
          header="Remove presentation"
          content={this.getDeleteConfirmContent(message)}
          onCancel={this.closeDeleteConfirm}
          onConfirm={this.removePresentation}
          cancelButton={<Button disabled={isRemoving}>Cancel</Button>}
          confirmButton={
            <Button disabled={isRemoving} negative={true}>
              Remove
            </Button>
          }
        />
      )
    }
    return null
  }

  renderConfirmDeleteDocument() {
    const { removeModalOpen, activeDocument } = this.state
    const { isRemoving } = this.props
    if (activeDocument && removeModalOpen) {
      return (
        <Confirm
          open={removeModalOpen}
          header="Remove document"
          content={this.getDeleteConfirmContent('Are you sure you want to remove document?')}
          onCancel={this.closeDeleteConfirm}
          onConfirm={this.deleteDocument}
          cancelButton={<Button disabled={isRemoving}>Cancel</Button>}
          confirmButton={
            <Button disabled={isRemoving} negative={true}>
              Remove
            </Button>
          }
        />
      )
    }
    return null
  }

  renderSubmitPresentationModal() {
    const { submitPresentationModal, activePresentation } = this.state
    const { documents, isSubmitting, submittingError, members } = this.props
    if (submitPresentationModal && activePresentation) {
      return (
        <SubmitPresentationModal
          open={this.state.submitPresentationModal}
          toggleSubmitPresentationModal={this.toggleSubmitPresentationModal}
          presentation={activePresentation}
          documents={documents[activePresentation.staticId] || []}
          submitPresentation={this.submitPresentation}
          isSubmitting={isSubmitting}
          submittingError={submittingError}
          members={members}
        />
      )
    }
    return null
  }

  renderAddPresentationButton(presentationsExists: boolean, readOnly: boolean) {
    if (presentationsExists && !readOnly) {
      return <SimpleButton onClick={this.addNewPresentation}>+ Add new presentation</SimpleButton>
    }
    return null
  }

  renderErrorMessage(fetchingDocumentError: ServerError[]) {
    if (fetchingDocumentError && fetchingDocumentError.length > 0) {
      return <ErrorMessage title="LC presentation documents fetching error" error={fetchingDocumentError[0].message} />
    }
    return null
  }

  render() {
    const {
      isFetching,
      documents,
      history,
      match,
      presentations,
      errors,
      fetchingDocumentError,
      readOnly,
      vaktDocuments
    } = this.props
    const presentationsExists = presentations && presentations.length > 0
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
        <Header as="h1" content={`Documents Presentation`} />
        <Header as="h2" content={this.props.letterOfCredit.reference} style={{ marginTop: 0 }} />
        {this.renderErrorMessage(fetchingDocumentError)}
        {!presentationsExists && <NoPresentationExists callback={this.addNewPresentation} readOnly={readOnly} />}
        {presentationsExists
          ? presentations.map(presentation => (
              <Presentation
                presentation={presentation}
                key={presentation.staticId}
                history={history}
                id={match.params.id}
                toggleAddNewDocumentModal={this.toggleDocumentUpload}
                toggleAttachNewDocumentModal={this.toggleDocumentAttach}
                removePresentationHandle={this.setRemovePresentation.bind(this, true, presentation)}
                documents={documents[presentation.staticId] || []}
                openDeleteDocumentConfirm={this.toggleDeleteDocument}
                toggleSubmitPresentationModal={this.toggleSubmitPresentationModal}
                readOnly={readOnly}
              />
            ))
          : null}
        {this.renderAddPresentationButton(presentationsExists, readOnly)}
        {this.renderNewDocumentModal()}
        {this.renderAttachDocumentModal(vaktDocuments)}
        {this.renderConfirmDeletePresentation()}
        {this.renderConfirmDeleteDocument()}
        {this.renderSubmitPresentationModal()}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps) => {
  const letterOfCreditId = ownProps.match.params.id

  const letterOfCredit: ILetterOfCredit =
    state
      .get('lettersOfCredit')
      .get('byId')
      .toJS()[letterOfCreditId] || {}

  let presentations: ILCPresentation[]

  if (letterOfCredit) {
    presentations = state
      .get('lCPresentation')
      .get('byLetterOfCreditReference')
      .toJS()[letterOfCredit.reference]
  }

  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  const documents = state
    .get('lCPresentation')
    .get('documentsByPresentationId')
    .toJS()

  const vaktDocuments = state
    .get('lCPresentation')
    .get('vaktDocuments')
    .toJS()

  let readOnly = true
  const tasks: Task[] = state
    .get('tasks')
    .get('tasks')
    .map((t: TaskWithUser) => t.task)

  if (letterOfCredit) {
    tasks.forEach(task => {
      if (task.context.lcid === letterOfCreditId && task.taskType === LetterOfCreditTaskType.MANAGE_PRESENTATION) {
        readOnly = false
      }
    })
  }

  return {
    letterOfCredit,
    presentations,
    documents,
    vaktDocuments,
    members,
    isRemoving: loadingSelector(
      state.get('loader').get('requests'),
      [
        LCPresentationActionType.REMOVE_PRESENTATION_REQUEST,
        LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_REQUEST
      ],
      false
    ),
    fetchingDocumentError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_REQUEST
    ]),
    removingError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.REMOVE_PRESENTATION_REQUEST,
      LCPresentationActionType.REMOVE_PRESENTATION_DOCUMENT_REQUEST
    ]),
    isSubmitting: loadingSelector(
      state.get('loader').get('requests'),
      [LCPresentationActionType.SUBMIT_PRESENTATION_REQUEST],
      false
    ),
    submittingError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.SUBMIT_PRESENTATION_REQUEST
    ]),
    isFetchingVaktDocuments: loadingSelector(state.get('loader').get('requests'), [
      LCPresentationActionType.FETCH_VAKT_DOCUMENTS_REQUEST
    ]),
    fetchingVaktDocumentErrors: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.FETCH_VAKT_DOCUMENTS_REQUEST
    ]),
    isAttaching: loadingSelector(
      state.get('loader').get('requests'),
      [LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_REQUEST],
      false
    ),
    attachingDocumentsError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.ATTACH_VAKT_DOCUMENTS_REQUEST
    ]),
    readOnly
  }
}

export default compose(
  withLCDocuments,
  withDocuments,
  withCategories,
  withDocumentTypes,
  withRouter,
  withLoaders({
    actions: [LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST, TaskManagementActionType.TASKS_REQUEST]
  }),
  connect(mapStateToProps, {
    getLetterOfCredit,
    createPresentation,
    removePresentation,
    clearError,
    deletePresentationDocument,
    submitPresentation,
    fetchVaktDocuments,
    getTasks
  })
)(LetterOfCreditPresentation)
