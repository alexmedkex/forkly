import React from 'react'
import styled from 'styled-components'

export interface IProps {
  label: string
  isOptional?: boolean
}

const FieldLabel: React.FC<IProps> = (props: IProps) => {
  return (
    <FieldLabelWrapper>
      {props.label} {props.isOptional ? <LabelInfo> (optional)</LabelInfo> : null}
    </FieldLabelWrapper>
  )
}

const FieldLabelWrapper = styled.span`
  display: inline-block;
  font-weight: bold;
`

const LabelInfo = styled.span`
  font-style: italic;
  font-weight: normal;
`

export default FieldLabel
