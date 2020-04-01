import { connect } from 'react-redux'
import { toggleModalVisible, setModalStep } from '../store/modals/actions'
import { ApplicationState } from '../../../store/reducers'

const mapStateToProps = (state: ApplicationState) => {
  const modalsState = state.getIn(['modals', 'modals'])

  return {
    modals: modalsState.toJS()
  }
}

const withModalsState = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, { toggleModalVisible, setModalStep })(Wrapped)

export default withModalsState
