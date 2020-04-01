import * as React from 'react'
import styled from 'styled-components'
import DocumentVerificationContainer, {
  FilesContext,
  VerifyDocumentContext
} from '../containers/DocumentVerificationContainer'
import { DropZone } from './DropZone'
import StatusBlock from './StatusBlock'
import Background from './Background'
import Terms from './Terms'
import {
  StyledProcessedFiles,
  StyledUpload,
  StyledButton,
  StyledMainContainer,
  StyledRoot,
  StyledLogo
} from './Verification.styles'

const ZoneWrapper = styled.div`
  width: fit-content;
  height: fit-content;
  padding: 50px 30px 40px 50px;
  border-radius: 4px;
  margin: 60px auto;
  display: flex;
  background-color: white;
`

const StyledMain = styled.div`
  text-align: center;
  max-width: 600px;
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

export class Verification extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {
      dragOverDropZone: false
    }
  }

  setDragOverDropZone = value => {
    this.setState({ dragOverDropZone: value })
  }

  renderWrapper = props => (
    <DropZone verifyDocument={props.verifyDocument} onDragOver={this.setDragOverDropZone} lastIndex={props.lastIndex}>
      {props.children}
    </DropZone>
  )

  render() {
    const main = (
      <StyledMain>
        <p>Drag and drop to verify</p>
        <p> or </p>
        <StyledUpload htmlFor="upload">
          <StyledButton color="red"> BROWSE </StyledButton>
        </StyledUpload>
      </StyledMain>
    )
    const drop = (
      <StyledMain>
        <h2>Drop files to verify</h2>
      </StyledMain>
    )
    const children = <>{this.state.dragOverDropZone ? drop : main}</>

    return (
      <DocumentVerificationContainer {...this.props}>
        <StyledMainContainer>
          <Background />
          <StyledRoot>
            <StyledLogo src="/images/logoMenuYellow.svg" />
            <FilesContext.Consumer>
              {files => (
                <VerifyDocumentContext.Consumer>
                  {verifyDocument => (
                    <ZoneWrapper>
                      {this.renderWrapper({ children, verifyDocument, lastIndex: files.length })}
                      {files.length > 0 && renderProcesses(files)}
                    </ZoneWrapper>
                  )}
                </VerifyDocumentContext.Consumer>
              )}
            </FilesContext.Consumer>
            <Terms />
          </StyledRoot>
        </StyledMainContainer>
      </DocumentVerificationContainer>
    )
  }
}

export default Verification
