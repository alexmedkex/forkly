import * as React from 'react'
import styled from 'styled-components'

import { Table, Container } from 'semantic-ui-react'
import ReviewRow from './ReviewRow'
import { IFullDocumentReviewResponse } from '../store/types'
import { Document } from '../../document-management/store/types'

interface Props {
  documents: IFullDocumentReviewResponse[]
  sendDocumentsRequestId: string
  reviewCompleted: boolean
  redirectBackUrl?: string
  onReviewClick(doc: Document): void
}

const ReviewTable = (props: Props) => {
  return (
    <ReviewTableStyles>
      <Table fixed={true} basic="very">
        <Table.Body>
          {props.documents.map(dr => {
            return (
              <ReviewRow
                key={dr.document.id}
                name={dr.document.name}
                type={dr.document.type.name}
                status={dr.status}
                comment={dr.note}
                document={dr.document as any}
                documents={props.documents}
                documentId={dr.document.id}
                sendDocumentsRequestId={props.sendDocumentsRequestId}
                reviewCompleted={props.reviewCompleted}
                onReviewClick={props.onReviewClick}
              />
            )
          })}
        </Table.Body>
      </Table>
    </ReviewTableStyles>
  )
}

const ReviewTableStyles = styled(Container)`
  table {
    margin-bottom: 50px !important;
  }
  .ui.table tr td {
    border-left: 0px !important;
    border-right: 0px !important;
  }
  .ui.table {
    border-left: 0px !important;
    border-right: 0px !important;
  }

  .ui.table tr td:first-child {
    width: 3em;
    margin: 0px;
    padding: 0px;
  }
  .ui.table tr td + td + td + td + td {
    width: 80px;
    margin: 0px;
    padding: 0px;
  }
`

export default ReviewTable
