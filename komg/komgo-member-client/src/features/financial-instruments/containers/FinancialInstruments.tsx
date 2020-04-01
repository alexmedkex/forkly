import * as React from 'react'
import Helmet from 'react-helmet'
import { Tab, TabProps } from 'semantic-ui-react'
import styled from 'styled-components'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import qs from 'qs'
import { tradeFinanceManager } from '@komgo/permissions'
import { productLC } from '@komgo/products'

import { ApplicationState } from '../../../store/reducers'
import {
  withPermissions,
  WithPermissionsProps,
  withLicenseCheck,
  WithLicenseCheckProps,
  Unauthorized
} from '../../../components'

import LetterOfCreditDashboard from '../../letter-of-credit-legacy/containers/LetterOfCreditDashboard'
import StandByLetterOfCreditDashboard from '../../standby-letter-of-credit-legacy/containers/StandByLetterOfCreditDashboard'

export const LC = 'Letters of Credit'
export const SBLC = 'Standby Letters of Credit'

export interface Tab {
  name: string
  index: number
  menuItem: string
  pane: React.ReactElement<any>
}

interface IProps extends RouteComponentProps<{}>, WithPermissionsProps, WithLicenseCheckProps {
  numberOfLC: number
  numberOfSBLC: number
}

interface IState {
  activeTab: number
}

export class FinancialInstruments extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    const { tab } = qs.parse(props.location.search.replace('?', ''))
    const tabs = this.getTabs()
    const [active] = Object.values(tabs).filter(t => t.name === tab && this.canViewTab(t))
    this.state = {
      activeTab: active ? active.index : 0
    }
  }

  getTabs = () => {
    const { numberOfLC, numberOfSBLC } = this.props
    const activeTab = this.state && this.state.activeTab
    return {
      LC: {
        name: LC,
        index: 0,
        menuItem: `${LC} (${numberOfLC})`,
        pane: (
          <StyledTabPane key={LC}>
            <LetterOfCreditDashboard isActive={activeTab === 0} />
          </StyledTabPane>
        )
      },
      SBLC: {
        name: SBLC,
        index: 1,
        menuItem: `${SBLC} (${numberOfSBLC})`,
        pane: (
          <StyledTabPane key={SBLC}>
            <StandByLetterOfCreditDashboard isActive={activeTab === 1} />
          </StyledTabPane>
        )
      }
    }
  }

  handleTabChanges = (_: React.MouseEvent<HTMLDivElement>, data: TabProps) => {
    const tabs = this.getTabs()
    const [active] = Object.values(tabs).filter(t => t.index === data.activeIndex)
    this.setState({ activeTab: active.index }, this.syncUrlWithState)
  }

  syncUrlWithState = () => {
    const tabs = this.getTabs()
    const [tab] = Object.values(tabs).filter(t => t.index === this.state.activeTab)
    this.props.history.push(
      `${this.props.location.pathname}?${qs.stringify({
        ...qs.parse(this.props.location.search.replace('?', '')),
        tab: tab.name
      })}`
    )
  }

  canViewTab = (tab: Tab) => {
    switch (tab.name) {
      case LC:
        return this.canViewLC()
      case SBLC:
        return this.canViewSBLC()
      default:
        return false
    }
  }

  canViewLC = () => {
    const { isAuthorized } = this.props
    return (
      isAuthorized(tradeFinanceManager.canReadReviewIssuedLC) ||
      isAuthorized(tradeFinanceManager.canManageLCRequests) ||
      isAuthorized(tradeFinanceManager.canManageCollections) ||
      isAuthorized(tradeFinanceManager.canManagePresentations) ||
      isAuthorized(tradeFinanceManager.canReadReviewPresentation) ||
      isAuthorized(tradeFinanceManager.canReadReviewLCApp)
    )
  }

  canViewSBLC = () => {
    const { isAuthorized } = this.props

    return (
      isAuthorized(tradeFinanceManager.canManageSBLCRequests) ||
      isAuthorized(tradeFinanceManager.canReadReviewSBLC) ||
      isAuthorized(tradeFinanceManager.canCrudReviewSBLC)
    )
  }

  getPanes = () => {
    const tabs = Object.values(this.getTabs()).filter(tab => this.canViewTab(tab))
    return tabs.map(tab => ({ menuItem: tab.menuItem, pane: tab.pane }))
  }

  isAuthorized = () => {
    return (this.canViewLC() || this.canViewSBLC()) && this.props.isLicenseEnabled(productLC)
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>Financial instruments</title>
        </Helmet>
        <h1>Financial Instruments</h1>
        {!this.isAuthorized() ? (
          <Unauthorized />
        ) : (
          <StyledTab
            panes={this.getPanes()}
            onTabChange={this.handleTabChanges}
            activeIndex={this.state.activeTab}
            renderActiveOnly={false}
            data-test-id="financial-instruments-tab"
          />
        )}
      </React.Fragment>
    )
  }
}

const StyledTabPane = styled(Tab.Pane)`
  &&&& {
    padding-left: 0;
    padding-right: 0;
  }
`
// TODO: some fixes should be added in KOMGO-THEME
const StyledTab = styled(Tab)`
  &&& {
    .attached.tabular.menu {
      margin: 0 -20px;
      .item {
        border: none;
        font-weight: 700;
      }
      .active.item {
        margin-bottom: 0;
      }
    }
  }
`

const mapStateToProps = (state: ApplicationState) => {
  // TODO: once api implement pagination this part should be refactored to use total
  return {
    numberOfLC: state
      .get('lettersOfCredit')
      .get('ids')
      .count(),
    numberOfSBLC: state.get('standByLettersOfCredit').get('total')
  }
}

export default compose(withPermissions, withLicenseCheck, withRouter, connect(mapStateToProps))(FinancialInstruments)
