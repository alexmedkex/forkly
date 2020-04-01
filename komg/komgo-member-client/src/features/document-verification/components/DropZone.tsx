import * as React from 'react'
import styled from 'styled-components'
import { violetBlue, darkBlueGrey } from '../../../styles/colors'
import { IVerifiedFile } from '../store/types'
import { calculateHash } from '../utils/calculateHash'

interface Props {
  children: any
  verifyDocument: (stateFile: IVerifiedFile) => void
  onDragOver: (state: boolean) => void
  lastIndex: number
  outlook?: boolean
}

const StyledDropZoneDesktop = styled.div`
  background-color: 'white';
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;

  box-sizing: border-box;
  height: 250px;
  border: 1px dashed ${violetBlue};
  border-radius: 4px;

  color: ${darkBlueGrey};
  font-family: 'Lota Grotesque', Roboto, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 300;
  line-height: 28px;
  text-align: center;
  margin-right: 20px;
  width: 394px;

  * {
    pointer-events: none;
    width: 100%;
    margin-top: 20px;
  }
`

const StyledDropZoneOutlook = styled.div`
  min-height: inherit;
  display: flex;
  flex-direction: column;
`

export class DropZone extends React.PureComponent<Props> {
  onChangeFiles = async (verifyDocument, lastIndex) => {
    const browseInput: any = document.getElementById('upload')
    const files = browseInput ? browseInput.files : []
    const filesWithHash = await calculateHash(Array.from(files), lastIndex)
    for (const file of filesWithHash) {
      verifyDocument(file)
    }

    // fix reload the same document issue
    if (browseInput) {
      browseInput.value = ''
    }
  }

  dropHandler = async (ev, verifyDocument, lastIndex) => {
    ev.preventDefault()
    this.props.onDragOver(false)
    if (ev.dataTransfer.items && ev.dataTransfer.items.length > 0) {
      // Use DataTransferItemList interface to access the file(s)
      const items = ev.dataTransfer.items

      const files = []
      Array.from(items).forEach((item: DataTransferItem) => {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          files.push(file)
        }
      })
      const filesWithHash = await calculateHash(files, lastIndex)
      for (const file of filesWithHash) {
        verifyDocument(file)
      }
    }
  }

  dragOverHandler = event => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  dragEnterHandler = event => {
    event.preventDefault()
    this.props.onDragOver(true)
  }

  dragLeaveHandler = event => {
    event.preventDefault()
    this.props.onDragOver(false)
  }

  render() {
    const StyledDropZone = this.props.outlook ? StyledDropZoneOutlook : StyledDropZoneDesktop
    const { verifyDocument, lastIndex } = this.props
    return (
      <StyledDropZone
        id="drop_zone"
        onDrop={event => this.dropHandler(event, verifyDocument, lastIndex)}
        onDragEnter={this.dragEnterHandler}
        onDragLeave={this.dragLeaveHandler}
        onDragOver={this.dragOverHandler}
      >
        {this.props.children}
        <input
          hidden={true}
          id="upload"
          type="file"
          onChange={() => this.onChangeFiles(verifyDocument, lastIndex)}
          multiple={true}
        />
      </StyledDropZone>
    )
  }
}
