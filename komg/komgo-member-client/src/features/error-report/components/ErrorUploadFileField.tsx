import { FormikProps } from 'formik'
import * as React from 'react'
import { Form, Input } from 'semantic-ui-react'
import styled from 'styled-components'

import { violetBlue, blueGrey, grey } from '../../../styles/colors'

interface Props {
  formik: FormikProps<{
    uploads: FileList
  }>
}

interface UploadedFileProps {
  direction: string
  justify: string
  align: string
}

const UploadedFileText: React.SFC<UploadedFileProps> = ({ children, ...props }) => (
  <StyledUploadedFileText {...props}>{children}</StyledUploadedFileText>
)

const FieldDescription = styled.span`
  font-size: 12px;
`

const StyledUploadedFileText = styled.div`
  &&& {
    position: relative;
    display: flex;
    flex-direction: ${(props: any) => props.direction};
    justify-content: ${(props: any) => props.justify};
    align-items: ${(props: any) => props.align};
    color: ${blueGrey};
    border: 1px solid ${grey};
    border-radius: 3px;
    width: 100%;
    height: 95px;
    padding: 6px;
    padding-left: 12px;
  }
`

export const AddFileText = styled.span`
  color: ${violetBlue};
`

export const HiddenInput = styled(Input)`
  &&& {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    &&&& input {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
`

export const ErrorUploadFileField: React.SFC<Props> = (props: Props) => (
  <Form.Field>
    <label>Attachments</label>
    <UploadedFileText
      direction={props.formik.values.uploads.length > 0 ? 'column' : 'row'}
      justify={props.formik.values.uploads.length > 0 ? 'flex-start' : 'center'}
      align={props.formik.values.uploads.length > 0 ? 'flex-start' : 'center'}
    >
      {props.formik.values.uploads.length > 0 ? (
        Object.values(props.formik.values.uploads).map(value => <span key={value.name}>{value.name}</span>)
      ) : (
        <React.Fragment>
          <AddFileText>Add file</AddFileText>&nbsp;or drop files here
        </React.Fragment>
      )}
      <HiddenInput
        id="uploads"
        name="uploads"
        accept=".jpg, .png, .jpeg"
        multiple={true}
        type="file"
        onChange={e => props.formik.setFieldValue('uploads', e.currentTarget.files)}
        onBlur={props.formik.handleBlur}
      />
    </UploadedFileText>
    <FieldDescription>
      Please capture the whole browser page showing the problem, including URL and the date and time snapshot.
    </FieldDescription>
  </Form.Field>
)
