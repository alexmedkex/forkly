import * as React from 'react'
import { List, Image, Dropdown, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { Document } from '../../../document-management/store/types'
import { getDocumentOwner } from '../../../document-management/utils/selectors'
import { displayDateAndTime } from '../../../../utils/date'
import { initiateDownload } from '../../../document-management/utils/downloadDocument'
import { ILCPresentation } from '../../types/ILCPresentation'
import { LCPresentationStatus } from '../../store/presentation/types'

interface IProps {
  documents: Document[]
  presentation: ILCPresentation
  showActions?: boolean
  removeDeleteButton?: boolean
  openDeleteDocumentConfirm?(presentation: ILCPresentation, document: Document): void
  viewClickHandler?(document: Document): void
  renderDocumentReview?(document: Document): React.ReactNode
}

const DocumentsList: React.FC<IProps> = (props: IProps) => {
  const {
    documents,
    presentation,
    openDeleteDocumentConfirm,
    showActions,
    removeDeleteButton,
    renderDocumentReview,
    viewClickHandler
  } = props

  const parcelIdOrNull = (document: Document) => {
    const { context } = document
    return context && context.parcelId ? `Parcel #${context.parcelId}` : null
  }

  const renderActions = (document: Document) => {
    if (showActions) {
      return (
        <StyledDropdown icon="ellipsis horizontal" direction="left">
          <Dropdown.Menu>
            <Dropdown.Item key="view" onClick={() => viewClickHandler(document)} text="View" value="View" />
            <Dropdown.Item key="download" onClick={() => initiateDownload(document)} text="Download" value="Download" />
            {presentation.status === LCPresentationStatus.Draft &&
              !presentation.destinationState &&
              !removeDeleteButton && (
                <Dropdown.Item
                  key="remove"
                  onClick={() => openDeleteDocumentConfirm(presentation, document)}
                  text="Remove"
                  value="Remove"
                />
              )}
          </Dropdown.Menu>
        </StyledDropdown>
      )
    }
    return null
  }

  const renderReviewButton = (document: Document) => {
    if (renderDocumentReview) {
      return renderDocumentReview(document)
    }
    return null
  }

  return (
    <List divided={false} style={{ paddingLeft: 0, paddingRight: 0 }}>
      {documents.map(document => (
        <List.Item key={document.id} style={{ paddingBottom: 0 }} data-test-id={document.name}>
          <List.Content>
            <Image src="/images/file.svg" inline={true} spaced="right" style={{ marginTop: '-3px' }} />
            <CommonCell isReview={renderDocumentReview ? true : false}>
              <BreakWord>{document.name}</BreakWord>
            </CommonCell>
            <CommonCell isReview={renderDocumentReview ? true : false}>
              {document.type ? document.type.name : ''}
            </CommonCell>
            <CommonCell isReview={renderDocumentReview ? true : false}>{getDocumentOwner(document)}</CommonCell>
            <CommonCell isReview={renderDocumentReview ? true : false}>{parcelIdOrNull(document)}</CommonCell>
            <DateCell>{displayDateAndTime(document.registrationDate)}</DateCell>
            {renderActions(document)}
            {renderReviewButton(document)}
          </List.Content>
        </List.Item>
      ))}
    </List>
  )
}

interface IStyledPropProps {
  width?: string
}

const StyledProp = styled.span`
  display: inline-block;
  vertical-align: middle;
  width: ${(prop: IStyledPropProps) => prop.width || '20%'};
`
interface IStyledCommonCellProps {
  isReview: boolean
}

const CommonCell = styled.span`
  display: inline-block;
  width: ${(prop: IStyledCommonCellProps) => `calc(calc(100% - ${prop.isReview ? '320px' : '220px'}) / 4)`};
  vertical-align: top;
  padding: 0 2px;
`

const BreakWord = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
  font-weight: bold;
`

const DateCell = styled(StyledProp)`
  width: 150px;
`

export const StyledDropdown = styled(Dropdown)`
  float: right;
  top: -4px;
`

export default DocumentsList
