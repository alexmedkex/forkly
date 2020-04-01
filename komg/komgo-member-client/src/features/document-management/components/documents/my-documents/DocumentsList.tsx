import * as React from 'react'
import { DocumentAccordionPanelTitle } from './DocumentAccordionPanelTitle'
import { List, AccordionPanelProps, Accordion } from 'semantic-ui-react'
import { DocumentType, Document } from '../../../store/types'
import { MapDocumentsToDocumentTypeId } from './toMap'
import { isSelected } from '../../../utils/documentSelection'
import { DocumentsListItem } from './DocumentsListItem'
import { paleBlue } from '../../../../../styles/colors'
import styled from 'styled-components'

interface Props {
  className?: string
  borderless?: boolean
  documentTypes: DocumentType[]
  documentsGroupByType: MapDocumentsToDocumentTypeId
  selectedDocuments: string[]
  sentDocuments?: string[]
  documentAdditionalPropsToBeShown?: string[]
  displayEmptyDocTypes: boolean
  highlightedDocumentId?: string | null
  handleSelectDocument(document: Document): void
  handleSelectDocumentType(documentType: DocumentType): void
  renderDocumentTypeExtraFunctionality(documentType: DocumentType): React.ReactNode
  renderDocumentExtraFunctionality(document: Document, sentToCounterparty: boolean): React.ReactNode
  clearHighlightedDocumentId?(): void
}

export interface State {
  activePanels: Map<string, boolean>
}

class DocumentsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      activePanels: new Map<string, boolean>()
    }
  }

  componentDidMount() {
    this.scrollToHighlightedDocument()
  }

  componentDidUpdate() {
    this.scrollToHighlightedDocument()
  }

  render() {
    const documentsToDisplay = this.props.documentTypes.map(this.documentTypeToAccordionPanel).filter(x => x !== null)
    return (
      <StyledAccordion
        className={this.props.className}
        styled={true}
        exclusive={false}
        fluid={true}
        panels={documentsToDisplay}
      />
    )
  }

  isAllDocumentsFromDocumentTypeChecked = (documentType: DocumentType): boolean => {
    const childDocuments = this.props.documentsGroupByType.get(documentType.id)

    // 1) keep UNCHECKED if there are no documents on this document type
    if (!childDocuments || childDocuments.length === 0) {
      return false
    }

    // 2) keep UNCHECKED if all documents in this document type have been sent
    const sentDocuments = childDocuments.filter(document => this.isDocumentSent(document))
    if (sentDocuments.length > 0 && sentDocuments.length === childDocuments.length) {
      return false
    }

    // 3) determine unselected documents by the following criteria:
    // - exclude already sent documents
    // - exclude all selected documents
    // Zero unselected documents means all document are selected
    // keep CHECKED if unselected documents === zero. UNCHECKED otherwise
    const unSelectedDocuments = childDocuments
      .filter(document => !this.isDocumentSent(document))
      .filter(document => !isSelected(document.id, this.props.selectedDocuments))
    return unSelectedDocuments.length === 0
  }

  isAnyDocumentFromDocumentTypeChecked = (documentType: DocumentType): boolean => {
    const childDocuments = this.props.documentsGroupByType.get(documentType.id)
    if (childDocuments) {
      const selectedDocuments = childDocuments.filter(document => isSelected(document.id, this.props.selectedDocuments))
      const unSelectedDocuments = childDocuments
        .filter(document => !this.isDocumentSent(document))
        .filter(document => !isSelected(document.id, this.props.selectedDocuments))
      return selectedDocuments.length > 0 && unSelectedDocuments.length > 0
    }
    return false
  }

  documentCountPerDocumentType = (documentType: DocumentType): number => {
    const documentsPerType = this.props.documentsGroupByType.get(documentType.id) || []
    return documentsPerType.length
  }

  documentToListItem = (doc: Document) => {
    return (
      <DocumentsListItem
        key={doc.id}
        document={doc}
        selected={isSelected(doc.id, this.props.selectedDocuments)}
        toggleSelected={this.props.handleSelectDocument}
        sentToCounterparty={isSelected(doc.id, this.props.sentDocuments || [])}
        renderDocumentExtraFunctionality={this.props.renderDocumentExtraFunctionality}
        showAdditionalProps={this.props.documentAdditionalPropsToBeShown}
        isHighlighted={this.props.highlightedDocumentId === doc.id}
      />
    )
  }

  documentTypeToAccordionPanel = (documentType: DocumentType): AccordionPanelProps | null => {
    const documentsForThisDocumentType = this.props.documentsGroupByType.get(documentType.id) || []
    const containsHighlightedDocument =
      documentsForThisDocumentType.filter(doc => doc.id === this.props.highlightedDocumentId, this).length > 0

    if (documentsForThisDocumentType.length || this.props.displayEmptyDocTypes) {
      return {
        key: documentType.id,
        name: documentType.name,
        active: containsHighlightedDocument || this.state.activePanels.get(documentType.id),
        onTitleClick: () => this.togglePanelActive(documentType.id),
        title: {
          content: (
            <DocumentAccordionPanelTitle
              key={documentType.id}
              documentType={documentType}
              documentCount={this.documentCountPerDocumentType(documentType)}
              selected={this.isAllDocumentsFromDocumentTypeChecked(documentType)}
              indeterminate={this.isAnyDocumentFromDocumentTypeChecked(documentType)}
              renderDocumentTypeExtraFunctionality={this.props.renderDocumentTypeExtraFunctionality}
              handleDocumentTypeCheckboxTick={this.props.handleSelectDocumentType}
              numberOfDocuments={documentsForThisDocumentType.length}
            />
          )
        },
        // To prevent accordion expanding if there are no documents under this document type
        ...(documentsForThisDocumentType.length === 0 && { onTitleClick: undefined }),
        // if contains a highlighted document, default to open. Else leave active state alone.
        ...(containsHighlightedDocument && { active: true }),
        content: {
          content: (
            <List
              selection={true}
              divided={!this.props.borderless}
              name={documentType.name}
              items={documentsForThisDocumentType.map(this.documentToListItem)}
            />
          )
        }
      }
    }
    return null
  }

  private isDocumentSent(document: Document): boolean {
    return this.props.sentDocuments && this.props.sentDocuments.includes(document.id)
  }

  private togglePanelActive = documentTypeId => {
    if (this.props.clearHighlightedDocumentId) {
      this.props.clearHighlightedDocumentId()
    }
    this.setState({
      activePanels: this.state.activePanels.set(documentTypeId, !this.state.activePanels.get(documentTypeId))
    })
  }

  private scrollToHighlightedDocument = () => {
    const { highlightedDocumentId } = this.props
    if (highlightedDocumentId) {
      const el = document.getElementById(highlightedDocumentId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}

const StyledAccordion = styled(Accordion)`
  &&&&& {
    margin-bottom: 100px;
    box-shadow: none;
    border-top: 1px solid;
    border-bottom: 1px solid;
    border-color: ${paleBlue};
    .dropdown.icon {
      display: none;
    }
    .title {
      padding: 1em 0.5em;
    }
    .content.active {
      padding: 0;
    }
    .ui.selection.list {
      padding-left: 0;
      padding-right: 7px;
    }

    .ui.divided.selection.list {
      padding-left: 0;
      padding-right: 0;
      .item:last-child {
        border-bottom: none;
      }
    }
  }
`

export default DocumentsList
