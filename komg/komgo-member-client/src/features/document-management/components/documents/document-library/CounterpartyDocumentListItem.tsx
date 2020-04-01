import * as React from 'react'
import styled from 'styled-components'
import { Button, Icon } from 'semantic-ui-react'

import { compose } from 'redux'
import { withRouter } from 'react-router'
import { RouteComponentProps } from 'react-router'
import { Document, SharedInfo } from '../../../store'
import { toMegabytes, truncate } from '../../../../../utils/casings'
import { displayDate } from '../../../../../utils/date'
import { DropdownOption } from '../my-documents/DocumentListDropdownOptions'
import * as DocumentHelper from '../../../utils/documentHelper'
import StatusPill from '../../../../review-documents/components/StatusPill'
import CommentTooltip from '../../../../review-documents/components/CommentTooltip'
import { ReviewStatus } from '../../../../review-documents/store/types'

import { ListItemField, Field, ListItemLabel, ListItemValue } from './ListItemField'

export interface Props extends RouteComponentProps<any> {
  document: Document
  viewDocumentOption: DropdownOption
  downloadDocumentOption: DropdownOption
  highlighted: boolean
  getUserNameFromDocumentUploaderId(idUser: string): string
  renderEllipsisMenu(doc: Document): React.ReactNode
}

interface ReviewProps {
  isReviewCompleted: boolean
}

const CounterpartyDocumentListItem: React.SFC<Props> = (props: Props) => {
  const doc = props.document
  const [docName, ext] = doc.name.split('.')
  const size = getDocumentSize(doc.content as any)
  const docIsReviewCompleted = DocumentHelper.isReviewCompleted(doc)

  return (
    <ListItemGrid isReviewCompleted={docIsReviewCompleted}>
      <FieldGrid isReviewCompleted={docIsReviewCompleted} data-test-id="field-grid">
        <ListItemField label="Type" value={doc.type.name} dataTestId="field-type" />
        <ListItemField label="Format" value={ext.toUpperCase()} dataTestId="field-format" />
        <ListItemField
          label="Received on"
          value={displayDate(doc.receivedDate, 'DD MMM YYYY')}
          dataTestId="field-uploaded"
        />
        <ListItemField label="Name" value={docName} dataTestId="field-name" />
        <ListItemField label="Size" value={size} dataTestId="field-size" />
        <ReviewStatusField data-test-id="field-status">
          <ListItemLabel>Review Status</ListItemLabel>
          <ListItemValue>{displayStatus(props)}</ListItemValue>
        </ReviewStatusField>
      </FieldGrid>
      {renderActionButtons(props)}
    </ListItemGrid>
  )
}

const renderActionButtons = (props: Props): React.ReactNode => {
  const doc: Document = props.document
  if (DocumentHelper.isSharedDocument(doc)) {
    if (DocumentHelper.isReviewCompleted(doc)) {
      // In case it is a shared document and its review is not completed yet
      return (
        <>
          <div data-test-id="view-button">{renderOptionButton(props.viewDocumentOption)}</div>
          <div data-test-id="download-button">{renderOptionButton(props.downloadDocumentOption)}</div>
        </>
      )
    } else {
      /* In case the review process of this document has not been completed yet we can 
      still review it as many times as we want */
      return (
        <>
          <Button data-test-id="review-button" onClick={() => onReviewClick(props)} primary={true}>
            Review
          </Button>
          {props.renderEllipsisMenu(doc)}
        </>
      )
    }
  }
}

const displayStatus = (props: Props) => {
  const doc: Document = props.document
  if (DocumentHelper.isSharedDocument(doc)) {
    if (DocumentHelper.isReviewed(doc)) {
      return renderStatusReviewed(props)
    } else {
      return 'Awaiting'
    }
  }
}

const onReviewClick = (props: Props) => {
  const doc: Document = props.document
  props.history.push({
    pathname: '/evaluation',
    state: {
      documents: [{ document: doc, status: doc.sharedInfo.status, note: doc.sharedInfo.note }],
      documentId: doc.id,
      sendDocumentsRequestId: doc.sharedInfo.receivedDocumentsId,
      redirectBackUrl: undefined
    }
  })
}

const renderStatusReviewed = (props: Props) => {
  const shared = props.document.sharedInfo
  return (
    <>
      <StatusPill status={shared.status} />
      <ListItemLabel>BY</ListItemLabel>
      <ListItemValue data-test-id="field-reviewed-by">
        {props.getUserNameFromDocumentUploaderId(shared.reviewerId)}
      </ListItemValue>
      {shared.status === ReviewStatus.REJECTED && shared.note !== '' ? (
        <ListItemLabel data-test-id="field-info-bubble">
          <CommentTooltip comment={shared.note} icon={<Icon size="large" name="comment alternate" />} />
        </ListItemLabel>
      ) : (
        ''
      )}
    </>
  )
}

const renderOptionButton = (option: DropdownOption) => {
  const enabled = option && !option.disabled
  return (
    <Button disabled={!enabled} onClick={option.onClick}>
      {option.value}
    </Button>
  )
}

const getDocumentSize = (content: { size: string }) => (content && content.size ? toMegabytes(content.size) : 'Unknown')

const ListItemGrid = styled.div`
  height: 72px;
  border: 1px solid #e8eef3;
  border-radius: 4px;
  background-color: #ffffff;
  display: grid;
  grid-template-columns: ${(props: ReviewProps) =>
    props.isReviewCompleted
      ? 'auto [fields] 70px [view-button] 110px [download-button]'
      : 'auto [fields] 80px [review-button] 50px [ellipses-button]'};
  align-items: center;
`

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props: ReviewProps) =>
    props.isReviewCompleted ? '0.65fr 0.65fr 1fr' : '0.58fr 0.58fr 1fr'};
  grid-template-rows: 28px;
  grid-column-gap: 2rem;
`

const ReviewStatusField = styled(Field)`
  grid-template-columns: repeat(4, minmax(2em, max-content));
`

export default compose<any>(withRouter)(CounterpartyDocumentListItem)
