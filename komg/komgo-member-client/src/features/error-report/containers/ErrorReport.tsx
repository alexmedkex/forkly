import * as React from 'react'
import Helmet from 'react-helmet'
import { Button, Header, Grid, Menu } from 'semantic-ui-react'
import styled from 'styled-components'
import { compose } from 'redux'
import { connect } from 'react-redux'

import { ApplicationState } from '../../../store/reducers'
import { User } from '../../../store/common/types'
import { ZENDESK_BASE_URL, ZENDESK_REDIRECT_URI } from '../../../utils/endpoints'
import { ZendeskStorage } from '../../../utils/zendesk-storage'
import { ErrorReportError, ErrorReportRequest } from '../store/types'
import { PermissionFullId } from '../../role-management/store/types'
import { administration } from '@komgo/permissions'
import { withPermissions } from '../../../components/with-permissions'

const StyledErrorReport = styled.div`
  &&& {
    position: absolute;
    left: 0;
    top: 0;
    padding: 38px;
    width: 100%;
    min-height: 100%;
    background-color: #fff;
  }
`

const StyledGrid = styled(Grid)`
  &&& {
    margin-top: 62px;
  }
`

const StyledGridColumn = styled(Grid.Column)`
  &&&&& {
    max-width: 480px;
  }
`

const StyledGridRow = styled(Grid.Row)`
  &&&&& {
    padding: 0.6rem 0;
  }
`

const StyledGridRowPadding = styled(Grid.Row)`
  &&&&& {
    padding: 2rem 0 0.6rem;
  }
`

const StyledP = styled.p`
  &&&&& {
    margin: 0;
  }
`

const BoldSpan = styled.span`
  &&&&& {
    font-weight: bold;
  }
`

export const StyledMenuItem = styled(Menu.Item)`
  &&&&& {
    cursor: pointer;
    padding: 0.7rem 0;

    &:hover {
      text-decoration: none;
    }
  }
`

interface Props {
  profile: User
  lastRequests: ErrorReportRequest[]
  lastError: ErrorReportError | null
  isAuthorized(requiredPerm: PermissionFullId): boolean
}

export class ErrorReport extends React.Component<Props, null> {
  constructor(props: null) {
    super(props)
  }

  render() {
    const { lastRequests, lastError, profile, isAuthorized } = this.props
    const title = 'System error occurred'

    const openZendesk = () => {
      ZendeskStorage.requests = lastRequests
      ZendeskStorage.error = lastError
      ZendeskStorage.currentUrl = window.location.href
      ZendeskStorage.user = {
        userId: profile.id,
        userRoles: profile.roles,
        companyId: profile.company
      }
      window.open(
        `${ZENDESK_BASE_URL}/oauth/authorizations/new?response_type=token&redirect_uri=${ZENDESK_REDIRECT_URI}&client_id=${
          process.env.REACT_APP_ZENDESK_CLIENT_ID
        }&scope=write`
      )
    }
    return (
      <StyledErrorReport>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <StyledGrid container={true}>
          <StyledGridRow centered={true}>
            <StyledGridColumn width={12}>
              <Header as="h1">{title}</Header>
            </StyledGridColumn>
          </StyledGridRow>
          <StyledGridRow centered={true}>
            <StyledGridColumn width={12}>
              <span>
                Sorry, we cannot get that information right now. Please try again later. If the problem continues,
                report the issue.
              </span>
            </StyledGridColumn>
          </StyledGridRow>
          <StyledGridRowPadding centered={true}>
            <StyledGridColumn width={12}>
              <BoldSpan>Technical details</BoldSpan>
              <StyledP>
                Message: <i>{lastError ? lastError.message : ''}</i>
              </StyledP>
              <StyledP>
                Error ID: <i>{lastError ? lastError.requestId : ''}</i>
              </StyledP>
            </StyledGridColumn>
          </StyledGridRowPadding>
          {isAuthorized(administration.canReportIssue) && (
            <StyledGridRow centered={true}>
              <StyledGridColumn width={12}>
                <Button onClick={openZendesk} primary={true}>
                  Report system error
                </Button>
              </StyledGridColumn>
            </StyledGridRow>
          )}
          <StyledGridRow centered={true}>
            <StyledGridColumn width={12}>
              <StyledMenuItem onClick={() => window.location.reload()}>Refresh the page</StyledMenuItem>
            </StyledGridColumn>
          </StyledGridRow>
        </StyledGrid>
      </StyledErrorReport>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  profile: state.get('uiState').get('profile'),
  lastRequests: state.get('errorReport').get('lastRequests'),
  lastError: state.get('errorReport').get('lastError')
})

export default compose<React.ComponentType<Partial<Props>>>(withPermissions, connect(mapStateToProps, null))(
  ErrorReport
)
