import * as React from 'react'
import { Component } from 'react'
import { ActionCreator, connect } from 'react-redux'
import { compose } from 'redux'
import Helmet from 'react-helmet'
import { Button, Dropdown, Grid, Header, Segment, Confirm } from 'semantic-ui-react'
import { Table } from '@komgo/ui-components'
import styled from 'styled-components'
import * as _ from 'lodash'

import { administration } from '@komgo/permissions'
import { Status as CompanyStatus, MemberType } from '@komgo/types'

import { LoadingTransition } from '../../../components/loading-transition'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { ApplicationState } from '../../../store/reducers'
import { Unauthorized, withPermissions, WithPermissionsProps } from '../../../components'
import { IMember } from '../../members/store/types'
import { addCompanyToENS, getCompanies, generateMember, toggleActivationMember, configureMQ } from '../store/actions'
import { AddressBookActionType } from '../store/types'
import { RouteComponentProps, withRouter } from 'react-router'

export interface IProps {
  companies: IMember[]
  onEdit: (staticId: string) => void
  onRowClick: (staticId: string) => void
  onGenerateMember: (staticId: string) => void
  onDeactivateCompany: () => void
  onOnboard: (staticId: string, companyName: string) => void
  onRegister: (staticId: string, companyName: string) => void
  onToggelConfirm: (staticId: string) => void
}

interface State {
  showDiactivatingModal: boolean
  staticId: string | null
}

interface ICompanies {
  companies: IMember[]
}

interface IMemberActions {
  getCompanies: ActionCreator<any>
  generateMember: ActionCreator<any>
  addCompanyToENS: ActionCreator<any>
  configureMQ: ActionCreator<any>
  toggleActivationMember: ActionCreator<any>
}

interface IActionItem {
  companyName: string
  isMember: string
  memberType?: MemberType
  status: string
  staticId: string
}

export interface AddressBookProps
  extends RouteComponentProps<{}>,
    WithLoaderProps,
    WithPermissionsProps,
    ICompanies,
    IMemberActions {}

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
  }
`
const StyledCompanyList = styled.div`
  &&& {
    margin-bottom: 40px;
  }
