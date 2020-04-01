import React from 'react'
import styled from 'styled-components'
import { Field } from '../../../trades/components/Field'
import { rdDiscountingSchema } from '../../utils/constants'
import { findFieldFromSchema } from '../../../../store/common/selectors/displaySelectors'

export interface IRDInfoFieldProps {
  fieldName: string
  value: React.ReactNode
}

export const RDInfoField: React.FC<IRDInfoFieldProps> = props => {
  const { fieldName, value } = props

  return (
    <StyledField data-test-id={`rdInfo-field-component-${fieldName}`}>
      <StyledLabel>{findFieldFromSchema('title', fieldName, rdDiscountingSchema)}</StyledLabel>
      <StyledValue data-test-id={`rdInfo-field-value-${fieldName}`}>{value}</StyledValue>
    </StyledField>
  )
}

const StyledField = styled(Field)`
  display: block;
  margin-bottom: 10px;
`

export const StyledLabel = styled.p`
  font-weight: bold;
  margin-bottom: 0.4rem;
`

export const StyledValue = styled.p`
  white-space: normal;
  padding-bottom: 0.4rem;
`
