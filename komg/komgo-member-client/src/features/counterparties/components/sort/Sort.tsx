import * as React from 'react'
import { Icon } from 'semantic-ui-react'
import styled from 'styled-components'

enum Order {
  asc = 'ascending',
  desc = 'descending'
}

interface Props {
  columnKey: string
  handleSort(column: string, order: Order): void
}

const Sort: React.SFC<Props> = (props: Props) => {
  const { handleSort, columnKey } = props
  return (
    <StyledSort>
      <Icon name="caret down" onClick={() => handleSort(columnKey, Order.desc)} />
      <Icon name="caret up" onClick={() => handleSort(columnKey, Order.asc)} />
    </StyledSort>
  )
}

const StyledSort = styled.div`
  display: inline-block;
  position: relative;
  margin-left: 10px;
  .icon {
    position: absolute;
    cursor: pointer;
  }
  .down {
    bottom: -5px;
  }
  .up {
    bottom: 5px;
  }
`

export default Sort
