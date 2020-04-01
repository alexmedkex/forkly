import * as React from 'react'
import { Icon, Table, Button, Label, Popup, Grid } from 'semantic-ui-react'

import { CustomFileIcon } from '../../../components/custom-icon'
import { IFullDocumentReviewResponse, ReviewStatus } from '../store/types'
import { Document } from '../../document-management/store/types'
import StatusPill from '../components/StatusPill'
import CommentTooltip from '../components/CommentTooltip'

interface Props {
  documentId: string
  name: string
  type: string
  status: string
  comment: string
  document: Document
  documents: IFullDocumentReviewResponse[]
  sendDocumentsRequestId: string
  reviewCompleted: boolean
  redirectBackUrl?: string
  onReviewClick(doc: Document): void
}

const ReviewRow = (props: Props) => {
  return (
    <Table.Row>
      <Table.Cell>
        <CustomFileIcon />
      </Table.Cell>
      <Table.Cell>{props.type}</Table.Cell>
      <Table.Cell>{props.name}</Table.Cell>
      <Table.Cell verticalAlign="top">
        <Grid.Row style={{ display: 'flex', alignItems: 'center' }}>
          <StatusPill status={props.status} />
          {props.status === ReviewStatus.REJECTED && props.comment !== '' ? (
            <CommentTooltip
              comment={props.comment}
              icon={<Icon size="large" name="comment alternate" style={{ marginLeft: '14px', fontSize: '1.2em' }} />}
            />
          ) : (
            ''
          )}
        </Grid.Row>
      </Table.Cell>
      <Table.Cell>
        <div>
          <Button
            data-test-id={`review-button-${props.name}`}
            onClick={() => props.onReviewClick(props.document)}
            disabled={props.reviewCompleted}
          >
            Review
          </Button>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

export default ReviewRow
