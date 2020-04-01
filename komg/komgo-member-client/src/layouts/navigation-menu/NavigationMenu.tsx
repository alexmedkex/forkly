import * as React from 'react'
import styled from 'styled-components'
import { Location } from 'history'
import { Menu } from 'semantic-ui-react'
import { connect, Dispatch } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { matchPath } from 'react-router'
import { productKYC, productLC, productRD } from '@komgo/products'
import { tradeFinanceManager, coverage, administration, kyc, template } from '@komgo/permissions'

import { withPermissions } from '../../components/with-permissions'
import { withLicenseCheck } from '../../components/with-license-check'
import { ApplicationState } from '../../store/reducers'
import { getKeycloakInstance, getUserAdministrationPageUrl } from '../../utils/keycloak'
import { JWT } from '../../utils/jwt-storage'
import { PermissionFullId } from '../../features/role-management/store/types'
import { setSidebarExtended } from '../../store/common/actions'
import NavMenu from './NavMenu'
import { User, Route } from '../../store/common/types'
import TopFixedMenu from './TopFixedMenu'
import { ErrorReportError, ErrorReportRequest } from '../../features/error-report/store/types'
import { MemberState } from '../../features/members/store/types'
import { IProduct } from '../../features/licenses/store/types'
import { dark, yellow, violet, darkViolet, darkPurpleWithOpacity, white } from '../../styles/colors'
import { getRealmNameFromJWT } from '../../utils/user-storage'

interface Props {
  sidebarExtended: boolean
  numberOfUnreadNotifications: number
  lastRequests: ErrorReportRequest[]
  lastError: ErrorReportError | null
  user: User
  location: Location
  members: MemberState
  isAuthorized(requiredPerm: PermissionFullId): boolean
  setSidebar(sidebarExtended: boolean): void
  isLicenseEnabled(product: IProduct): boolean
}

interface State {
  active: string
}

// We must use string interpolation, otherwise webpack will put a result of the expression, i.e. false
// That's because '%REACT_APP_IS_KOMGO_NODE%' !== 'true' (see Dockerfile)
const isKomgoNode = `${process.env.REACT_APP_IS_KOMGO_NODE}` === 'true'

/* tslint:disable: cyclomatic-complexity */
export class NavigationMenu extends React.Component<Props, State> {
  static logout = () => {
    JWT.clearAll()
    const realmName = getRealmNameFromJWT()
    getKeycloakInstance(realmName).logout({
      redirectUri: window.location.origin
    })
  }

