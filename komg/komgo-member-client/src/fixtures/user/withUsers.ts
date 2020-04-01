import { connect } from 'react-redux'
import { fetchUsersAsync, postUserAsync } from './actions'
import { ApplicationState } from '../../store/reducers'

const mapStateToProps = (state: ApplicationState) => {
  return {
    users: state.get('users').get('users')
  }
}

const withUsers = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, { fetchUsersAsync, postUserAsync })(Wrapped)

export default withUsers
