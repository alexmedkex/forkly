import { StatusText } from './StatusText'
import { UpperCaseText } from './UpperCaseText'
import { toKebabCase } from '../../../../utils/casings'
import React from 'react'
import { Dimensions } from '../../resources/dimensions'

interface IFormSectionLabelProps {
  text: string
  textAlign?: string
  width?: string
}

export const FormSectionLabel = (p: IFormSectionLabelProps) => (
  <StatusText
    width={p.width}
    textAlign={p.textAlign}
    data-test-id={`view-request-info-rd-data-${toKebabCase(p.text)}`}
    {...p}
  >
    <UpperCaseText>{p.text}</UpperCaseText>
  </StatusText>
)
