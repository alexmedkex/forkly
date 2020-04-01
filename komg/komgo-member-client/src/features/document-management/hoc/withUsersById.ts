import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'
import { fetchUsersAsync } from '../../../fixtures/user/actions'
/* Move this to src/utils already */
import { groupBy } from '../components/documents/my-documents/toMap'

const mapStateToProps = (state: ApplicationState) => {
  const users = state.get('users').get('users')
  const usersById = groupBy(users, user => user.id)
  return {
    users,
    usersById
  }
}

const withUsersById = (Wrapped: React.ComponentType) => connect(mapStateToProps, { fetchUsersAsync })(Wrapped)

export default withUsersById
