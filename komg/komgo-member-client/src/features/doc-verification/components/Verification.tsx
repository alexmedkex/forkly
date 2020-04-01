import * as React from 'react'
import { asciiToHex } from 'web3-utils'
import { merkleRoot } from 'merkle-tree-solidity'
import { sha3, toBuffer } from 'ethereumjs-util'
import styled from 'styled-components'
import { grey, white } from '../../../styles/colors'
import { Button, Icon, Image, Modal, Segment } from 'semantic-ui-react'
import { compose } from 'redux'
import { WithLoaderProps, withLoaders } from '../../../components/with-loaders'
import { connect } from 'react-redux'
import { ApplicationState } from '../../../store/reducers'
import { findErrors } from '../../../store/common/selectors/errorSelector'
import { loadingSelector } from '../../../store/common/selectors'
import { DocumentVerificationActionType } from '../store/types'
import { getSession, verifyDocument } from '../store/actions'
import { ErrorMessage } from '../../../components/error-message'
import { LoadingTransition } from '../../../components/loading-transition'
import { RouteComponentProps, withRouter } from 'react-router'
import { displayDate } from '../../../utils/date'

const StyledImage = styled(Image)`
  padding-top: 35px;
  margin-left: auto;
  margin-right: auto;
`

const StyledHeader = styled.h1`
  width: 50%;
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  text-align: center;
`

const StyledRoot = styled.div`
  position: absolute;
  height: auto;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
  margin-top: 90px;
  margin-bottom: 200px;
  margin-right: 50px;
  margin-left: 50px;
  text-align: center;
`
const StyledMain = styled.div`
  text-align: center;
  max-width: 600px;
`
const StyledFooter = styled.div`
  margin: auto;
  max-width: 1000px;
`
const StyledUpload = styled.label`
  &&& {
    pointer-events: all;
    cursor: pointer;
  }
`
const StyledIcon = styled(Icon)`
  &&& {
    @media (max-height: 700px) {
      display: none;
    }
  }
`

const DropZone = styled.div`
  background-color: ${(props: { dragOver?: boolean }) => (props.dragOver ? grey : white)};
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${grey};
  * {
    pointer-events: none;
  }
`

const Zone = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${grey};
`

const StyledError = styled.div`
  width: 50%;
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  top: 114px;
`

const StyledButton = styled(Button)`
  &&& {
    margin: 30px;
  }
