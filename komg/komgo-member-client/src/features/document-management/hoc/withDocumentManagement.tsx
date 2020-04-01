import { compose } from 'redux'
import * as React from 'react'
import { withProducts, withCategories, withDocumentTypes, withDocuments, withTemplates, withRequests } from './index'
import { withCounterparties } from '../../counterparties/hoc/index'
import { WithDocumentsOptions } from './withDocuments'

type DocumentEntityType = 'templates' | 'documents' | 'documentTypes'
interface OwnProps {
  entity: DocumentEntityType
}
const withDocumentRoute = <P extends OwnProps>(Wrapped: React.ComponentType<any>) =>
  class WithDocumentRoute extends React.Component<OwnProps, {}> {
    static displayName = `withDocumentManagement(${Wrapped.name})`

    constructor(props: OwnProps) {
      super(props)
    }
    render() {
      return <Wrapped entity={this.props.entity} {...this.props} />
    }
  }

const withDocumentManagement = (Wrapped: React.ComponentType, options?: WithDocumentsOptions) =>
  compose(
    withDocumentRoute,
    withRequests,
    withProducts,
    withCategories,
    withDocumentTypes,
    wrapped => withDocuments(wrapped, options),
    withTemplates,
    withCounterparties
  )(Wrapped)

export default withDocumentManagement
