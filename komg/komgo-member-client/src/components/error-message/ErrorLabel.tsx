import * as React from 'react'
import { Message } from 'semantic-ui-react'
import styled from 'styled-components'

export interface ErrorLabelProps {
  message: string
}

export const ErrorLabel: React.SFC<ErrorLabelProps> = (props: ErrorLabelProps) => (
  <StyledError>{props.message}</StyledError>
)

export const StyledError = styled.p`
  color: red;
`
export const FormikErrorLabel: React.SFC<ErrorLabelProps> = (props: ErrorLabelProps) => (
  <p className="formik-error">{props.message}</p>
)