`

export interface VerificationProps extends WithLoaderProps, RouteComponentProps<any> {
  getSession: (sessionId: string) => void
  verifyDocument: (sessionId: string, hashMerkle: string) => void
  updatingErrors: string[]
  registeredAt: number
  companyName: string
  metadataHash: string
}

interface State {
  dragOver: boolean
  sessionId: string
  fileName: string
  modalOpened: boolean
  loadingFile: boolean
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

export class Verification extends React.Component<VerificationProps, State> {
  constructor(props) {
    super(props)
    const queryParams = new URLSearchParams(this.props.location.search)
    this.state = {
      dragOver: false,
      sessionId: queryParams.get('sessionId') || '',
      fileName: '',
      modalOpened: false,
      loadingFile: false
    }
  }

  componentDidMount(): void {
    if (this.state.sessionId) {
      this.props.getSession(this.state.sessionId)
    }
  }

  onChangeFile = () => {
    const fileButton: any = document.getElementById('upload')
    const file = fileButton ? fileButton.files[0] : null
    this.calculateHash(file)
  }

  dropHandler = ev => {
    ev.preventDefault()
    this.setState({ dragOver: false })
    if (ev.dataTransfer.items && ev.dataTransfer.items.length > 0) {
      // Use DataTransferItemList interface to access the file(s)
      const item = ev.dataTransfer.items[0]
      if (item.kind === 'file') {
        const file = item.getAsFile()
        this.calculateHash(file)
      }
    }
  }

  dragOverHandler = ev => {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'copy'
  }

  dragEnterHandler = ev => {
    ev.preventDefault()
    this.setState({ dragOver: true })
  }

  dragLeaveHandler = ev => {
    ev.preventDefault()
    this.setState({ dragOver: false })
  }

  onMoreInformationClick = () => {
    this.setState({ modalOpened: true })
  }

  onClose = () => {
    this.setState({ modalOpened: false })
  }

  moreInfoModal = () => {
    return (
      <Modal open={true} onClose={this.onClose}>
        <Modal.Header>More Information</Modal.Header>
        <Modal.Content>
          <p>
            Use this page to verify that the document which has been sent to you is valid. Do drag and drop the document
            into the space provided, or select a document from your computer. This will only work with document which
            contains the link you used to reach this page.
          </p>
          <p>The document will not be upload to komgo. This page only serves for verification purposes</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.onClose}>Ok</Button>
        </Modal.Actions>
      </Modal>
    )
  }
  renderWrapper = props =>
    this.props.companyName ? (
      <Zone id="drop_zone">{props.children}</Zone>
    ) : (
      <DropZone
        dragOver={this.state.dragOver}
        id="drop_zone"
        onDrop={this.dropHandler}
        onDragEnter={this.dragEnterHandler}
        onDragLeave={this.dragLeaveHandler}
        onDragOver={this.dragOverHandler}
      >
        {props.children}
      </DropZone>
    )

  render() {
    const { isFetching, errors, updatingErrors, metadataHash } = this.props
    const { modalOpened, loadingFile } = this.state
    const allErrors = [...errors.map(e => e.message), ...updatingErrors]
    const main = (
      <StyledMain>
        <StyledIcon name="file alternate outline" size="huge" />
        <h2>
          Drag the document which contains the link used to reach this page here to verify it or{' '}
          <StyledUpload htmlFor="upload">
            <a>select a file</a>
          </StyledUpload>{' '}
          from your device
        </h2>
      </StyledMain>
    )
    const drop = (
      <StyledMain>
        <Icon name="file alternate outline" size="huge" />
        <h2>Drop files to verify</h2>
      </StyledMain>
    )
    const successfullyVerified = (
      <StyledMain>
        <Icon name="check circle outline" size="huge" color="green" />
        <h2>
          <strong>{this.state.fileName}</strong> has been registered on the komgo network on{' '}
          <strong>{displayDate(this.props.registeredAt)}</strong> by <strong>{this.props.companyName}</strong>
        </h2>
      </StyledMain>
    )
    const loading = (
      <Segment basic={true} padded={true}>
        <LoadingTransition title="Verifying the document" />
      </Segment>
    )
    const readingFile = (
      <Segment basic={true} padded={true}>
        <h1>Loading...</h1>
      </Segment>
    )
    const children = (
      <>
        {loadingFile
          ? readingFile
          : isFetching
            ? loading
            : this.props.companyName
              ? successfullyVerified
              : this.state.dragOver
                ? drop
                : main}
      </>
    )
    return (
      <>
        <StyledImage src="/images/logoMenu.svg" />
        <StyledRoot>
          <StyledHeader>Document verification</StyledHeader>
          {allErrors.length > 0 && (
            <StyledError>
              <ErrorMessage title="" error={allErrors[0]} />
            </StyledError>
          )}
          {metadataHash.length > 0 && this.renderWrapper({ children })}
          <input hidden={true} id="upload" type="file" onChange={this.onChangeFile} />
          {metadataHash.length > 0 && (
            <div>
              <StyledButton onClick={this.onMoreInformationClick}>More information</StyledButton>
              <StyledFooter className="disabled">
                As per the komgo Terms & Conditions, komgo's role is to maintain and operate the platform, and this role
                is purely administrative in nature. While komgo have made its best efforts to ensure the authenticity of
                the platform users during the on-boarding process, in no event komgo, its related partnerships or
                corporations, managers or employees thereof be liable to you or anyone else, makes representation of
                warranty of any kind (whether express or implied by law) (including, but not limited to warranties of
                performance, merchantability and fitness for a particular purpose) in respect of the attached document
                or for any decision made or action taken in reliance of the information in the attached document.
              </StyledFooter>
            </div>
          )}
        </StyledRoot>
        {modalOpened && this.moreInfoModal()}
      </>
    )
  }

  public calculateHash(file) {
    this.setState({ fileName: file.name, loadingFile: true }, () => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const hashMetadata: Buffer = toBuffer(this.props.metadataHash)
        // take the second part of the string, everything after data:image/png;base64,
        const hashDoc: Buffer = sha3(reader.result.toString().split(',')[1])
        const hashMerkle: string = asciiToHex(merkleRoot([hashDoc, hashMetadata]).toString('ascii'))
        this.props.verifyDocument(this.state.sessionId, hashMerkle)
        this.setState({ loadingFile: false })
      }
    })
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    metadataHash: state.get('docVerification').get('metadataHash'),
    registeredAt: state.get('docVerification').get('registeredAt'),
    companyName: state.get('docVerification').get('companyName'),
    updatingErrors: findErrors(state.get('errors').get('byAction'), [
      DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST,
      DocumentVerificationActionType.GET_SESSION_REQUEST
    ]),
    isFetching: loadingSelector(
      state.get('loader').get('requests'),
      [DocumentVerificationActionType.VERIFY_DOCUMENT_REQUEST, DocumentVerificationActionType.GET_SESSION_REQUEST],
      false
    )
  }
}

const mapDispatchToProps = { getSession, verifyDocument }

export default compose<any>(
  withLoaders({
    actions: [DocumentVerificationActionType.GET_SESSION_REQUEST]
  }),
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(Verification)