`

interface IGetMenuItemParameters {
  menuName: string
  staticId: string
  action: (staticId: string, companyName?: string) => void
  label: string
  companyName?: string
}

export const getMenuItem = (parameters: IGetMenuItemParameters) => {
  const { menuName, staticId, action, label, companyName } = parameters
  return (
    <Dropdown.Item
      key={`${menuName}-${staticId}`}
      data-test-id={`${menuName}-${staticId}`}
      name={menuName}
      onClick={() => action(staticId, companyName)}
    >
      {label}
    </Dropdown.Item>
  )
}

export const getCompanyStatus = (isMember: string, status?: string): string => {
  if (status) {
    return status
  }

  return isMember.toLowerCase() === 'yes' ? CompanyStatus.Onboarded : CompanyStatus.Registered
}

export const getConfirmContent = (name: string | undefined) => {
  return <div className="content">Do you really want to deactivate {name}?</div>
}

export const getActionsMenu = ({ staticId, companyName, status, isMember }: IActionItem, props: IProps) => {
  const menu = [getMenuItem({ menuName: 'edit', staticId, action: props.onEdit, label: 'Edit' })]
  const companyStatus = getCompanyStatus(isMember, status)

  if (status === CompanyStatus.Draft) {
    menu.push(
      getMenuItem({
        menuName: 'gen-member-package',
        staticId,
        action: props.onGenerateMember,
        label: 'Generate Member Package'
      })
    )
  } else if (status === CompanyStatus.Ready) {
    if (isMember.toLowerCase() === 'yes') {
      menu.push(
        getMenuItem({
          menuName: 'onboard',
          staticId,
          action: props.onOnboard,
          label: 'Onboard',
          companyName
        })
      )
    } else {
      menu.push(
        getMenuItem({
          menuName: 'register',
          staticId,
          action: props.onRegister,
          label: 'Register',
          companyName
        })
      )
    }
  }

  if (companyStatus === CompanyStatus.Onboarded || companyStatus === CompanyStatus.Registered) {
    menu.push(
      getMenuItem({
        menuName: 'deactivate-member',
        staticId,
        action: props.onToggelConfirm,
        label: 'Deactivate company',
        companyName
      })
    )
  }

  return menu
}

const CompanyList = (props: IProps) => (
  <StyledCompanyList>
    <Table
      data-test-id="companyListTable"
      dataTestId="staticId"
      data={props.companies.map(company => {
        const isMember = company.isMember ? 'Yes' : 'No'

        return {
          companyName: company.x500Name.O,
          isMember,
          memberType: company.memberType,
          status: getCompanyStatus(isMember, company.status),
          staticId: company.staticId
        }
      })}
      columns={[
        { accessor: 'companyName', defaultSortDesc: false },
        { accessor: 'isMember' },
        { accessor: 'memberType', title: 'Member Type' },
        { accessor: 'status' }
      ]}
      onRowClick={item => props.onRowClick(item.staticId)}
      actionsMenu={item => getActionsMenu(item, props)}
    />
  </StyledCompanyList>
)

export class AddressBook extends Component<AddressBookProps, State> {
  constructor(props) {
    super(props)

    this.state = {
      showDiactivatingModal: false,
      staticId: null
    }
  }

  componentDidMount() {
    this.props.getCompanies()
  }

  onAddNewClick = () => {
    this.props.history.push('/address-book/new')
  }

  onEditClick = (staticId: string) => {
    this.props.history.push(`/address-book/${staticId}?edit=true`)
  }

  onRowClick = (staticId: string) => {
    this.props.history.push(`/address-book/${staticId}`)
  }

  onGenerateMemberClick = (staticId: string) => {
    this.props.generateMember(staticId)
  }

  onOnboardClick = (staticId: string, companyName: string) => {
    this.props.addCompanyToENS(staticId, companyName, 'Onboarding')
    this.props.configureMQ(staticId, companyName)
  }

  onRegisterClick = (staticId: string, companyName: string) => {
    this.props.addCompanyToENS(staticId, companyName, 'Registering')
  }

  onDeactivateCompanyClick = () => {
    this.onToggelConfirm()
    this.props.toggleActivationMember(this.state.staticId, false)
  }

  onToggelConfirm = (staticId?: string) => {
    const showDiactivatingModal = !this.state.showDiactivatingModal || false
    const companyStaticId = showDiactivatingModal ? staticId : null

    this.setState({
      showDiactivatingModal,
      staticId: companyStaticId
    })
  }

  render() {
    const { companies, isFetching, isAuthorized } = this.props
    const groupedCompanies = _.keyBy(companies, 'staticId')
    const selectedCompanyName = groupedCompanies[this.state.staticId]
      ? groupedCompanies[this.state.staticId].x500Name.O
      : null

    if (!isAuthorized(administration.canRegisterNonMembers)) {
      return <Unauthorized />
    }

    return (
      <>
        <Helmet>
          <title>Address Book</title>
        </Helmet>
        <StyledGrid>
          <Grid.Column width={8}>
            <Header as="h1">Address Book</Header>
          </Grid.Column>
          <Grid.Column width={8} style={{ textAlign: 'right' }}>
            <Button onClick={this.onAddNewClick} primary={true}>
              Add New
            </Button>
          </Grid.Column>
        </StyledGrid>

        {isFetching ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading companies" />
          </Segment>
        ) : (
          <>
            <CompanyList
              companies={companies}
              onEdit={this.onEditClick}
              onRowClick={this.onRowClick}
              onGenerateMember={this.onGenerateMemberClick}
              onDeactivateCompany={this.onDeactivateCompanyClick}
              onOnboard={this.onOnboardClick}
              onRegister={this.onRegisterClick}
              onToggelConfirm={this.onToggelConfirm}
            />
            <Confirm
              open={this.state.showDiactivatingModal}
              header="Deactivating company"
              content={getConfirmContent(selectedCompanyName)}
              onCancel={() => this.onToggelConfirm()}
              onConfirm={this.onDeactivateCompanyClick}
              confirmButton={<Button negative={true} content="Deactivate company" />}
            />
          </>
        )}
      </>
    )
  }
}

export const combineMembers = (ensMembers, onboardingMembers) => {
  // take unique values form ENS and onboarding and merge them with ENS priority
  const members: IMember[] = _.values(_.merge(_.keyBy(onboardingMembers, 'staticId'), ensMembers))

  return members.filter(member => member.x500Name && !member.isDeactivated)
}

const mapStateToProps = (state: ApplicationState): ICompanies => {
  return {
    companies: combineMembers(
      state
        .get('members')
        .get('byStaticId')
        .toJS(),
      state
        .get('onboarding')
        .get('companies')
        .toJS()
    )
  }
}

const mapDispatchToProps: IMemberActions = {
  addCompanyToENS,
  getCompanies,
  generateMember,
  toggleActivationMember,
  configureMQ
}

export default compose<any>(
  withRouter,
  withPermissions,
  withLoaders({
    actions: [AddressBookActionType.GET_COMPANIES_REQUEST]
  }),
  connect<ICompanies, IMemberActions>(mapStateToProps, mapDispatchToProps)
)(AddressBook)
