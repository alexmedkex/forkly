import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { withRouter, RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { Sidebar, Segment } from 'semantic-ui-react'
import NotificationMenu from './notification-menu/NotificationMenu'
import { withLoaders, WithLoaderProps } from '../components/with-loaders'

import { getProfileAndPermissons, triggerError500 } from '../store/common/actions'
import NavigationMenu from './navigation-menu/NavigationMenu'
import { ErrorReport } from '../features/error-report'
import BottomSheet from '../features/bottom-sheet'

import { ApplicationState } from '../store/reducers'
import { User } from '../store/common/types'
import { LoadingTransition } from '../components/loading-transition'
import { fetchMembers } from '../features/members/store/actions'
import { darkBlueGrey } from '../styles/colors'
import GlobalTaskModal from '../features/tasks/components/GlobalTaskModal'
import { ActionType as UiActionType } from '../store/common/types'

interface DefaultProps {
  sidebarExtended: boolean
  isOpenModalReport: boolean
  companyListIsEmpty: boolean
  uiError?: string
  profile: User
}

interface DefaultActions {
  getProfile: () => any
  fetchMembers: () => any
  triggerError500: () => any
}

export interface IProps extends WithLoaderProps, DefaultProps, DefaultActions, RouteComponentProps<{}> {
  children: React.ReactNode
}

export class DefaultLayout extends React.Component<IProps> {
  componentDidMount() {
    this.props.getProfile()
    this.props.fetchMembers()
  }

  render() {
    const {
      sidebarExtended,
      location,
      uiError,
      isOpenModalReport,
      triggerError500,
      isFetching,
      errors,
      companyListIsEmpty,
      profile
    } = this.props
    const error = errors[0] || uiError

    if (error) {
      return <StyledError>An error occurred, please reload the page.</StyledError>
    }

    const isLoading = isFetching || !profile || companyListIsEmpty
    if (isLoading) {
      const title = companyListIsEmpty ? 'Loading companies' : 'Loading profile'
      return <LoadingTransition imageSize="tiny" title={title} fontSize="18" marginTop="0" top="200px" />
    }

    return (
      <Container>
        <StyledPushable as={Segment}>
          <NotificationMenu />

          {/* This is needed for E2E tests so the System Error flow can be verified */}
          <div data-test-id="trigger-error-500" onClick={triggerError500} />

          <StyledPusher dimmed={sidebarExtended}>
            <NavigationMenu location={location} />
            {/*turn off if /templates/* */}
            <StyledSegment basic={true} padded="very">
              {this.props.children}
              {isOpenModalReport && <ErrorReport />}
              <BottomSheet />
            </StyledSegment>
            <GlobalTaskModal />
          </StyledPusher>
        </StyledPushable>
      </Container>
    )
  }
}

const Container = styled.div`
  font-size: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const StyledPushable = styled(Sidebar.Pushable)`
  &&& {
    transform: none;
    min-height: 100vh;
    border: none;
    border-radius: unset;
  }
`

const StyledPusher = styled(Sidebar.Pusher)`
  &&& {
    width: 100vw;
    backface-visibility: initial;
    min-height: 100vh;
  }
`

const StyledSegment: any = styled(Segment)`
  &&& {
    margin-left: 240px;
    margin-top: 0;
    padding: 0;
  }
`

export const StyledError = styled.div`
  top: 308px;
  font-size: 18px;
  color: ${darkBlueGrey};
  text-align: center;
  position: relative;
`

const mapStateToProps = (state: ApplicationState): DefaultProps => ({
  profile: state.get('uiState').get('profile'),
  uiError: state.get('uiState').get('error'),
  // we cannot use loadingSelector here because it causes issues
  // on the pages where we refresh the list of companies
  companyListIsEmpty:
    state
      .get('members')
      .get('ids')
      .count() === 0,
  sidebarExtended: state.get('uiState').get('sidebarExtended'),
  isOpenModalReport: state.get('errorReport').get('isOpenModal')
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({ getProfile: getProfileAndPermissons, fetchMembers, triggerError500 }, dispatch)
}

export default compose(
  withRouter,
  withLoaders({
    actions: [UiActionType.GetProfileRequest]
  }),
  connect<DefaultProps, DefaultActions>(mapStateToProps, mapDispatchToProps)
)(DefaultLayout)
