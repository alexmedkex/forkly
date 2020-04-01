import * as React from 'react'
import styled from 'styled-components'

import { CustomFindDocIcon } from '../../../components/custom-icon/CustomFindDocIcon'
import { BottomSheetItem } from '../store/types'
import { BottomSheetStatus } from '../store/types'

interface Props {
  numRow: number
  item: BottomSheetItem
  icon?: React.ReactNode
  message?: React.ReactNode
  visible: boolean
  expanded: boolean
  extraAction?: React.ReactNode
  onExtraActionClick?(...args: any[]): void
  onNavigateToClick?(item: BottomSheetItem): void
}

export default class BottomSheetRow extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  calculateSize = () => {
    if (this.props.expanded) {
      return '430px'
    }
    return '440px'
  }

  render() {
    const { visible, item, message, extraAction, icon } = this.props
    return visible ? (
      <StyledBottomSheetItem style={{ width: this.calculateSize() }} data-test-id={item.name}>
        <BottomSheetRowIcon style={{ marginRight: '10px' }} data-test-id={'bottomsheet-item-icon-' + this.props.numRow}>
          {icon}
        </BottomSheetRowIcon>
        <BottomSheetRowMessage className="bottom-sheet-message">{message}</BottomSheetRowMessage>
        {item.state === BottomSheetStatus.REGISTERED && (
          <BottomSheetRowIcon style={{ marginRight: '10px' }}>
            <CustomFindDocIcon style={{ cursor: 'pointer' }} onClick={() => this.props.onNavigateToClick(item)} />
          </BottomSheetRowIcon>
        )}
        <BottomSheetRowAction className="bottom-sheet-action">{extraAction}</BottomSheetRowAction>
      </StyledBottomSheetItem>
    ) : null
  }
}

export const BottomSheetRowIcon = styled.div`
  display: flex;
  align-items: center;
`

export const BottomSheetRowMessage = styled.div`
  flex-grow: 2;
  display: flex;
  align-items: center;
`

export const BottomSheetRowAction = styled.div`
  display: flex;
  align-items: center;
`

export const StyledBottomSheetItem = styled.div`
  padding: 15px
  height: 50px
  width: 440px
  background-color: #f6f6f6
  border-bottom: solid 1px #dbe5ec
  display: flex
  flex-direction: row
  justify-content: space-between
`

export const StyledLastColumn = styled.div`
  cursor: pointer;
  float: right;
`
