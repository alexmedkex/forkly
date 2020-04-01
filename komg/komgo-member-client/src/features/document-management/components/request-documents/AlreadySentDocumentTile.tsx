import React, { useState } from 'react'
import { Document } from '../../store'
import styled from 'styled-components'
import SpanAsLink from '../../../../components/span-as-link/SpanAsLink'
import { printAlreadySharedDocumentDate } from '../../../../../src/utils/timer'
import moment from 'moment-timezone'

interface IProps {
  counterpartyId: string
  document: Document
  index: number
  openViewDocument(previewDocumentId: string): void
}

export const AlreadySentDocumentTile: React.FC<IProps> = (props: IProps) => {
  return (
    <DocumentStyle>
      <StyledIndex data-test-id={`already-sent-doc-index-${props.document.id}`}>{props.index}</StyledIndex>
      <DocumentFrame>
        <ElementStyle>
          <SpanAsLink
            data-test-id={`already-sent-doc-link-${props.document.id}`}
            onClick={() => props.openViewDocument(props.document.id)}
          >
            {props.document.name}
          </SpanAsLink>
        </ElementStyle>
        <ElementRightStyle />
        <ElementRightStyle data-test-id={`already-sent-doc-date-${props.document.id}`}>
          {printAlreadySharedDocumentDate(
            moment(
              props.document.sharedWith.find(shared => shared.counterpartyId === props.counterpartyId).sharedDates[0]
            )
          )}
        </ElementRightStyle>
      </DocumentFrame>
    </DocumentStyle>
  )
}

const StyledIndex = styled.div`
  height: 21px;
  width: 5px;
  color: #5d768f;
  font-family: Helvetica;
  font-size: 14px;
  line-height: 21px;
`

const ElementStyle = styled.div`
  margin: 5px;
`

const ElementRightStyle = styled.div`
  margin: 5px;
  text-align: right;
`

const DocumentStyle = styled.div`
  padding-left: 15px;
  display: grid;
  grid-template-columns: 5px [index] auto [panel-item];
  align-items: center;
`

const DocumentFrame = styled.div`
  display: grid;
  grid-template-columns: auto [panel-item] auto [panel-item] auto [panel-item];
  border: 1px solid #e8eef3;
  border-radius: 4px;
  margin: 5px 5px 5px 15px;
  padding-left: 12px;
`
