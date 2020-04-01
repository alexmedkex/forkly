import * as React from 'react'
import styled from 'styled-components'
import { rose } from '../../styles/colors'

interface FormErrorProps {
  show: boolean
  fieldName: string
  style?: React.CSSProperties
}

const ErrorText = styled.div`
  position: absolute;
  font-size: small;
  color: ${rose};
  min-height: 21px;
  bottom: -20px;
`

const FieldError: React.FC<FormErrorProps> = ({ show, fieldName, children, style }) => {
  if (show) {
    return (
      <ErrorText data-test-id={`error-${fieldName}`} style={style}>
        {children}
      </ErrorText>
    )
  }
  return null
}

export default FieldError
