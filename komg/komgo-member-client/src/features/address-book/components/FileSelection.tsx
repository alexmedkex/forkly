import { ICompanyRequest } from '@komgo/types'
import { Form } from 'semantic-ui-react'
import * as React from 'react'
import styled from 'styled-components'
import { FileUpload } from '../../../components/form'
import { paleGray, red } from '../../../styles/colors'

export interface IProps {
  values: ICompanyRequest
  setFieldValue: (name: string, value: any) => void
}

interface IState {
  file: File | null
  error: boolean
}

const StyledSmallHeader = styled.h4`
  background-color: ${paleGray};
  margin-bottom: 1.5em;
  margin-top: 1.5em;
  padding: 0.5em;
`
const StyledLabel = styled.label`
  &&&&& {
    color: ${red};
  }
`

export class FileSelection extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      file: null,
      error: false
    }
  }

  parseCompanyFile = (result: string): ICompanyRequest => {
    try {
      return JSON.parse(result)
    } catch {
      this.setState({ error: true })
    }
  }

  onFileUpload = (fileName: string, file: File) => {
    this.setState({ file, error: false })

    if (!file) {
      return
    }

    const { values, setFieldValue } = this.props
    const reader = new FileReader()

    reader.readAsText(file)
    reader.onload = () => {
      const result = this.parseCompanyFile(reader.result.toString())

      for (const key in result) {
        if (values[key] !== undefined) {
          setFieldValue(key, result[key])
        }
      }
    }
  }

  render() {
    return (
      <>
        <StyledSmallHeader>FILE SELECTION (OPTIONAL)</StyledSmallHeader>
        <Form.Field>
          <FileUpload
            label="Select a JSON file"
            name="companyInfoFile"
            accept=".json"
            onChange={this.onFileUpload}
            file={this.state.file}
            uploadFileText="Select a file"
          />
          {this.state.error && <StyledLabel>Invalid JSON</StyledLabel>}
        </Form.Field>
      </>
    )
  }
}
