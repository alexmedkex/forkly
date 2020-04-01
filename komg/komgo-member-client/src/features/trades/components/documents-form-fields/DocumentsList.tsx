import * as React from 'react'
import { SyntheticEvent } from 'react'
import { List } from 'semantic-ui-react'
import { ITradeDocument } from '../../store/types'
import { DocumentType } from '../../../document-management/store/types/document-type'
import { IDocumentItem, DocumentListItem } from '../DocumentListItem'
import styled from 'styled-components'

import {
  DropdownOption,
  DELETE,
  EDIT
} from '../../../document-management/components/documents/my-documents/DocumentListDropdownOptions'

const Padding = styled.div`
  padding-top: 4px;
`

export interface IProps {
  documents: ITradeDocument[]
  documentTypes: DocumentType[]
  inForm?: boolean
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

  constructor(props: IProps) {
    super(props)
    this.state = {
      actives: this.props.documents.reduce((memo, document) => {
        return {
          ...memo,
          [document._id!]: true
        }
      }, {})
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

  renderDropdownOptions = (index: number, document: ITradeDocument): DropdownOption[] => {
    const { removeDocument, editDocument } = this.props

    const view: DropdownOption = {
      ...EDIT,
      onClick: () => {
        editDocument(index)
      }
    }

    const download: DropdownOption = {
      ...DELETE,
      onClick: () => {
        removeDocument(index)
      }
    }

    const dropdownOptions = document.file ? { download, view } : { download }
    return Object.values(dropdownOptions)
  }

  createDocumentItem = (document: ITradeDocument): IDocumentItem => {
    const typeName: string = DocumentsList.formatDocumentTypes(this.props.documentTypes)[document.typeId].name
    const fileNameSplit: string[] = document.fileName.split('.')
    const fileExtension: string = fileNameSplit.length > 1 ? '.' + fileNameSplit[1] : ''
    const fileName: string = document.name + fileExtension
    return {
      id: document.id,
      name: fileName,
      typeName
    }
  }

  render() {
    const hasDocuments = this.props.documents && this.props.documents.length > 0
    return (
      <div>
        <List divided={true} verticalAlign="middle">
          {hasDocuments && <Padding />}
          {hasDocuments &&
            this.props.documents.map((document: ITradeDocument, index: number) => (
              <DocumentListItem
                key={`${document._id} ${index}`}
                document={this.createDocumentItem(document)}
                renderDropdownOptions={() => this.renderDropdownOptions(index, document)}
              />
            ))}
        </List>
      </div>
    )
  }
}
