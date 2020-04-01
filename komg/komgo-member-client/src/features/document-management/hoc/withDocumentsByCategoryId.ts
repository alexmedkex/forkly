import withDocumentsByPickedProperty from './withDocumentsByPicker'
import { pickDocumentCategoryId } from '../utils/pickers'

export const withDocumentsByCategoryId = Wrapped =>
  withDocumentsByPickedProperty(pickDocumentCategoryId, 'documentsByCategoryId')(Wrapped)

export default withDocumentsByCategoryId
