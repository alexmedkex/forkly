import * as React from 'react'
import IdleTimer from 'react-idle-timer'
import { Provider } from 'react-redux'
import { Helmet } from 'react-helmet'
import { ConnectedRouter } from 'react-router-redux'
import '@komgo/komgo-theme/dist/semantic.min.css'
import './styles/ui-updates.css'
import 'react-toastify/dist/ReactToastify.css'
import { css } from 'glamor'
import { injectGlobal } from 'styled-components'

import Routes from './routes'
import { getKeycloakInstance } from './utils/keycloak'

import { store, history } from './store'
import { LoadingTransition } from './components/loading-transition'
import getAuthService, { AutheticationService } from './utils/AutheticationService'
import { ToastContainerIds } from './utils/toast'
import { stringOrNull } from './utils/types'
import { StyledError } from './layouts/Default'
import { ToastContainer, toast } from 'react-toastify'
import { Route, RouteComponentProps, Router, Switch } from 'react-router'
import { getRealmName, getRealmNameFromJWT } from './utils/user-storage'

// tslint:disable-next-line
injectGlobal`
  html, body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  div {
    box-sizing: border-box;
  }
  .modal {
    z-index: 1000;
    padding: 0;
  }

  // Set styles to correctly display PDF with "react-pdf" library

  div.pdf-viewer div {
    height: calc(100%) !important;
    width: calc(100%) !important;
  }

  div.pdf-viewer div svg {
    height: calc(100%);
    width: calc(100%);
  }
`
interface MatchParams {
  realmName: string
}

interface Props extends RouteComponentProps<MatchParams> {
  store?: number
  routes?: number
}

interface State {
  isLoading: boolean
  error: stringOrNull
}

const loginPath = '/login/:realmName'

class App extends React.Component<Props, State> {
  private authService: AutheticationService
  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true,
      error: null
    }
  }

  async componentDidMount() {
    const pathName = window.location.pathname.toLowerCase()
    // /doc-verification is an old path used for verification link feature
    if (
      pathName.includes('/doc-verification') ||
      pathName.includes('/document-verification') ||
      pathName.includes('/outlook-document-verification')
    ) {
      return this.setState({ isLoading: false })
    }

    try {
      // take realm name from url if it's a login page (used in LMS flow)
      const realmNameFromUrl = this.props.match.params.realmName
      const realmName = getRealmName(realmNameFromUrl)
      if (!realmName) {
        this.setState({ error: 'Please enter a correct login URL' })
        return
      }
      this.authService = getAuthService(realmName)

      await this.authService.authenticate()
      this.authService.startJWTRefresh()

      // setTimeout used to create a smooth transition display while waiting
      setTimeout(() => {
        this.setState({ isLoading: false })
      }, 1000)

      // Flow: user enters /login/<static-id> -> KC login page -> KC redirects back to /login/<static-id> ->
      // -> now we need to redirect a logged in user to '/'
      if (this.props.match.path === loginPath) {
        this.props.history.replace('/')
      }
    } catch (e) {
      this.setState({ error: 'An error occurred, please reload the page.' })
    }
  }

  componentWillUnmount() {
    this.authService.stopJWTRefresh()
  }

  render() {
    if (this.state.error) {
      return <StyledError>{this.state.error}</StyledError>
    }
    if (this.state.isLoading) {
      return (
        <LoadingTransition imageSize="tiny" title="Checking authorization" fontSize="18" marginTop="0px" top="200px" />
      )
    }

    const realmName = getRealmNameFromJWT()

    return (
      <>
        <Helmet titleTemplate="%s &mdash; KOMGO" />
        <ToastContainer
          containerId={ToastContainerIds.Default}
          enableMultiContainer={true}
          position={toast.POSITION.BOTTOM_CENTER}
          closeButton={false}
        />
        <ToastContainer
          className={css({
            width: 'unset !important'
          })}
          containerId={ToastContainerIds.Custom}
          enableMultiContainer={true}
          data-test-id="toasts-container"
          closeButton={false}
        />

        <IdleTimer onIdle={getKeycloakInstance(realmName).logout} timeout={1000 * 60 * 30}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Routes />
            </ConnectedRouter>
          </Provider>
        </IdleTimer>
      </>
    )
  }
}

const AppWithRoutes = () => (
  <Router history={history}>
    <Switch>
      <Route exact={true} path={loginPath} component={App} />
      <Route path="/" component={App} />
    </Switch>
  </Router>
)

export default AppWithRoutes
