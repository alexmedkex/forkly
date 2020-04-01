import { RDStatus } from '@komgo/types'
import * as React from 'react'
import { SyntheticEvent } from 'react'
import { List } from 'semantic-ui-react'
import styled from 'styled-components'
import { Document, DocumentType } from '../../../../document-management'
import {
  DELETE,
  DOWNLOAD,
  DropdownOption,
  VIEW
} from '../../../../document-management/components/documents/my-documents/DocumentListDropdownOptions'
import { initiateDocumentsDownload } from '../../../../document-management/utils/downloadDocument'
import { documentIsReceived, documentIsShared, DocumentListItem, IDocumentItem } from './DocumentListItem'

const Padding = styled.div`
  padding-top: 4px;
`

export interface IProps {
  documents: Document[]
  companyStaticId: string
  counterpartyId: string
  documentTypes: DocumentType[]
  inForm?: boolean
  canShareDocuments: boolean
  rdStatus?: RDStatus
  documentItemSelection: { [id: string]: { checked: boolean; disabled: boolean } }
  handleClickDocumentItemCheckbox: (id: string, checked: boolean, disabled: boolean) => void
  handleDocumentViewClick: (id: string) => void
  handleDocumentDeleteClick: (id: string) => void
  removeDocument?: (index: number) => void
  editDocument?: (index: number) => void
}

interface IState {
  actives: any
}

export default class DocumentsList extends React.Component<IProps, IState> {
  static formatDocumentTypes = (documentTypes: DocumentType[]) => {
    return documentTypes.reduce((memo, documentType) => {
      return {
        ...memo,
        [documentType.id]: documentType
      }
    }, {})
  }

  private documentTypesMap: {}

  constructor(props: IProps) {
    super(props)
    this.state = {
      actives: this.props.documents.reduce((memo, document) => {
        return {
          ...memo,
          [document.id!]: true
        }
      }, {})
    }
    this.documentTypesMap = DocumentsList.formatDocumentTypes(this.props.documentTypes)
  }

  componentDidUpdate(prevProps: IProps) {
    if (prevProps.documentTypes.length === 0 && this.props.documentTypes.length > 0) {
      this.documentTypesMap = DocumentsList.formatDocumentTypes(this.props.documentTypes)
    }
  }

  handleClick = (e: SyntheticEvent, titleProps: any) => {
    const { index } = titleProps
    const { actives } = this.state
    this.setState({
      actives: {
        ...actives,
        [index]: !actives[index]
      }
    })
  }

  renderDropdownOptions = (index: number, document: Document): DropdownOption[] => {
    const { counterpartyId, companyStaticId } = this.props

    const documentIsNotRemovable =
      documentIsShared(this.createDocumentItem(document), counterpartyId) ||
      documentIsReceived(this.createDocumentItem(document), companyStaticId)

    const view: DropdownOption = {
      ...VIEW,
      onClick: () => {
        this.props.handleDocumentViewClick(document.id)
      }
    }

    const download: DropdownOption = {
      ...DOWNLOAD,
      onClick: () => {
        initiateDocumentsDownload([document])
      }
    }
    const remove: DropdownOption = {
      ...DELETE,
      disabled: this.props.rdStatus !== RDStatus.QuoteAccepted,
      onClick: () => {
        this.props.handleDocumentDeleteClick(document.id)
      }
    }

    const dropdownOptions =
      this.props.rdStatus === RDStatus.QuoteAccepted && !documentIsNotRemovable
        ? [view, download, remove]
        : [view, download]
    dropdownOptions.forEach(option => (option.selected = false))
    return dropdownOptions
  }

  createDocumentItem = (document: Document): IDocumentItem => {
    if (document && document.type) {
      const typeName: string = this.documentTypesMap[document.type.id].name
      return {
        id: document.id,
        name: document.name,
        typeName,
        sharedWith: document.sharedWith,
        ownerCompanyId: document.owner ? document.owner.companyId : ''
      }
    }
  }

  render() {
    const {
      documents,
      documentItemSelection,
      handleClickDocumentItemCheckbox,
      companyStaticId,
      counterpartyId,
      canShareDocuments
    } = this.props

    const hasDocuments = documents && documents.length > 0

    return (
      <div>
        <List divided={true} verticalAlign="middle">
          {hasDocuments && <Padding />}
          {hasDocuments &&
            this.props.documents.map((document: Document, index: number) => (
              <DocumentListItem
                data-test-id="document-list-item"
                key={`${document.id} ${index}`}
                document={this.createDocumentItem(document)}
                companyStaticId={companyStaticId}
                counterpartyId={counterpartyId}
                checked={documentItemSelection[document.id] && documentItemSelection[document.id].checked}
                disabled={documentItemSelection[document.id] && documentItemSelection[document.id].disabled}
                handleClickDocumentItemCheckbox={(id: string, checked: boolean, disabled: boolean) =>
                  handleClickDocumentItemCheckbox(id, checked, disabled)
                }
                enforceDocumentIcon={!canShareDocuments}
                renderDropdownOptions={() => this.renderDropdownOptions(index, document)}
              />
            ))}
        </List>
      </div>
    )
  }
}
