import * as React from 'react'
import { Modal, Segment, Table } from 'semantic-ui-react'
import { DocumentType } from '../../store/types'
import { groupBy } from '../../../document-management/components/documents/my-documents/toMap'
import { CustomFileIcon } from '../../../../components/custom-icon'
import styled from 'styled-components'

interface Props {
  selectedModalDocumentTypes: DocumentType[]
  selectedCounterpartyName: string
}
const DocumentRequestSummary = (props: Props) => {
  const documentTypesByCategory: Map<string, DocumentType[]> = groupBy(
    props.selectedModalDocumentTypes,
    (documentType: DocumentType) => documentType.category.name
  )
  return <Modal.Content content={categoryToHeaderElement(documentTypesByCategory)} />
}

const categoryToHeaderElement = (documentTypesByCategory: Map<string, DocumentType[]>) => {
  const headers: JSX.Element[] = []
  documentTypesByCategory.forEach((documentTypesInCategory, categoryName) => {
    headers.push(
      <StyledSegment basic={true}>
        <b>{categoryName}</b>
        <Table fixed={false}>
          <Table.Body>
            {documentTypesInCategory.map(dt => {
              return (
                <Table.Row key={dt.id}>
                  <Table.Cell>
                    <CustomFileIcon />
                  </Table.Cell>
                  <Table.Cell>{dt.name}</Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </StyledSegment>
    )
  })

  return headers
}

const StyledSegment = styled(Segment)`
  margin-top: 2em;

  &&& {
    padding-left: 0px;
    padding-top: 0px;
  }

  .ui.table tr td {
    border-top: 0px !important;
    width: 100%;
    height: 30px;
    padding: 0px;
    padding-right: 14px;
  }

  .ui.table {
    border: 0px !important;
    table-layout: fixed;
    width: 400px;
    padding: 0px;
  }

  .ui.table tr td:first-child {
    padding: 0px;
    width: 30px;
  }
`

export default DocumentRequestSummary
