import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { compose } from 'redux'
import styled from 'styled-components'
import { ErrorMessage } from '../../../components/error-message'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { loadingSelector } from '../../../store/common/selectors'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { ApplicationState } from '../../../store/reducers'
import { verifyDocument } from '../store/actions'
import { DocumentVerificationActionType, IVerifiedFile } from '../store/types'

const StyledError = styled.div`
  width: 50%;
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  top: 114px;
`

export const VerifyDocumentContext = React.createContext(undefined)
export const FilesContext = React.createContext([])

export interface VerificationProps extends WithLoaderProps, RouteComponentProps<any> {
  verifyDocument: (stateFile: IVerifiedFile) => void
  updatingErrors: string[]
  files: IVerifiedFile[]
}

window.addEventListener(
  'dragover',
  e => {
    e.preventDefault()
  },
  false
)
window.addEventListener(
  'drop',
  e => {
    e.preventDefault()
  },
  false
)

export class Verification extends React.Component<VerificationProps> {
  constructor(props) {
    super(props)
  }

  render() {
    const { errors, updatingErrors, files, verifyDocument } = this.props
    const allErrors = [...errors.map(e => e.message), ...updatingErrors]
    return (
      <>
        {allErrors.length > 0 && (
          <StyledError>
            <ErrorMessage title="" error={allErrors[0]} />
          </StyledError>
        )}
        <FilesContext.Provider value={files}>
          <VerifyDocumentContext.Provider value={verifyDocument}>{this.props.children}</VerifyDocumentContext.Provider>
        </FilesContext.Provider>
      </>
    )
  }
}

export const getFiles = state => {
  let result = []
  const files = state.get('documentVerification').get('files')

  if (files.size > 0) {
    result = files.toJS()
  }
  return result
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    files: getFiles(state),
    updatingErrors: findErrors(state.get('errors').get('byAction'), [
      DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST
    ]),
    isFetching: loadingSelector(
      state.get('loader').get('requests'),
      [DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST],
      false
    )
  }
}

const mapDispatchToProps = { verifyDocument }

export default compose<any>(
  withLoaders({ errors: [], actions: [] }),
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Verification)
