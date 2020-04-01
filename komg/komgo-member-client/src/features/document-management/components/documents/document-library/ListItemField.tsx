import * as React from 'react'
import styled from 'styled-components'
import { Popup } from 'semantic-ui-react'

export interface Props {
  label: string
  value: string
  dataTestId: string
}

export const ListItemField = (props: Props) => {
  return (
    <Field data-test-id={props.dataTestId}>
      <ListItemLabel>{props.label}</ListItemLabel>
      {PopupOrValue(props.value)}
    </Field>
  )
}

const PopupOrValue = (value: string) => {
  return value && value.length > 21 ? (
    <Popup
      on="hover"
      content={value}
      position="top center"
      inverted={true}
      trigger={<ListItemValue>{value}</ListItemValue>}
    />
  ) : (
    <ListItemValue>{value}</ListItemValue>
  )
}

export const Field = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(4.2em, max-content));
`

export const ListItemLabel = styled.label`
  margin: 0 8px;
  color: #7f95aa;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  line-height: 21px;
`

export const ListItemValue = styled.span`
  color: #1c2936;
  font-size: 14px;
  line-height: 21px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`
