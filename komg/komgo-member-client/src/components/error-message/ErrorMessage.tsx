import * as React from 'react'
import { Message } from 'semantic-ui-react'
import { ServerError } from '../../store/common/types'

export interface ErrorMessageProps {
  title: string
  error: string | ServerError
}

export const ErrorMessage: React.FC<ErrorMessageProps> = (props: ErrorMessageProps) => (
  <Message negative={true} data-test-id="errorMessage">
    <Message.Header>{props.title}</Message.Header>
    <p>{typeof props.error === 'object' ? props.error.message : props.error}</p>
  </Message>
)
