import { Button } from 'semantic-ui-react'
import { Document, DocumentType } from '../../store'
import CommentTooltip from '../../../review-documents/components/CommentTooltip'
import { CustomInformationIcon } from '../../../../components/custom-icon/InformationIcon'
import React from 'react'
import { initiateDownload } from '../../utils/downloadDocument'
import styled from 'styled-components'
import DocumentViewContainer, { HeaderActions } from '../../containers/DocumentViewContainer'
import DocumentSimpleHeader from './DocumentSimpleHeader'
import DocumentSimpleInfo from './DocumentSimpleInfo'

interface Props {
  document: Document
  docType: DocumentType
  onOriginalDocument(doc: Document): void
  onDocumentDownload?(doc: Document): void
}

interface State {
  isDownloaded: boolean
  viewDocumentId: string
}

export class DownloadButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { isDownloaded: this.isAlreadyDownloaded(this.props.document), viewDocumentId: '' }
  }

  handleViewDocument = (id: string) => {
    this.setState({ viewDocumentId: id })
  }

  handleCloseViewModal = () => {
    this.setState({ viewDocumentId: '' })
  }

  render() {
    if (this.state.viewDocumentId) {
      return (
        <DocumentViewContainer
          documentId={this.state.viewDocumentId}
          onClose={this.handleViewDocument}
          renderHeader={(document: Document, actions: HeaderActions) => (
            <DocumentSimpleHeader document={document} actions={actions} />
          )}
          renderInfoSection={(document: Document) => (
            <DocumentSimpleInfo document={{ ...document, registrationDate: undefined }} />
          )}
        />
      )
    }
    if (!this.isAlreadyDownloaded(this.props.document) && !this.state.isDownloaded) {
      return (
        <StyledDownloadButton>
          <Button
            data-test-id={`requirements-add-button-${this.props.docType.name}`}
            content="Download attachment"
            style={{
              width: '153px',
              fontSize: '14px',
              height: '28px',
              margin: '0 10px 0 0',
              padding: '0',
              textRendering: 'geometricPrecision'
            }}
            default={true}
            disabled={false}
            primary={true}
            onClick={() => {
              initiateDownload(this.props.document)
              if (this.props.onDocumentDownload) {
                this.props.onDocumentDownload(this.props.document)
              }
              this.setState({
                isDownloaded: true
              })
            }}
          />

          <CommentTooltip
            comment={`The counterparty has attached a document for you to use. You must first download it in order to proceed`}
            icon={
              <CustomInformationIcon
                size="large"
                name="comment alternate"
                style={{ marginLeft: '0px', fontSize: '1.2em', alignSelf: 'center' }}
              />
            }
          />
        </StyledDownloadButton>
      )
    } else {
      return (
        <Button
          data-test-id={`requirements-add-button-${this.props.docType.name}`}
          content="Original attachment"
          style={{
            width: '153px',
            fontSize: '14px',
            height: '28px',
            margin: '0 10px 0 0',
            padding: '0'
          }}
          default={true}
          disabled={false}
          onClick={() => this.handleViewDocument(this.props.document.id)}
        />
      )
    }
  }

  private isAlreadyDownloaded(doc: Document) {
    if (doc && doc.downloadInfo) {
      const downloadedByUsers = doc.downloadInfo.downloadedByUsers
      return !!downloadedByUsers && downloadedByUsers.length > 0
    }
    return false
  }
}

const StyledDownloadButton = styled.div`
  &&&&&&&&& {
    display: flex;
  }
`
