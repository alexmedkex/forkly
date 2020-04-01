import * as React from 'react'
import { List } from 'semantic-ui-react'
import styled from 'styled-components'
import { HasId } from '../../../../features/document-management/store'
import GreyHeader from '../GreyHeader'

const FlexSpaceBetween = styled.div`
  display: flex;
  flex-direction: row;
  height: 30px;
`

interface Props<T extends HasId> {
  title: string
  items: T[]
  itemToListItemContent(item: T): { [index: string]: JSX.Element | string }
}

export function HeadedList<T extends HasId>(props: Props<T>) {
  return (
    <List divided={true}>
      <GreyHeader content={props.title} block={true} />
      {props.items.map((item, index) => {
        return (
          <List.Item
            key={`${item.id}_${index}`}
            content={pluckRenderableFields(props.itemToListItemContent(item))}
            style={{ paddingBottom: 0 }}
          />
        )
      })}
    </List>
  )
}

export function pluckRenderableFields(item: any) {
  return (
    <FlexSpaceBetween>
      {Object.keys(item).map(field => {
        return field === 'id' ? null : <React.Fragment key={`${item.id}_${field}`}>{item[field]}</React.Fragment>
      })}
    </FlexSpaceBetween>
  )
}
