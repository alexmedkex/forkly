import BottomSheetRow, { StyledLastColumn } from './BottomSheetRow'
import React from 'react'

import { CustomStateDocPendingIcon } from '../../../components/custom-icon/CustomStateDocPendingIcon'
import { truncate } from '../../../utils/casings'
class BottomSheetRowPending extends BottomSheetRow {
  render() {
    return (
      <BottomSheetRow
        numRow={this.props.numRow}
        icon={<CustomStateDocPendingIcon className="spin" />}
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
        <b>{displayStatus || 'Registering'}</b> {truncate(name, 14)}
      </div>
    )
  }
  private generateExtraAction() {
    return (
      <StyledLastColumn>
        <div style={{ fontSize: '14px', fontWeight: 'lighter' }}>Average 10 sec.</div>
      </StyledLastColumn>
    )
  }
}

export default BottomSheetRowPending
