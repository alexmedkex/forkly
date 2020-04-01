import * as React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { compose } from 'redux'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { cloneDeep } from 'lodash'

import FullpageModal from '../../../components/fullpage-modal'
import RequestDocumentsHeader from '../components/documents/RequestDocumentsHeader'
import CloseRequestDocuments from '../components/documents/CloseRequestDocuments'
import AddNewDocumentModal from '../components/documents/AddNewDocumentModal'
import AddNewDocumentForm from '../components/documents/AddNewDocumentForm'
import { fetchCounterpartyName } from '../utils/counterpartyHelper'
import { SelectDocumentTypeSectionCard } from '../components/request-documents/SelectDocumentTypeSectionCard'
import { withCategories, withDocumentTypes, withDocuments, withRequests, withDocument } from '../hoc'
import {
  Category,
  DocumentType,
  ProductId,
  Document,
  CreateDocumentRequest,
  CreateRequestRequest,
  Note
} from '../store'
import { withCounterparties } from '../../counterparties/hoc'
import { Counterparty } from '../../counterparties/store/types'
import SelectAutomatchModal from '../components/documents/document-library/SelectAutomatchModal'
import { RequirementsSection } from '../components/request-documents/requirements-section/RequirementsSection'
import { groupBy } from '../components/documents/my-documents/toMap'
import { BottomSheetStatus } from '../../bottom-sheet/store/types'
import DocumentViewContainer, { HeaderActions } from './DocumentViewContainer'
import DocumentSimpleHeader from '../components/documents/DocumentSimpleHeader'
import DocumentSimpleInfo from '../components/documents/DocumentSimpleInfo'
import RequestOptions, { DatePeriod } from '../components/request-documents/RequestOptions'
import { SPACES } from '@komgo/ui-components'
import { withFormik, FormikProps } from 'formik'
import { requestDocumentValidator } from '../utils/validator'
import { NotesSection } from '../components/request-documents/request-notes/NotesSection'
import { StyledSelectTypesAndNotesRow } from '../components/request-documents/StyledSelectTypesAndNotesRow'

const DEFAULT_PRODUCT_ID: ProductId = 'kyc'

export interface IRequestDocumentForm {
  isDeadlineOn: boolean
  sentDocumentRequestTypes: Map<string, Set<string>>
  attachedDocumentsByDocumentTypeId: Map<string, Set<Document>>
  deadlineDateAmount: number
  deadlineDatePeriod: DatePeriod
  deadline?: string
}

export const requestDocumentFormDefaultValue: IRequestDocumentForm = {
  isDeadlineOn: false,
  sentDocumentRequestTypes: new Map(),
  attachedDocumentsByDocumentTypeId: new Map(),
  deadlineDateAmount: 0,
  deadlineDatePeriod: DatePeriod.Days
}

interface Props extends RouteComponentProps<any>, FormikProps<IRequestDocumentForm> {
  categories: Category[]
  documentTypes: DocumentType[]
  counterparties: Counterparty[]
  allDocs: Document[]
  resetLoadedDocument(): void
  fetchConnectedCounterpartiesAsync(): void
  fetchCategoriesAsync(productId: ProductId): void
  fetchDocumentTypesAsync(productId: ProductId, categoryId?: string): void
  createRequestAsync(request: CreateRequestRequest, productId: ProductId): void
  fetchDocumentsAsync(productId: ProductId, optionParams?: string): void
  createDocumentAsync(createDocumentRequest: CreateDocumentRequest, productId: ProductId): void
}

interface State {
  closeModalVisible: boolean
  automatchModalVisible: boolean
  autoMatchDocumentType: DocumentType
  awaitingPendingDocumentWithTypeId: string
  addDocumentModalVisible: boolean
  addDocumentModalDocumentType: DocumentType
  previewDocumentId: string
  noteInput: Note | null
}

