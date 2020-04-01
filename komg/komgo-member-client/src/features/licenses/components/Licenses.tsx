import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Helmet from 'react-helmet'
import { Checkbox, CheckboxProps, Grid, Header, SearchProps, Segment, Table } from 'semantic-ui-react'
import styled from 'styled-components'
import _ from 'lodash'

import { allProducts } from '@komgo/products'
import { administration } from '@komgo/permissions'

import { LoadingTransition } from '../../../components/loading-transition'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { ErrorMessage } from '../../../components/error-message'
import { loadingSelector } from '../../../store/common/selectors'
import { ServerError } from '../../../store/common/types'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { ApplicationState } from '../../../store/reducers'
import { CustomSearch, withPermissions, WithPermissionsProps, Unauthorized } from '../../../components'
import { IMember } from '../../members/store/types'
import { ImmutableMap } from '../../../utils/types'

import { ICustomerLicenses, IProduct, LicenseActionType, LicenseUpdateAction } from '../store/types'
import { disableLicense, enableLicense } from '../store/actions'
import { AddLicenseModal } from './AddLicenseModal'
import { RemoveLicenseModal } from './RemoveLicenseModal'

export interface LicensesProps {
  products: IProduct[]
  customers: ICustomerLicenses[]
  updating: boolean
  updatingErrors?: ServerError[]
  errors?: ServerError[]
}

export interface ILicensesProps extends LicensesProps, WithLoaderProps, WithPermissionsProps {
  enableLicense: (customerName: string, memberStaticId: string, productId: string) => void
  disableLicense: (customerName: string, memberStaticId: string, productId: string) => void
}

export enum LicenceMode {
  Add,
  Remove
}

export interface LicensesState {
  search: string
  mode: LicenceMode | undefined
  updatingLicense: LicenseUpdateAction
}

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
  }
`
const StyledHeaderCell40 = styled(Table.HeaderCell)`
   {
    width: 40%;
  }
`
const StyledHeaderCell15 = styled(Table.HeaderCell)`
   {
    width: 15%;
  }
`
const StyledCell40 = styled(Table.Cell)`
   {
    width: 40%;
  }
`
const StyledCell15 = styled(Table.Cell)`
   {
    width: 15%;
  }
`

export class Licenses extends Component<ILicensesProps, LicensesState> {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      mode: undefined,
      updatingLicense: {
        productId: '',
        productName: '',
        memberId: '',
        memberName: '',
        enable: false
      }
    }
  }

  handleSearch = (event: React.MouseEvent<HTMLElement>, data: SearchProps): void =>
    this.setState({ search: data.value.toLowerCase() })

  onLicenseToggle = ({ customer, license, enable }): void => {
    const updatingLicense = {
      productId: license.productId,
      productName: license.productName,
      memberId: customer.staticId,
      memberName: customer.x500Name.O,
      enable
    }
    const mode = enable ? LicenceMode.Add : LicenceMode.Remove
    this.setState({ mode, updatingLicense })
  }

  submitLicense = () => {
    const { memberName, memberId, productId } = this.state.updatingLicense
    this.props.enableLicense(memberName, memberId, productId)
    this.setState({ mode: undefined })
  }

  removeLicense = () => {
    const { memberName, memberId, productId } = this.state.updatingLicense
    this.props.disableLicense(memberName, memberId, productId)
    this.setState({ mode: undefined })
  }

  onClose = () => {
    this.setState({ mode: undefined })
  }

  filteredCustomers = () => {
    const { customers } = this.props
    const { search } = this.state
    return customers.filter(c => search === '' || c.x500Name.O.toLowerCase().includes(search))
  }

  render() {
    const { products, isFetching, updating, errors = [], updatingErrors = [], isAuthorized } = this.props
    const allErrors = [...errors.map(e => e.message), ...updatingErrors.map(e => e.message)]

    if (!isAuthorized(administration.canManageCustomerLicenses)) {
      return <Unauthorized />
    }

    return (
      <>
        <Helmet>
          <title>License Management</title>
        </Helmet>
        <StyledGrid>
          <Grid.Column width={8}>
            <Header as="h1">License Management</Header>
          </Grid.Column>
          <Grid.Column width={8} style={{ textAlign: 'right' }}>
            <CustomSearch handleSearch={this.handleSearch} />
          </Grid.Column>
        </StyledGrid>

        {allErrors.length > 0 && <ErrorMessage title="Error" error={allErrors[0]} />}

        {isFetching ? (
          <Segment basic={true} padded={true}>
            <LoadingTransition title="Loading customer list" />
          </Segment>
        ) : (
          <Table basic="very" singleLine={true}>
            <Table.Header>
              <Table.Row>
                <StyledHeaderCell40>Customer Name</StyledHeaderCell40>
                {products.map(p => <StyledHeaderCell15 key={p.productId}>{p.productName}</StyledHeaderCell15>)}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {this.filteredCustomers().map(c => (
                <Table.Row key={c.staticId} data-test-id={`company-static-id.${c.staticId}`}>
                  <StyledCell40>{c.x500Name.O}</StyledCell40>
                  {c.licenses.map(l => (
                    <StyledCell15 key={l.productId} data-test-id={`product-id.${l.productId}`}>
                      <Checkbox
                        checked={l.enabled}
                        disabled={updating}
                        onChange={(_: React.SyntheticEvent<any>, data: CheckboxProps) =>
                          this.onLicenseToggle({ customer: c, license: l, enable: data.checked })
                        }
                      />
                    </StyledCell15>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {this.state.mode === LicenceMode.Add && (
          <AddLicenseModal
            updatingLicense={this.state.updatingLicense}
            onClose={this.onClose}
            submitLicense={this.submitLicense}
          />
        )}
        {this.state.mode === LicenceMode.Remove && (
          <RemoveLicenseModal
            updatingLicense={this.state.updatingLicense}
            onClose={this.onClose}
            removeLicense={this.removeLicense}
          />
        )}
      </>
    )
  }
}

export const memberLicenseSelector = (members: Array<ImmutableMap<IMember>>): ICustomerLicenses[] => {
  const filteredMembers = members.filter(member => {
    return member.get('staticId') && member.toObject().x500Name && member.get('isMember') === true
  })

  return filteredMembers.map(m => {
    const member = m.toJS()
    const { x500Name, staticId, komgoProducts } = member
    const enabledProductIds = _.map(komgoProducts, 'productId')

    const licenses = _.map(allProducts, p => {
      const productId = p.productId

      return {
        productId,
        productName: p.productName,
        enabled: enabledProductIds.indexOf(productId) > -1
      }
    })

    return { staticId, x500Name, enabledProductIds, licenses }
  })
}

const mapStateToProps = (state: ApplicationState): LicensesProps => {
  const members = state
    .get('members')
    .get('byStaticId')
    .toArray()

  const updatingErrors = findErrors(state.get('errors').get('byAction'), [
    LicenseActionType.ENABLE_LICENSE_REQUEST,
    LicenseActionType.DISABLE_LICENSE_REQUEST
  ])

  return {
    products: allProducts,
    customers: memberLicenseSelector(members),
    updatingErrors,
    updating: loadingSelector(
      state.get('loader').get('requests'),
      [LicenseActionType.ENABLE_LICENSE_REQUEST, LicenseActionType.DISABLE_LICENSE_REQUEST],
      false
    )
  }
}

const mapDispatchToProps = { enableLicense, disableLicense }

export default compose(withPermissions, connect(mapStateToProps, mapDispatchToProps))(Licenses)
