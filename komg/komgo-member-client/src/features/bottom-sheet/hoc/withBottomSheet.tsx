import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'

import { removeBottomSheetItem, retryItem } from '../store/actions'

const mapStateToProps = (state: ApplicationState) => {
  const bottomsheetState = state.get('bottomSheet')
  return {
    visible: bottomsheetState.get('visible'),
    items: bottomsheetState.get('items')
  }
}

const withBottomSheet = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, { removeBottomSheetItem, retryItem })(Wrapped)

export default withBottomSheet
