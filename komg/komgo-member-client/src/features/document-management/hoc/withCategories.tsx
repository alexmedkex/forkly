import { connect } from 'react-redux'
import { fetchCategoriesAsync, fetchCategoriesByCategoryId } from '../store/categories/actions'
import { ApplicationState } from '../../../store/reducers'

const mapStateToProps = (state: ApplicationState) => {
  const categoriesState = state.get('categories')
  return {
    categories: categoriesState.get('categories')
  }
}

const withCategories = (Wrapped: React.ComponentType) =>
  connect(mapStateToProps, { fetchCategoriesAsync, fetchCategoriesByCategoryId })(Wrapped)

export default withCategories