  routes: Route[] = [
    {
      to: '/tasks',
      exact: false,
      name: 'Tasks dashboard',
      canView: true,
      children: [],
      as: 'NavLink'
    },
    {
      to: '/trades',
      exact: false,
      name: 'Trades',
      children: [],
      canView:
        this.props.isAuthorized(tradeFinanceManager.canManageLCRequests) ||
        this.props.isAuthorized(tradeFinanceManager.canManageSBLCRequests) ||
        this.props.isAuthorized(tradeFinanceManager.canReadTrades),
      as: 'NavLink'
    },
    {
      to: '/trade-documents',
      exact: false,
      name: 'Trade document library',
      children: [],
      canView: this.props.isAuthorized(tradeFinanceManager.canReadTradeDocs),
      as: 'NavLink'
    },
    {
      to: '/counterparties',
      exact: false,
      name: 'komgo network',
      children: [],
      canView: this.props.isAuthorized(coverage.canReadCoverage),
      as: 'NavLink'
    },
    {
      to: '',
      exact: false,
      name: 'Financial instruments',
      canView:
        this.props.isAuthorized(tradeFinanceManager.canManageLCRequests) ||
        this.props.isAuthorized(tradeFinanceManager.canReadReviewSBLC) ||
        this.props.isAuthorized(tradeFinanceManager.canReadTrades) ||
        this.props.isAuthorized(tradeFinanceManager.canReadReviewLCApp) ||
        this.props.isAuthorized(tradeFinanceManager.canReadReviewIssuedLC) ||
        this.props.isAuthorized(tradeFinanceManager.canManageCollections) ||
        this.props.isAuthorized(tradeFinanceManager.canManagePresentations) ||
        this.props.isAuthorized(tradeFinanceManager.canReadReviewPresentation),
      as: 'NavLink',
      children: [
        {
          to: '/letters-of-credit/dashboard',
          exact: false,
          name: 'SBLC',
          children: [],
          canView:
            this.props.isLicenseEnabled(productLC) &&
            (this.props.isAuthorized(tradeFinanceManager.canManageLCRequests) ||
              this.props.isAuthorized(tradeFinanceManager.canManageSBLCRequests) ||
              this.props.isAuthorized(tradeFinanceManager.canReadReviewLCApp) ||
              this.props.isAuthorized(tradeFinanceManager.canReadReviewIssuedLC) ||
              this.props.isAuthorized(tradeFinanceManager.canManageCollections) ||
              this.props.isAuthorized(tradeFinanceManager.canManagePresentations) ||
              this.props.isAuthorized(tradeFinanceManager.canReadReviewPresentation)),
          as: 'NavLink'
        },
        {
          to: '/templates',
          exact: false,
          name: 'Templates',
          children: [],
          canView: this.props.isLicenseEnabled(productLC) && this.props.isAuthorized(template.canManageTemplateRead),
          as: 'NavLink'
        },
        {
          to: '/financial-instruments',
          exact: false,
          name: 'Legacy LC/SBLC',
          children: [],
          canView:
            this.props.isLicenseEnabled(productLC) &&
            (this.props.isAuthorized(tradeFinanceManager.canManageLCRequests) ||
              this.props.isAuthorized(tradeFinanceManager.canManageSBLCRequests) ||
              this.props.isAuthorized(tradeFinanceManager.canReadReviewLCApp) ||
              this.props.isAuthorized(tradeFinanceManager.canReadReviewIssuedLC) ||
              this.props.isAuthorized(tradeFinanceManager.canManageCollections) ||
              this.props.isAuthorized(tradeFinanceManager.canManagePresentations) ||
              this.props.isAuthorized(tradeFinanceManager.canReadReviewPresentation)),
          as: 'NavLink'
        }
      ]
    },
    {
      to: '',
      exact: false,
      name: 'Risk cover / Discounting',
      canView:
        (this.props.isLicenseEnabled(productRD) &&
          (this.props.isAuthorized(tradeFinanceManager.canReadRD) ||
            this.props.isAuthorized(tradeFinanceManager.canReadRDRequests))) ||
        this.props.isAuthorized(tradeFinanceManager.canReadRiskCover) ||
        this.props.isAuthorized(tradeFinanceManager.canCrudRiskCover),
      as: 'NavLink',
      children: [
        {
          to: '/risk-cover',
          exact: false,
          name: 'Appetite',
          children: [],
          canView:
            this.props.isAuthorized(tradeFinanceManager.canReadRiskCover) ||
            this.props.isAuthorized(tradeFinanceManager.canCrudRiskCover),
          as: 'NavLink'
        },
        {
          to: '/receivable-discounting',
          exact: false,
          name: 'Transactions',
          children: [],
          canView:
            this.props.isLicenseEnabled(productRD) &&
            (this.props.isAuthorized(tradeFinanceManager.canReadRD) ||
              this.props.isAuthorized(tradeFinanceManager.canReadRDRequests)),
          as: 'NavLink'
        }
      ]
    },
    {
      to: '',
      exact: false,
      name: 'Bank Confirmation Discounting',
      canView:
        this.props.isAuthorized(tradeFinanceManager.canCrudBankLine) ||
        this.props.isAuthorized(tradeFinanceManager.canReadBankLine),
      as: 'NavLink',
      children: [
        {
          to: '/bank-lines',
          exact: false,
          name: 'Appetite',
          children: [],
          canView:
            this.props.isAuthorized(tradeFinanceManager.canCrudBankLine) ||
            this.props.isAuthorized(tradeFinanceManager.canReadBankLine),
          as: 'NavLink'
        }
      ]
    },
    {
      to: '',
      exact: false,
      name: 'Liquidity',
      canView:
        this.props.isAuthorized(tradeFinanceManager.canReadDeposit) ||
        this.props.isAuthorized(tradeFinanceManager.canCrudDeposit) ||
        this.props.isAuthorized(tradeFinanceManager.canCrudLoan) ||
        this.props.isAuthorized(tradeFinanceManager.canReadLoan),
      as: 'NavLink',
      children: [
        {
          to: '/deposits',
          exact: false,
          name: 'Deposits',
          children: [],
          canView:
            this.props.isAuthorized(tradeFinanceManager.canReadDeposit) ||
            this.props.isAuthorized(tradeFinanceManager.canCrudDeposit),
          as: 'NavLink'
        },
        {
          to: '/loans',
          exact: false,
          name: 'Loans',
          children: [],
          canView:
            this.props.isAuthorized(tradeFinanceManager.canCrudLoan) ||
            this.props.isAuthorized(tradeFinanceManager.canReadLoan),
          as: 'NavLink'
        }
      ]
    },
    {
      to: '',
      exact: false,
      name: 'KYC',
      canView:
        this.props.isLicenseEnabled(productKYC) &&
        (this.props.isAuthorized(kyc.canReadDocs) ||
          this.props.isAuthorized(kyc.canReadDocReq) ||
          this.props.isAuthorized(kyc.canReadRequestedDocs) ||
          this.props.isAuthorized(kyc.canReviewDocs)),
      as: 'NavLink',
      children: [
        {
          to: '/documents',
          exact: false,
          name: 'My profile',
          children: [],
          canView: this.props.isAuthorized(kyc.canReadDocs) || this.props.isAuthorized(kyc.canReadDocReq),
          as: 'NavLink'
        },
        {
          to: '/counterparty-docs',
          exact: false,
          name: 'Counterparty profiles',
          children: [],
          canView: this.props.isAuthorized(kyc.canReadRequestedDocs) || this.props.isAuthorized(kyc.canReviewDocs),
          as: 'NavLink'
        }
        // TODO PostMVP
        /* {
          to: '/templates',
          exact: false,
          name: 'Template manager',
          children: [],
          canView: true,
          as: 'NavLink'
        } */
      ]
    },
    {
      to: '',
      exact: false,
      name: 'Administration',
      canView:
        this.props.isAuthorized(administration.canReadUsers) ||
        this.props.isAuthorized(administration.canReadRoles) ||
        this.props.isAuthorized(administration.canManageCustomerLicenses) ||
        this.props.isAuthorized(administration.canViewLicenses),
      as: 'NavLink',
      children: [
        {
          to: getUserAdministrationPageUrl(getRealmNameFromJWT()),
          exact: false,
          name: 'User Management',
          children: [],
          canView: this.props.isAuthorized(administration.canReadUsers),
          as: 'a',
          additionalProps: {
            target: 'blank'
          }
        },
        {
          to: '/roles',
          exact: false,
          name: 'Role Management',
          children: [],
          canView: this.props.isAuthorized(administration.canReadRoles),
          as: 'NavLink'
        },
        {
          to: '/manage-licenses',
          exact: false,
          name: 'License Management',
          children: [],
          canView: isKomgoNode && this.props.isAuthorized(administration.canManageCustomerLicenses),
          as: 'NavLink'
        },
        {
          to: '/address-book',
          exact: false,
          name: 'Address Book',
          children: [],
          canView: this.props.isAuthorized(administration.canRegisterNonMembers),
          as: 'NavLink'
        },
        {
          to: '/product-licenses',
          exact: false,
          name: 'Product Licenses',
          children: [],
          // canView: this.props.isAuthorized(administration.canViewLicenses),
          canView: false, // Disabled by request from PO. Will be reviewed later
          as: 'NavLink'
        }
      ]
    }
  ]

