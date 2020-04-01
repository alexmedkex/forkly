import { connect } from 'react-redux'
import { fetchProductsAsync } from '../store/products/actions'
import { ApplicationState } from '../../../store/reducers'

const mapStateToProps = (state: ApplicationState) => {
  const productsState = state.get('products')
  return {
    products: productsState.get('products')
  }
}

const withProducts = (Wrapped: React.ComponentType) => connect(mapStateToProps, { fetchProductsAsync })(Wrapped)

export default withProducts