export class RequestDocumentsContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      closeModalVisible: false,
      automatchModalVisible: false,
      autoMatchDocumentType: null,
      awaitingPendingDocumentWithTypeId: '',
      addDocumentModalVisible: false,
      addDocumentModalDocumentType: null,
      previewDocumentId: '',
      noteInput: null
    }
  }

  // fuck my life.
  componentDidUpdate() {
    const { awaitingPendingDocumentWithTypeId } = this.state
    const { values } = this.props
    const { attachedDocumentsByDocumentTypeId } = values

    if (awaitingPendingDocumentWithTypeId) {
      const [pendingDocument] = Array.from(attachedDocumentsByDocumentTypeId.get(awaitingPendingDocumentWithTypeId))
      if (pendingDocument) {
        const [registeredDocument] = this.props.allDocs.filter(doc => doc.name === pendingDocument.name)
        if (registeredDocument) {
          const newAttachedDocumentsByDocumentTypeId = attachedDocumentsByDocumentTypeId.set(
            awaitingPendingDocumentWithTypeId,
            new Set([registeredDocument])
          )
          this.setFormikField('attachedDocumentsByDocumentTypeId', newAttachedDocumentsByDocumentTypeId)
          this.setState({
            awaitingPendingDocumentWithTypeId: ''
          })
        }
      }
    }
  }

  componentDidMount() {
    this.props.fetchConnectedCounterpartiesAsync()
    this.props.fetchCategoriesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentTypesAsync(DEFAULT_PRODUCT_ID)
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID)
  }

  render() {
    const { previewDocumentId } = this.state

    return (
      <>
        <CloseRequestDocuments
          content={
            'You are about to close the "Request documents" workflow. ' +
            'Your changes will not be saved. Do you want to continue?'
          }
          onConfirmClose={() => this.handleCloseRequestDocuments()}
          onToggleVisible={() => this.toggleCloseModalVisible()}
          open={this.state.closeModalVisible}
        />
        {this.state.automatchModalVisible && (
          <SelectAutomatchModal
            onConfirmClose={(ids: string[]) => this.handleAutomatchRequestDocuments(ids[0])}
            onToggleVisible={this.toggleAutomatchModalVisible}
            open={this.state.automatchModalVisible}
            allDocs={this.props.allDocs.filter(doc => doc.sharedBy === 'none')}
            category={this.state.autoMatchDocumentType ? this.state.autoMatchDocumentType.category : null}
            documentType={this.state.autoMatchDocumentType ? this.state.autoMatchDocumentType : null}
            openViewDocument={this.handleTogglePreviewDocument}
          />
        )}
        <AddNewDocumentModal
          toggleVisible={() => this.toggleAddDocumentModalVisible(null)}
          visible={this.state.addDocumentModalVisible}
          title={'Add document'}
        >
          <AddNewDocumentForm
            documents={this.props.allDocs}
            categories={this.props.categories}
            documentTypes={this.props.documentTypes}
            handleSubmit={this.handleCreateDocument}
            preselectedCategory={
              this.state.addDocumentModalDocumentType ? this.state.addDocumentModalDocumentType.category.id : ''
            }
            preselectedDocumentType={
              this.state.addDocumentModalDocumentType ? this.state.addDocumentModalDocumentType.id : ''
            }
          />
        </AddNewDocumentModal>
        {previewDocumentId !== '' && (
          <div data-test-id="view-document-modal">
            <DocumentViewContainer
              documentId={previewDocumentId}
              onClose={this.handleTogglePreviewDocument}
              renderHeader={(document: Document, actions: HeaderActions) => (
                <DocumentSimpleHeader document={document} actions={actions} />
              )}
              renderInfoSection={(document: Document) => <DocumentSimpleInfo document={document} />}
            />
          </div>
        )}
        <FullpageModal open={true} header={() => this.renderHeader()}>
          {this.renderContent()}
        </FullpageModal>
      </>
    )
  }

  counterpartyId(): string {
    return this.props.match.params.id
  }

  handleTogglePreviewDocument = (previewDocumentId?: string) => {
    this.setState({
      previewDocumentId: previewDocumentId || ''
    })
    if (!previewDocumentId) {
      this.props.resetLoadedDocument()
    }
  }

  private toggleCloseModalVisible = () => {
    this.setState({ closeModalVisible: !this.state.closeModalVisible })
  }

  private toggleAutomatchModalVisible = (documentType: DocumentType) => {
    this.setState({ automatchModalVisible: !this.state.automatchModalVisible, autoMatchDocumentType: documentType })
  }

  private toggleAddDocumentModalVisible = (documentType: DocumentType) => {
    this.setState({
      addDocumentModalVisible: !this.state.addDocumentModalVisible,
      addDocumentModalDocumentType: documentType
    })
  }

  private renderHeader = () => {
    return (
      <RequestDocumentsHeader
        title={'Request documents'}
        subtitlePrefix={'From'}
        counterpartyName={this.findCounterpartyName()}
        onToggleCloseModal={() => {
          this.toggleCloseModalVisible()
        }}
      />
    )
  }

  private isPossibleToCompleteRequest = () => {
    const val: number[] = Array.from(this.props.values.sentDocumentRequestTypes, ([key, value]) => value.size)
    // If there is any length bigger than 0 in any of the arrays containing doctypes, then we have at least 1 selected
    return val && Math.max(...val) > 0
  }

  private renderContent = () => {
    return (
      <ViewContainer>
        <Body>{this.renderBody()}</Body>
        <Footer>
          <Button
            data-test-id="send-request-button"
            primary={true}
            disabled={!this.isPossibleToCompleteRequest()}
            content="Send request"
            onClick={this.completeRequest}
            style={{ justifySelf: 'flex-end' }}
            type="button"
          />
        </Footer>
      </ViewContainer>
    )
  }

  private completeRequest = () => {
    const { handleSubmit, values, errors } = this.props
    const { deadline, isDeadlineOn } = values
    const notes = this.state.noteInput ? [this.state.noteInput] : []

    handleSubmit()

    if (!errors || Object.values(errors).length === 0) {
      const newDocTypesRequest: any = {
        companyId: this.props.match.params.id,
        types: Array.from(this.getSelectedDocumentTypes()),
        forms: this.getAttachedForms(),
        context: {},
        deadline: isDeadlineOn ? deadline : undefined,
        notes
      }
      this.props.createRequestAsync(newDocTypesRequest, DEFAULT_PRODUCT_ID)
      this.handleCloseRequestDocuments()
    }
  }

  private renderBody = () => {
    return (
      <StyledBodyPanel>
        <StyledSelectTypesAndNotesRow>
          <SelectDocumentTypeSectionCard
            counterSelectedDoctypes={this.getCounterSelectedDoctypes()}
            selectedDocumentTypes={this.getSelectedDocumentTypes()}
            toggleSelectionDocType={this.toggleSelectionDocumentType}
            categories={this.props.categories}
            documentTypes={this.props.documentTypes}
          />
          <NotesSection
            noteInput={this.state.noteInput}
            notes={[]}
            setNoteContent={this.setNoteContent}
            getCounterpartyNameById={this.getCounterpartyNameById}
          />
        </StyledSelectTypesAndNotesRow>
        <RequirementsSection
          selectedDocumentTypes={this.getSelectedDocumentTypes()}
          toggleSelectionDocType={this.toggleSelectionDocumentType}
          documentTypesById={groupBy(this.props.documentTypes, dt => dt.id)}
          documentsByTypeId={groupBy(this.props.allDocs.filter(doc => doc.sharedBy === 'none'), doc => doc.type.id)}
          toggleAddDocumentModalVisible={this.toggleAddDocumentModalVisible}
          toggleAutomatchModalVisible={this.toggleAutomatchModalVisible}
          attachedDocumentsByDocumentTypeId={this.props.values.attachedDocumentsByDocumentTypeId}
          removeAttachedDocument={this.removeAttachedDocument}
          toggleSelectionDocumentType={this.toggleSelectionDocumentType}
          openViewDocument={this.handleTogglePreviewDocument}
        />
        <RequestOptions />
      </StyledBodyPanel>
    )
  }

  private handleCloseRequestDocuments = () => {
    this.setState({ closeModalVisible: false }, () => {
      // TODO: it is possible that we don't have where to go back
      // we should have fallback in that case
      this.props.history.push('/counterparty-docs')
    })
  }

  private handleAutomatchRequestDocuments = (idDocumentSelected: string) => {
    const { autoMatchDocumentType } = this.state

    // Update state for which documentTypes for this request have which document(s) attached to them.
    const newAttachedDocumentsByDocumentTypeId = this.props.values.attachedDocumentsByDocumentTypeId.set(
      autoMatchDocumentType.id,
      this.getUpdatedAttachedDocuments(idDocumentSelected)
    )

    this.setFormikField('attachedDocumentsByDocumentTypeId', newAttachedDocumentsByDocumentTypeId)

    this.setState({
      automatchModalVisible: false,
      // Clean up state of which documentType we are attaching a form to.
      autoMatchDocumentType: null
    })
  }

  private attachPendingDocument = (createDocumentRequest: CreateDocumentRequest) => {
    const { addDocumentModalDocumentType } = this.state
    const { documentTypeId, categoryId } = createDocumentRequest

    const [fileName, ext] = createDocumentRequest.file.name.split('.') // kill me

    const newAttachedDocumentsByDocumentTypeId = this.props.values.attachedDocumentsByDocumentTypeId.set(
      addDocumentModalDocumentType.id,
      new Set([
        {
          name: `${createDocumentRequest.name}.${ext}`,
          type: { id: documentTypeId },
          category: { id: categoryId },
          state: BottomSheetStatus.PENDING
        }
      ]) as any
    )
    this.setFormikField('attachedDocumentsByDocumentTypeId', newAttachedDocumentsByDocumentTypeId)

    this.setState({
      awaitingPendingDocumentWithTypeId: documentTypeId
    })
  }

  private getUpdatedAttachedDocuments = (attachingDocumentId: string): Set<Document> => {
    const { autoMatchDocumentType } = this.state
    const { attachedDocumentsByDocumentTypeId } = this.props.values
    const attachedDocumentsForThisDocumentType =
      attachedDocumentsByDocumentTypeId.get(autoMatchDocumentType.id) || new Set()

    const updated = attachedDocumentsForThisDocumentType.add(this.getDocumentById(attachingDocumentId))
    return updated
  }

  private removeAttachedDocument = (documentTypeId: string, removedDocumentId: string) => {
    const { attachedDocumentsByDocumentTypeId } = this.props.values
    const attachedDocumentsForThisType = attachedDocumentsByDocumentTypeId.get(documentTypeId)

    const updated = new Set(Array.from(attachedDocumentsForThisType).filter(doc => doc.id !== removedDocumentId))

    this.setFormikField(
      'attachedDocumentsByDocumentTypeId',
      attachedDocumentsByDocumentTypeId.set(documentTypeId, updated)
    )
  }

  private getDocumentById = (documentId: string): Document => {
    const [doc] = this.props.allDocs.filter(d => d.id === documentId)
    return doc
  }

  private findCounterpartyName = (): string => {
    return this.getCounterpartyNameById(this.counterpartyId())
  }

  private getCounterpartyNameById = (counterpartyId: string) => {
    let counterpartyName = 'unknown'
    if (this.props.counterparties) {
      counterpartyName = fetchCounterpartyName(this.props.counterparties, counterpartyId)
    }
    return counterpartyName
  }

  private toggleSelectionDocumentType = (idDocType: string) => {
    const docType: DocumentType = this.props.documentTypes.find(docType => docType.id === idDocType)
    const idCat: string = this.props.categories.find(cat => cat.id === docType.category.id).id
    const selections: Map<string, Set<string>> = this.props.values.sentDocumentRequestTypes
    const setDocTypes: Set<string> = selections.get(idCat)

    const { attachedDocumentsByDocumentTypeId } = this.props.values
    const attachedFormsForThisType = attachedDocumentsByDocumentTypeId.get(idDocType) || new Set()

    if (setDocTypes) {
      // The category of this doctype is already registered
      if (setDocTypes.has(idDocType)) {
        // The doctype was already selected, so we remove it
        setDocTypes.delete(idDocType)
        attachedFormsForThisType.clear()
      } else {
        // The doctype was not selected, so we add it to the set
        setDocTypes.add(idDocType)
      }
    } else {
      selections.set(idCat, new Set([idDocType]))
    }
    this.setFormikField('sentDocumentRequestTypes', selections)
  }

  private setFormikField = (name: string, value: any) => {
    this.props.setFieldTouched(name)
    this.props.setFieldValue(name, value)
  }

  private getSelectedDocumentTypes = (): Set<string> => {
    const arrayOfSets = Array.from(this.props.values.sentDocumentRequestTypes.values())
    const flatten = [].concat.apply([], arrayOfSets.map(array => Array.from(array)))
    return new Set(flatten)
  }

  private getCounterSelectedDoctypes = (): Map<string, number> => {
    const arrays: any[] = Array.from(this.props.values.sentDocumentRequestTypes, ([key, value]) => [key, value.size])
    const m = new Map()
    arrays.forEach(x => m.set(x[0], x[1]))
    return m
  }

  private getAttachedForms = () => {
    const { attachedDocumentsByDocumentTypeId } = this.props.values
    return Array.from(attachedDocumentsByDocumentTypeId.values())
      .reduce((acc, set) => [...acc, ...Array.from(set)], [])
      .filter(doc => doc.id)
      .map(doc => doc.id)
  }

  private handleCreateDocument = (createDocumentRequest: CreateDocumentRequest) => {
    this.createDocument(createDocumentRequest)
      .then(this.reloadDocumentState)
      .then(() => this.attachPendingDocument(createDocumentRequest))
      .then(() => this.toggleAddDocumentModalVisible(null))
  }

  private createDocument = async (createDocumentRequest: CreateDocumentRequest) => {
    this.props.createDocumentAsync(createDocumentRequest, DEFAULT_PRODUCT_ID)
  }

  private reloadDocumentState = async () => {
    this.props.fetchDocumentsAsync(DEFAULT_PRODUCT_ID, 'none')
  }

  private setNoteContent = (content: string): void => {
    this.setState({
      noteInput: this.contentToNote(content)
    })
  }

  private contentToNote = (content: string): Note | null => {
    return content
      ? {
          sender: '',
          content,
          date: new Date().toISOString()
        }
      : null
  }
}

