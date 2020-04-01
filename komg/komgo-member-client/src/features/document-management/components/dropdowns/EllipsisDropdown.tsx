import * as React from 'react'
import { Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'
import { HasId } from '../../store'
import { DropdownOption } from '../documents/my-documents/DocumentListDropdownOptions'

const StyledDropdown = styled(Dropdown)`
  padding-right: 0.5em;
`

interface Props<T extends HasId> {
  item: T
  style?: React.CSSProperties
  options(item: T): DropdownOption[]
}

export function EllipsisDropdown<T extends HasId>(props: Props<T>) {
  return (
    <StyledDropdown
      inline={true}
      options={props.options(props.item)}
      id={props.item.id}
      icon={'ellipsis horizontal'}
      direction={'left'}
      style={props.style}
    />
  )
}
