import * as React from 'react'
import { Icon, Divider } from 'semantic-ui-react'
import styled from 'styled-components'
import DocumentVerificationContainer, {
  FilesContext,
  VerifyDocumentContext
} from '../containers/DocumentVerificationContainer'
import { DropZone } from './DropZone'
import StatusBlock from './OutlookStatusBlock'
import { StyledProcessedFiles } from './Verification.styles'

const ZoneWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  min-height: 100vh;
  background-image: url('/images/BG PAtternvector.svg');
  background-image: ${(props: { background?: boolean }) => {
    return props.background ? "url('/images/BG PAtternvector.svg')" : 'none'
  }};
`

const StyledMain = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  margin: 20px;
`

const StyledDiv = styled.div`
  font-size: 16px;
  font-weight: 600;
`
const StyledIcon = styled(Icon)`
  &&& {
    margin-bottom: 5px;
  }
`

const StyledLink = styled.a`
  font-family: sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
`

const StyledDivider = styled(Divider)`
  margin: 0;
`

export const renderProcesses = processedFiles => {
  const fileBlocks = []
  for (let key = processedFiles.length - 1; key >= 0; key--) {
    const fileData = processedFiles[key]

    if (fileData) {
      fileBlocks.push(<StatusBlock key={key} fileData={fileData} />)
    }
  }
  return <StyledProcessedFiles> {fileBlocks}</StyledProcessedFiles>
}

interface State {
  dragOverDropZone: boolean
}

export class OutlookVerification extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {
      dragOverDropZone: false
    }
  }

  setDragOverDropZone = value => {
    this.setState({ dragOverDropZone: value })
  }

  render() {
    const Header = () => (
      <StyledMain>
        <StyledIcon name="download" />
        <StyledDiv>{this.state.dragOverDropZone ? 'Drop' : 'Drag and drop'} a document to verify</StyledDiv>
      </StyledMain>
    )

    const Footer = () => (
      <StyledMain>
        <StyledLink className="more-information" target="_blank" href="https://komgo.io/info/verification">
          More information
        </StyledLink>
      </StyledMain>
    )

    return (
      <DocumentVerificationContainer>
        <FilesContext.Consumer>
          {files => (
            <VerifyDocumentContext.Consumer>
              {verifyDocument => (
                <ZoneWrapper background={files.length === 0}>
                  <DropZone
                    verifyDocument={verifyDocument}
                    onDragOver={this.setDragOverDropZone}
                    lastIndex={files.length}
                    outlook={true}
                  >
                    <Header />
                    {renderProcesses(files)}
                    <StyledDivider />
                    <Footer />
                  </DropZone>
                </ZoneWrapper>
              )}
            </VerifyDocumentContext.Consumer>
          )}
        </FilesContext.Consumer>
      </DocumentVerificationContainer>
    )
  }
}

export default OutlookVerification
