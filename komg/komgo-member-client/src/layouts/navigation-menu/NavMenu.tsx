import * as React from 'react'
import styled from 'styled-components'
import { Menu } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'
import NavigationMultipleDepthItems from './NavigationMultipleDepthItems'
import { Route } from '../../store/common/types'
import { navigationBorderPurple, yellow, violet, pinkPurple } from '../../styles/colors'
import { ZENDESK_BASE_URL, ZENDESK_REDIRECT_URI } from '../../utils/endpoints'
import { ZendeskStorage } from '../../utils/zendesk-storage'
import { ErrorReportError, ErrorReportRequest } from '../../features/error-report/store/types'
import { User } from '../../store/common/types'

interface Props {
  active: string
  routes: Route[]
  lastRequests: ErrorReportRequest[]
  lastError: ErrorReportError | null
  user: User
  numberOfUnreadNotifications: number
  showReportIssue: boolean
}

const NavMenu: React.FC<Props> = (props: Props) => {
  const { active, routes, showReportIssue, user, lastRequests, lastError } = props

  const buildId = `${process.env.REACT_APP_BUILD_ID}`
  const shouldShowBuildId = buildId && buildId.length > 0

  const displayReportIssue = (): React.ReactNode => {
    return (
      <ContactUs
        onClick={() => {
          ZendeskStorage.requests = lastRequests
          ZendeskStorage.error = lastError
          ZendeskStorage.currentUrl = window.location.href
          ZendeskStorage.user = {
            userId: user.id,
            userRoles: user.roles,
            companyId: user.company
          }
          window.open(
            `${ZENDESK_BASE_URL}/oauth/authorizations/new?response_type=token&redirect_uri=${ZENDESK_REDIRECT_URI}&client_id=${
              process.env.REACT_APP_ZENDESK_CLIENT_ID
            }&scope=write`
          )
        }}
        data-test-id="navigation-contact-us"
      >
        Contact us
      </ContactUs>
    )
  }

  return (
    <TopMenuItems>
      {routes.map(route => (
        <React.Fragment key={route.name}>
          {route.children.length === 0
            ? route.canView && (
                <Menu.Item data-test-id={`navigation-${route.to}`}>
                  <NavLink to={route.to} exact={route.exact}>
                    {route.name}
                  </NavLink>
                </Menu.Item>
              )
            : route.canView && (
                <NavigationMultipleDepthItems menuName={route.name} active={active}>
                  {route.children.map(
                    childRoute =>
                      childRoute.canView && (
                        <Menu.Item data-test-id={`navigation-${childRoute.to}`} key={childRoute.name}>
                          {childRoute.as === 'NavLink' ? (
                            <NavLink to={childRoute.to} exact={childRoute.exact}>
                              {childRoute.name}
                            </NavLink>
                          ) : (
                            <a href={childRoute.to} {...childRoute.additionalProps || {}}>
                              {childRoute.name}
                            </a>
                          )}
                        </Menu.Item>
                      )
                  )}
                </NavigationMultipleDepthItems>
              )}
        </React.Fragment>
      ))}
      <StyledDivider />
      {showReportIssue && displayReportIssue()}
      {shouldShowBuildId && (
        <>
          <StyledDivider />
          <BuildId>Build ID: {buildId}</BuildId>
        </>
      )}
    </TopMenuItems>
  )
}

const TopMenuItems = styled.div`
  padding-top: 20px;
  flex-grow: 1;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 5px;
  }
`

const ContactUs = styled(Menu.Item)`
  &&&&& {
    padding: 0 30px;
    line-height: 18px;
    margin: 15px 0;
    &:hover {
      color: ${yellow};
      background: ${violet};
    }
  }
`

const BuildId = styled(Menu.Item)`
  &&&&& {
    cursor: default;
    color: ${pinkPurple};
    padding: 0 30px;
    line-height: 18px;
    margin: 15px 0;
  }
`

const StyledDivider = styled.div`
  border-top: 1px solid ${navigationBorderPurple};
  margin: 0 30px 5px 30px;
`

export default NavMenu
