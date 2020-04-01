import * as React from 'react'
import Helmet from 'react-helmet'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Grid, Header } from 'semantic-ui-react'
import styled from 'styled-components'
import { administration } from '@komgo/permissions'

import { ApplicationState } from '../../../store/reducers'
import { withPermissions } from '../../../components/with-permissions'
import {
  WithPermissionsProps,
  withLicenseCheck,
  WithLicenseCheckProps,
  Masonry,
  Unauthorized
} from '../../../components'
import { greenBg, yellowBg, pinkBg, purpleBg } from '../../../styles/colors'
import { fetchMembers } from '../../members/store/actions'

import { ProductLicense } from './ProductLicense'
import { ProductLicenseModal } from './ProductLicenseModal'
import { products, IProductExtended } from '../products'
import { User } from '../../../store/common/types'

export interface ProductsLicencesProps extends WithLicenseCheckProps, WithPermissionsProps {
  profile: User
  members: object
  fetchMembers(): void
}

export interface ProductsLicencesState {
  isOpenModal: boolean
}

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
  }
`

const bgColors: string[] = [greenBg, purpleBg, pinkBg, yellowBg]

export class ProductsLicenses extends React.Component<ProductsLicencesProps, ProductsLicencesState> {
  constructor(props: ProductsLicencesProps) {
    super(props)
    this.state = {
      isOpenModal: false
    }
  }

  componentDidMount() {
    this.props.fetchMembers()
  }

  toggleModal = (isOpen: boolean): void => this.setState({ isOpenModal: isOpen })

  sendRequest = (product: IProductExtended): void => {
    const { members, profile } = this.props
    const companyName = members[profile.company] ? members[profile.company].x500Name.O : ''
    const subject = encodeURIComponent(`[More Info Request] Product ${product.productName}`)
    const body = encodeURIComponent(`Hi team,

We would like to have more information on the ${product.productName} product.

Best,

${companyName}`)
    window.open(`mailto:${'admin@komgo.io'}?subject=${subject}&body=${body}`)
    this.toggleModal(true)
  }

  render() {
    const { isLicenseEnabled, profile, isAuthorized } = this.props
    const { isOpenModal } = this.state

    if (!isAuthorized(administration.canViewLicenses)) {
      return <Unauthorized />
    }

    return (
      <>
        <Helmet>
          <title>Product Licenses</title>
        </Helmet>
        <StyledGrid>
          <Grid.Column>
            <Header as="h1">Product Licenses</Header>
          </Grid.Column>
        </StyledGrid>
        <Masonry colWidth={299} gap={16}>
          {products.map((product: IProductExtended, i) => (
            <ProductLicense
              key={product.productId}
              color={bgColors[i < 4 ? i : i % 4]}
              product={product}
              licenseEnabled={isLicenseEnabled(product)}
              sendRequest={this.sendRequest}
            />
          ))}
        </Masonry>
        <ProductLicenseModal open={isOpenModal} closeModal={() => this.toggleModal(false)} email={profile.email} />
      </>
    )
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  profile: state.get('uiState').get('profile'),
  members: state
    .get('members')
    .get('byStaticId')
    .toJS()
})

export default compose<any>(connect(mapStateToProps, { fetchMembers }), withPermissions, withLicenseCheck)(
  ProductsLicenses
)
