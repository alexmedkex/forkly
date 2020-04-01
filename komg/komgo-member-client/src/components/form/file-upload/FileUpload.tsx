import * as React from 'react'
import styled from 'styled-components'
import { Icon } from 'semantic-ui-react'

import { CustomFileIcon } from '../../../components/custom-icon'
import { violetBlue, dark, grey, paleBlue } from '../../../styles/colors'

interface Props {
  file: File | null
  name: string
  accept: string
  label: string
  description?: string
  uploadFileText: string
  onChange: (fileName: string, file: File | null) => void
  maxFileNameWidth?: string
}

const FileUpload: React.SFC<Props> = (props: Props) => {
  const { file, name, onChange, accept, label, uploadFileText, description, maxFileNameWidth } = props
  return (
    <>
      <LabelWithDescription>
        <b>{label}</b>
        <br />
        {description && <DescriptionText>{description}</DescriptionText>}
      </LabelWithDescription>

      {file === null ? (
        <>
          <StyledInput
            className="file-uploader"
            id="file-upload"
            type="file"
            name={name}
            onChange={(event: any) => {
              onChange(name, event.target.files[0])
            }}
            accept={accept}
          />
          <UploadFileText htmlFor="file-upload" className="file-uploader">
            {uploadFileText}
          </UploadFileText>
        </>
      ) : (
        <UploadedFileText>
          <StyledFileIcon />
          <FileName maxFileNameWidth={maxFileNameWidth}>{file.name}</FileName>
          <StyledXButton
            name="close"
            link={true}
            onClick={() => {
              onChange(name, null)
            }}
          />
        </UploadedFileText>
      )}
    </>
  )
}

const DescriptionText = styled.span`
  font-size: small;
`

const LabelWithDescription = styled.p`
  margin-bottom: 0;
`

export const UploadFileText = styled.label`
  &&&&& {
    color: ${violetBlue};
    z-index: 100;
    cursor: pointer;
    padding-bottom: 20px;
    display: block;
    font-weight: normal;
  }
`

export const UploadedFileText = styled.p`
  &&&&& {
    color: ${dark};
    border: 1px solid ${grey};
    border-radius: 3px;
    background-image: linear-gradient(to bottom, white, white), linear-gradient(to bottom, white, ${paleBlue});
    height: 32px;
    padding: 6px;
    padding-left: 12px;
  }
`
const StyledInput = styled.input`
  &&&&& {
    z-index: -100;
    cursor: pointer;
    position: absolute;
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
    overflow: hidden;
    width: 50%;
    padding: 10px;
  }
`

const FileName = styled.span`
  max-width: ${({ maxFileNameWidth }: { maxFileNameWidth?: string }) =>
    maxFileNameWidth ? maxFileNameWidth : '370px'};
  padding-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
`

const StyledFileIcon = styled(CustomFileIcon)`
  padding-right: 10px;
  float: left;
`

export const StyledXButton = styled(Icon)`
  float: right;
`

export default FileUpload
