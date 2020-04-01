import React from 'react'

import BottomSheetRow, { StyledLastColumn } from './BottomSheetRow'

import { CustomStateDocErrorIcon } from '../../../components/custom-icon/CustomStateDocErrorIcon'
import { truncate } from '../../../utils/casings'
class BottomSheetRowError extends BottomSheetRow {
  render() {
    return (
      <BottomSheetRow
        numRow={this.props.numRow}
        icon={<CustomStateDocErrorIcon />}
        message={this.generateMessage()}
        extraAction={this.generateExtraAction()}
        item={this.props.item}
        visible={this.props.visible}
        expanded={this.props.expanded}
      />
    )
  }

  private generateMessage() {
    const { name, displayStatus } = this.props.item
    return (
      <div>
        <b>{displayStatus || 'Error registering '}</b> {truncate(name, 14)}
      </div>
    )
  }
  private generateExtraAction() {
    return (
      <StyledLastColumn>
        <a onClick={() => this.props.onExtraActionClick(this.props.item)}>Retry</a>
      </StyledLastColumn>
    )
  }
}

export default BottomSheetRowError
