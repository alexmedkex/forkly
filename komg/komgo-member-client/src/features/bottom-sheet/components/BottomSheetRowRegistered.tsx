import React from 'react'
import { Icon } from 'semantic-ui-react'

import BottomSheetRow, { BottomSheetRowIcon, StyledLastColumn } from './BottomSheetRow'

import { CustomStateDocSuccessIcon } from '../../../components/custom-icon/CustomStateDocSuccessIcon'
import { CustomCloseIcon } from '../../../components/custom-icon/CustomCloseIcon'
import { truncate } from '../../../utils/casings'

class BottomSheetRowRegistered extends BottomSheetRow {
  render() {
    return (
      <BottomSheetRow
        numRow={this.props.numRow}
        icon={<CustomStateDocSuccessIcon />}
        message={this.generateMessage()}
        extraAction={this.generateExtraAction()}
        item={this.props.item}
        visible={this.props.visible}
        expanded={this.props.expanded}
        onNavigateToClick={this.props.onNavigateToClick}
      />
    )
  }

  private generateMessage() {
    const { name, displayStatus } = this.props.item
    return (
      <div>
        {truncate(name, 14)} <b>{displayStatus || 'registered'}</b>
      </div>
    )
  }
  private generateExtraAction() {
    return (
      <BottomSheetRowIcon>
        <CustomCloseIcon onClick={() => this.props.onExtraActionClick(this.props.item.id)} />
      </BottomSheetRowIcon>
    )
  }
}

export default BottomSheetRowRegistered