const StyledBodyPanel = styled.div`
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  .ui.card {
    margin-bottom: 0 !important;
    margin-top: ${SPACES.SMALL} !important;
  }
`

const Footer = styled.div`
  // 'position: fixed' would make the bottom line always visible
  min-height: 20px;
  width: 100%;
  min-height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 50px;
  bottom: 0px;
  position: fixed;
  padding-right: 43px;
  background-color: white;
  flex-direction: row-reverse;
  box-shadow: 4px 4px 4px 4px rgba(192, 207, 222, 0.51);
  z-index: 2;
`

const Body = styled.div`
  // 'min-height: 931px;' would be the minimum size once we place the content
  background-color: #f2f5f8;
  min-height: 500px;
  max-height: 1000px;
  width: 100%;
`

export const ViewContainer = styled.div`
  margin-top: 2px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  height: calc(100vh - 65px);
  overflow: auto;
  background-color: #f2f5f8;
`
export default compose<any>(
  withDocument,
  withRouter,
  withCategories,
  withDocumentTypes,
  withCounterparties,
  withRequests,
  withDocuments,
  withFormik({
    mapPropsToValues: () => cloneDeep(requestDocumentFormDefaultValue),
    validate: requestDocumentValidator,
    handleSubmit: values => values
  })
)(RequestDocumentsContainer)
