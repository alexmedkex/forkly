import * as React from 'react'
import { Table, Container, Label, SemanticCOLORS } from 'semantic-ui-react'
import moment from 'moment'
import styled from 'styled-components'
import { IDocumentReviewStatus } from '../../store/types'

interface Props {
  type: string
  title: string
  metadata?: string[]
  expiry?: Date
  uploadedOn?: Date
  receivedOn?: Date
  comment?: string
  parcelId?: string
  reviewStatus?: string
  reviewComment?: string
  reviewStatusLabelColor?: SemanticCOLORS
}

const EvaluationInfoTable: React.SFC<Props> = (props: Props) => {
  return (
    <EvaluationInfoTableStyles>
      <Table fixed={false}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Type</Table.Cell>
            <Table.Cell>{props.type}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Title</Table.Cell>
            <Table.Cell>{props.title}</Table.Cell>
          </Table.Row>
          {props.expiry ? (
            <Table.Row>
              <Table.Cell>Registered On</Table.Cell>
              <Table.Cell>{moment(props.expiry).format('YYYY-MM-DD')}</Table.Cell>
            </Table.Row>
          ) : null}
          {props.uploadedOn ? (
            <Table.Row>
              <Table.Cell>Uploaded on</Table.Cell>
              <Table.Cell>{moment(props.uploadedOn).format('YYYY-MM-DD')}</Table.Cell>
            </Table.Row>
          ) : null}
          {props.receivedOn ? (
            <Table.Row>
              <Table.Cell>Received on</Table.Cell>
              <Table.Cell>{moment(props.receivedOn).format('YYYY-MM-DD')}</Table.Cell>
            </Table.Row>
          ) : null}
          {props.parcelId ? (
            <Table.Row>
              <Table.Cell>Parcel Id</Table.Cell>
              <Table.Cell>#{props.parcelId}</Table.Cell>
            </Table.Row>
          ) : null}
          {props.comment ? (
            <Table.Row>
              <Table.Cell>Comment</Table.Cell>
              <Table.Cell>{props.comment}</Table.Cell>
            </Table.Row>
          ) : null}
          {props.reviewStatus ? (
            <Table.Row>
              <Table.Cell>Status</Table.Cell>
              <Table.Cell>
                <Label color={props.reviewStatusLabelColor}>{props.reviewStatus}</Label>
              </Table.Cell>
            </Table.Row>
          ) : null}
          {props.reviewComment ? (
            <Table.Row>
              <Table.Cell>Review Comment</Table.Cell>
              <Table.Cell>{props.reviewComment}</Table.Cell>
            </Table.Row>
          ) : null}
          {/* {props.metadata.map(data => {
          return (
            <Table.Row key={data}>
              <Table.Cell>Metadata</Table.Cell>
              <Table.Cell>{data}</Table.Cell>
            </Table.Row>
          )
        })} */}
        </Table.Body>
      </Table>
    </EvaluationInfoTableStyles>
  )
}

const EvaluationInfoTableStyles = styled(Container)`
  margin-top: 2em;
  .ui.table tr td {
    border-top: 0px !important;
  }
  .ui.table {
    border: 0px !important;
  }
  table > *:first-child:not(thead) td:first-child {
    font-weight: bold;
  }
`

export default EvaluationInfoTable
