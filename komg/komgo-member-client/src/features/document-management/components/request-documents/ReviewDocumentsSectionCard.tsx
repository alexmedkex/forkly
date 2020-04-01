import * as React from 'react'
import { SectionCard } from './SectionCard'
import styled from 'styled-components'
import { Request, DocumentType, Document, Category } from '../../store'
import { List } from 'semantic-ui-react'
import { blueGrey, violetBlue } from '../../../../styles/colors'
import { TileWithItems } from './Tile'
import { DownloadButton } from '../documents/DownloadButton'

import { sortCategories, sortDocumentTypes } from '../../utils/sortingHelper'
import _ from 'lodash'
import SpanAsLink from '../../../../components/span-as-link/SpanAsLink'
import ViewMultipleDocuments from './ViewMultipleDocuments'
import { AttachDocumentsDropdown } from './requirements-section/AttachDocumentsDropdown'
import { IAttachedDocument } from '../../containers/DocumentRequestContainer'
import { SPACES } from '@komgo/ui-components'
import AlreadySentTabSubsectionCard from './AlreadySentTabSubsectionCard'

export interface Props {
  documentRequest: Request
  documentsByType: Map<string, Document[]>
  attachedDocuments: Map<string, IAttachedDocument[]>
  downloadedRequestAttachmentForTypes: string[]
  openViewDocument(previewDocumentId: string): void
  onOriginalDocument(doc: Document): void
  onDocumentAttachmentDownload(doc: Document): void
  automatchSelectRequested(docType: DocumentType): void
  addNewDocumentRequested(docType: DocumentType): void
  deleteDocRequested(docId: string): void
  resetLoadedDocument(): void
}

export interface State {
  activePreviewForType: DocumentType
  selectedTab: TABS_NAMES
}

enum TABS_NAMES {
  requested = 'Requested',
  alreadySent = 'Already sent',
  dismissed = 'Dismissed'
}

const title: string = 'REQUEST DETAILS'

export class ReviewDocumentsSectionCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      activePreviewForType: null,
      selectedTab: TABS_NAMES.requested
    }

    this.handleViewDocuments = this.handleViewDocuments.bind(this)
  }

  render() {
    const alreadySentDocs = this.filterAlreadySelectedDocs(
      this.props.documentsByType,
      this.props.documentRequest.sentDocuments
    )
    if (this.props.documentRequest) {
      return (
        <>
          <SectionCard title={title} height={'400px'}>
            {this.renderTabheader(this.getNumberOfAlreadySentDocTypes(alreadySentDocs))}
            {this.renderBody(this.state.selectedTab, alreadySentDocs)}
          </SectionCard>
          {this.renderDocumentsPreview()}
        </>
      )
    } else {
      return null
    }
  }

  private renderBody(tabSelected: TABS_NAMES, alreadySentDocs: Map<string, Document[]>) {
    if (tabSelected === TABS_NAMES.requested) {
      return <StyledListDocTypes className="style-scroll">{this.renderDocuments()}</StyledListDocTypes>
    } else if (tabSelected === TABS_NAMES.alreadySent) {
      return (
        <AlreadySentTabSubsectionCard
          counterpartyId={this.props.documentRequest.companyId}
          alreadySentDocs={alreadySentDocs}
          openViewDocument={this.props.openViewDocument}
        />
      )
    }
  }

  /**
   *
   * @param documentsByType a map with docTypeId as key and array of documents as value. It represents
   * the list of all documents associated to this request we are reviewing
   * @param sentDocuments its a list with all the documents we already sent to our counterparty in this request
   *
   * The result is a map with the same structure as the first parameter, but filtering only the documents
   * we have already sent to the counterparty. So the key is an id of document type and the value is an array
   * of Documents.
   */
  private filterAlreadySelectedDocs(
    documentsByType: Map<string, Document[]>,
    sentDocuments: string[]
  ): Map<string, Document[]> {
    const mapAlreadyShared = new Map<string, Document[]>()
    documentsByType.forEach((value, key) => {
      value.forEach(doc => {
        if (sentDocuments.includes(doc.id)) {
          if (mapAlreadyShared.has(key)) {
            // We have already documents of this docType yet
            mapAlreadyShared.set(key, [...mapAlreadyShared.get(key), doc])
          } else {
            // There is no documents of this docType yet
            mapAlreadyShared.set(key, [doc])
          }
        }
      })
    })
    return mapAlreadyShared
  }

  private renderTabheader(numberOfAlreadySentDocs: number) {
    return (
      <StyledContent>
        <StyledTab>
          <StyledTabItem
            onClick={() => this.changeTab(TABS_NAMES.requested)}
            active={this.state.selectedTab === TABS_NAMES.requested}
          >
            {`${TABS_NAMES.requested} `} <CountWrap>({this.getNumberOfRequestedDocumentTypes()})</CountWrap>
          </StyledTabItem>
          <StyledTabItem
            onClick={() => numberOfAlreadySentDocs > 0 && this.changeTab(TABS_NAMES.alreadySent)}
            active={this.state.selectedTab === TABS_NAMES.alreadySent}
          >
            {`${TABS_NAMES.alreadySent} `} <CountWrap>({numberOfAlreadySentDocs})</CountWrap>
          </StyledTabItem>
        </StyledTab>
      </StyledContent>
    )
  }

  private changeTab(tab: TABS_NAMES) {
    this.setState({ ...this.state, selectedTab: tab })
  }

  private renderDocumentsPreview() {
    const { activePreviewForType } = this.state
    const { documentsByType } = this.props

    if (!activePreviewForType) {
      return null
    }

    const documentsIds = this.getDocumentIds(activePreviewForType)

    const documentsInLibraryForType = documentsByType.has(activePreviewForType.id)
      ? documentsByType.get(activePreviewForType.id)
      : []

    const docsForPreview = documentsIds.filter(docId => {
      const doc = documentsInLibraryForType.find(d => d.id === docId)

      return doc && doc.state === 'REGISTERED'
    })

    return (
      documentsIds.length > 0 && (
        <ViewMultipleDocuments
          documentIds={docsForPreview}
          closeModal={this.handleViewDocuments}
          delete={docId => this.handleDocDelete(docsForPreview, docId)}
        />
      )
    )
  }

  private getDocumentIds(docType?: DocumentType) {
    const { attachedDocuments } = this.props

    if (docType) {
      return attachedDocuments.has(docType.id) ? attachedDocuments.get(docType.id).map(doc => doc.documentId) : null
    }

    return Array.from(attachedDocuments.entries()).reduce(
      (memo, documentsPerType) => [...memo, ...documentsPerType[1].map(d => d.documentId)],
      []
    )
  }

  private renderDocuments() {
    // retrieve all requested document categories, sort them alphabetically and remove duplicates
    const categories: Category[] = this.props.documentRequest.types.map(type => type.category)
    const sortedCategories: string[] = sortCategories(categories).map(category => category.id)
    const uniqSortedCategories = _.uniq(sortedCategories)

    // for each sorted category, sort its requested document types
    let sortedDocumentTypes: DocumentType[] = []
    for (const categoryId of uniqSortedCategories) {
      const typesWithinCategory = this.props.documentRequest.types.filter(
        documentType => documentType.category.id === categoryId
      )
      const sortedTypesWithinCategory = sortDocumentTypes(typesWithinCategory)
      sortedDocumentTypes = sortedDocumentTypes.concat(sortedTypesWithinCategory)
    }

    // render a tile per document type in the correct order
    return sortedDocumentTypes.map(type => this.renderTile(type))
  }

  private handleViewDocuments(docType?: DocumentType) {
    this.setState({
      activePreviewForType: docType
    })
    if (!docType) {
      this.props.resetLoadedDocument()
    }
  }

  private canAttachDocForType(requestAttachment: Document, type: string) {
    const { downloadedRequestAttachmentForTypes = [] } = this.props

    return (
      !requestAttachment ||
      (requestAttachment &&
        requestAttachment.downloadInfo &&
        requestAttachment.downloadInfo.downloadedByUsers.length > 0) ||
      downloadedRequestAttachmentForTypes.includes(type)
    )
  }

  private renderTile(docType: DocumentType) {
    const renderTileItems = () => {
      const docRequestAttachments = this.props.documentRequest.documents.filter(doc => doc.type.id === docType.id)

      // we only assume a single document on the request (i.e, a form)
      const requestAttachment = docRequestAttachments.length > 0 ? docRequestAttachments[0] : undefined

      const { attachedDocuments, documentsByType } = this.props

      const attachedDocumentsForType = attachedDocuments.has(docType.id) ? attachedDocuments.get(docType.id) : []
      const documentsInLibraryForType = documentsByType.has(docType.id) ? documentsByType.get(docType.id) : []

      const attachedDocsData = attachedDocumentsForType.map(doc => {
        const relatedDoc = documentsInLibraryForType.find(d => d.id === doc.documentId)

        return {
          attachedDoc: doc,
          doc: relatedDoc
        }
      })

      // get registered library docs, which are not uploaded in this session
      const numberOfDocsInLibrary = documentsInLibraryForType.filter(
        doc =>
          doc.state === 'REGISTERED' &&
          !attachedDocumentsForType.find(attached => attached.source === 'upload' && attached.documentId === doc.id)
      ).length

      const pendingDoc = (
        attachedDocsData.find(d => d.attachedDoc.source === 'upload' && d.doc.state === 'PENDING') || ({} as any)
      ).doc

      const numberOfSelectedDocuments = attachedDocsData.filter(d => d.doc.state === 'REGISTERED').length

      return (
        <>
          {/* Has document attached? Show download / view button */
          !!requestAttachment ? (
            <DownloadButton
              docType={docType}
              document={requestAttachment}
              onOriginalDocument={this.props.onOriginalDocument}
              onDocumentDownload={this.props.onDocumentAttachmentDownload}
            />
          ) : (
            <span />
          )}
          <div>
            <AttachDocumentsDropdownWrap>
              <AttachDocumentsDropdown
                documentType={docType}
                automatchCount={numberOfDocsInLibrary}
                attachedDocument={pendingDoc}
                disabled={!this.canAttachDocForType(requestAttachment, docType.id)}
                toggleAddDocumentModalVisible={() => this.props.addNewDocumentRequested(docType)}
                toggleAutomatchModalVisible={() => this.props.automatchSelectRequested(docType)}
              />
            </AttachDocumentsDropdownWrap>
            {!!numberOfSelectedDocuments && (
              <ViewAllWrap onClick={() => this.handleViewDocuments(docType)}>
                View all ({numberOfSelectedDocuments})
              </ViewAllWrap>
            )}
          </div>
        </>
      )
    }
    return <TileWithItems key={`tile-${docType.id}`} documentType={docType} renderItems={renderTileItems} />
  }

  private getNumberOfRequestedDocumentTypes(): number {
    return this.props.documentRequest.types.length
  }

  private getNumberOfAlreadySentDocTypes(alreadySentDocs: Map<string, Document[]>): number {
    return alreadySentDocs.size
  }

  private handleDocDelete(activePreviewDocsIds: string[], docId: string) {
    // last doc delete requested
    if (activePreviewDocsIds.length === 1 && activePreviewDocsIds[0] === docId) {
      this.setState({
        activePreviewForType: null
      })
    }

    this.props.deleteDocRequested(docId)
  }
}

export const StyledTab = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-bottom: 12px;
`

export const StyledListDocTypes = styled(List)`
  &&&&&&& {
    padding: 0px;
    margin-top: 0px;
    width: -webkit-fill-available;
    height: 280px;
    overflow-y: auto;
  }
`

const StyledTabItem =
  styled.span <
  { active: boolean } >
  `
  text-align: center;
  margin-right: 30px;
  cursor: pointer;
  color: ${blueGrey};
  font-weight: bold;
  padding-bottom: 6px;

  &:hover {
    color: black;
  }

  ${props =>
    props.active
      ? `
        color: ${violetBlue}
        border-bottom: 2px solid ${violetBlue};
        &:hover {
          color: ${violetBlue};
        }
      `
      : ``};

`

const CountWrap = styled.span`
  margin-left: 4px;
  font-weight: normal;
`

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 830px;
`

const AttachDocumentsDropdownWrap = styled.div`
  display: inline-block;
`

const ViewAllWrap = styled(SpanAsLink)`
  margin-left: ${SPACES.DEFAULT};
`