  constructor(props: Props) {
    super(props)
    this.state = {
      active: ''
    }
  }

  componentDidMount() {
    this.findActiveRoute()
  }

  componentDidUpdate(oldProps: Props) {
    if (oldProps.location !== this.props.location) {
      this.findActiveRoute()
    }
  }

  findActiveRoute = () => {
    this.routes.forEach(route => {
      if (route.children.length === 0) {
        if (this.checkIfRouteIsActive(route)) {
          this.setState({ active: route.name })
        }
      } else {
        route.children.forEach(childRoute => {
          if (this.checkIfRouteIsActive(childRoute)) {
            this.setState({ active: route.name })
          }
        })
      }
    })
  }

  checkIfRouteIsActive = (route: Route) => {
    const match = matchPath(this.props.location.pathname, {
      path: route.to,
      exact: false,
      strict: false
    })

    if (match && this.state.active !== route.name) {
      return true
    }
    return false
  }

  render() {
    const { lastRequests, lastError } = this.props

    return (
      <StyledSidebar>
        <TopFixedMenu
          user={this.props.user}
          sidebarExtended={this.props.sidebarExtended}
          numberOfUnreadNotifications={this.props.numberOfUnreadNotifications}
          setSidebar={this.props.setSidebar}
          logout={NavigationMenu.logout}
        />
        <NavMenu
          active={this.state.active}
          routes={this.routes}
          lastRequests={lastRequests}
          lastError={lastError}
          user={this.props.user}
          numberOfUnreadNotifications={this.props.numberOfUnreadNotifications}
          showReportIssue={this.props.isAuthorized(administration.canReportIssue)}
        />
      </StyledSidebar>
    )
  }
}

const StyledSidebar: any = styled(Menu)`
  &&& {
    position: fixed;
    width: 240px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-y: visible !important;
    z-index: 11;
    border: none;
    border-radius: unset;
    background: ${violet};
    .menu {
      background: ${violet};
      > .item {
        &:hover {
          background: ${violet};
        }
      }
    }
    .item {
      padding: 0;
      color: ${white};
      &:before {
        display: none;
      }
      a {
        color: ${white};
        font-size: 16px;
        line-height: 22px;
        padding: 10px 30px 8px 30px;
        width: 100%;
        &:hover {
          background: ${darkPurpleWithOpacity};
        }
        &.active {
          color: ${yellow} !important;
          background: ${darkPurpleWithOpacity};
        }
      }
    }
  }
`

const mapStateToProps = (state: ApplicationState) => ({
  members: state.get('members'),
  sidebarExtended: state.get('uiState').get('sidebarExtended'),
  notifications: state.get('notifications').get('notifications'),
  lastRequests: state.get('errorReport').get('lastRequests'),
  lastError: state.get('errorReport').get('lastError'),
  numberOfUnreadNotifications: state.get('notifications').get('unreadCount'),
  user: state.get('uiState').get('profile')
})

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      setSidebar: setSidebarExtended
    },
    dispatch
  )

export default compose<React.ComponentType<Partial<Props>>>(
  withPermissions,
  withLicenseCheck,
  connect(mapStateToProps, mapDispatchToProps)
)(NavigationMenu)
