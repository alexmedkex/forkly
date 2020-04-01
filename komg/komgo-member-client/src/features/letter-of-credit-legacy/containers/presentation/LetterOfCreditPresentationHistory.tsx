import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import { Header } from 'semantic-ui-react'

import { withDocuments } from '../../../document-management/hoc'
import { ApplicationState } from '../../../../store/reducers'
import withLCDocuments from '../../hoc/withLCDocuments'
import { ILetterOfCredit } from '../../types/ILetterOfCredit'
import { LetterOfCreditActionType } from '../../store/types'
import { getLetterOfCredit } from '../../store/actions'
import { LoadingTransition } from '../../../../components'
import { ILCPresentation } from '../../types/ILCPresentation'
import { LCPresentationActionType } from '../../store/presentation/types'
import { withLoaders } from '../../../../components/with-loaders'
import { ErrorMessage } from '../../../../components/error-message'
import { ServerError } from '../../../../store/common/types'
import { findErrors } from '../../../../store/common/selectors/errorSelector'
import { clearError } from '../../../../store/common/actions'
import HistoryPresentation from '../../components/presentation/HistoryPresentation'
import { Document } from '../../../document-management/store/types'
import { IMember } from '../../../members/store/types'
import { getLcPresentationWithDocuments } from '../../utils/selectors'

interface IProps extends RouteComponentProps<{ id: string; presentationId: string }> {
  isLoading: boolean
  letterOfCredit: ILetterOfCredit
  presentation: ILCPresentation
  isFetching: boolean
  documents: Document[]
  isDeleting: boolean
  errors: ServerError[]
  fetchingDocumentError: ServerError[]
  members: IMember[]
  getLetterOfCredit(params?: object): void
}

export class LetterOfCreditPresentationHistory extends React.Component<IProps> {
  componentDidMount() {
    const { match, presentation, documents } = this.props
    const { id } = match.params
    if (!presentation || (presentation.documents && presentation.documents.length > 0 && !documents)) {
      this.props.getLetterOfCredit({ id, withDocuments: true })
    }
  }

  viewClickHandler = (document: Document) => {
    const { match, history } = this.props
    history.push(`/financial-instruments/letters-of-credit/${match.params.id}/documents/${document.id}`)
  }

  render() {
    const { isFetching, documents, presentation, errors, fetchingDocumentError, members } = this.props
    if (errors && errors.length > 0) {
      return <ErrorMessage title="LC presentation fetching error" error={errors[0].message} />
    }
    if (isFetching) {
      return <LoadingTransition title="Loading LC Presentation History" />
    }
    return (
      <React.Fragment>
        <Helmet>
          <title>Documents Presentation History</title>
        </Helmet>
        <Header as="h1" content="Presentation History" />
        {fetchingDocumentError &&
          fetchingDocumentError.length > 0 && (
            <ErrorMessage title="LC presentation documents fetching error" error={fetchingDocumentError[0].message} />
          )}
        {presentation && (
          <HistoryPresentation
            documents={documents}
            presentation={presentation}
            members={members}
            viewClickHandler={this.viewClickHandler}
          />
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ApplicationState, ownProps: IProps) => {
  const { id, presentationId } = ownProps.match.params

  const { letterOfCredit, presentation, documents } = getLcPresentationWithDocuments(state, id, presentationId)

  const members = state
    .get('members')
    .get('byId')
    .toList()
    .toJS()

  return {
    letterOfCredit,
    presentation,
    documents,
    members,
    fetchingDocumentError: findErrors(state.get('errors').get('byAction'), [
      LCPresentationActionType.FETCH_PRESENTATION_DOCUMENTS_REQUEST
    ])
  }
}

export default compose(
  withLCDocuments,
  withDocuments,
  withRouter,
  withLoaders({
    actions: [LetterOfCreditActionType.LETTER_OF_CREDIT_REQUEST]
  }),
  connect(mapStateToProps, {
    getLetterOfCredit,
    clearError
  })
)(LetterOfCreditPresentationHistory)
