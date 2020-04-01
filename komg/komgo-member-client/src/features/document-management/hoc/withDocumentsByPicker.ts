import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'
import { Picker } from '../utils/pickers'

import { Document } from '../store'

const mapStateToProps = (picker: Picker<Document, string>, name: string = 'normalized') => (
  state: ApplicationState
) => {
  const documentsState = state.get('documents')
  const documentsById = documentsState.get('documentsById')
  const set = documentsState.get('documentsSet')
  const documentsByPickedProperty = set.groupBy(picker)
  return {
    documentsById,
    allDocs: documentsState.get('allDocuments'),
    [name]: documentsByPickedProperty
  }
}

const withDocumentsByPickedProperty = (picker: Picker<Document, string>, name: string) => (
  Wrapped: React.ComponentType
) => connect(mapStateToProps(picker, name), null)(Wrapped)

export default withDocumentsByPickedProperty
