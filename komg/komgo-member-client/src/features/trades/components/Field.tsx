import styled from 'styled-components'

interface FieldProps {
  modal?: boolean
  customWidth?: string
  verticalAlignLabel?: 'top' | 'bottom' | 'middle'
  marginLeftLabel?: number
  marginBottom?: number
  bold?: boolean
  selectWidth?: string
}

export const Field = styled.li`
  margin: 0;
  line-height: 2;
  white-space: nowrap;
  margin-bottom: 5px;
  max-width: 720px;
  flex-grow: 1;
`

export const Value = styled.p`
  margin: 0;
  display: inline-block;
  line-height: 2;
  height: 32px;
  white-space: nowrap;
`

// .field.error has a margin-bottom: 0 because in case of error a class "field" is added to the input, adding 16px margin-bottom
export const FieldWithLabel = styled(Field)`
  &&&&& {
    .field {
      .selection.dropdown {
        width: ${(props: FieldProps) => `${props.selectWidth || '50%'} !important;`};
      }
      ${(props: FieldProps) => props.marginBottom && `margin-bottom: ${props.marginBottom}px`};
    }
    .field.error {
      margin-bottom: 0;
    }
    label.inputLabel {
      width: ${(props: FieldProps) => (props.modal ? '140px' : props.customWidth ? props.customWidth : '200px')};
      margin-right: 0;
      display: inline-block;
      text-align: right;
      padding-right: 20px;
      ${(props: FieldProps) => props.verticalAlignLabel && `vertical-align: ${props.verticalAlignLabel}`};
      ${(props: FieldProps) => props.marginLeftLabel && `margin-left: ${props.marginLeftLabel}px`};
      ${(props: FieldProps) => props.bold && 'font-weight: bold'};
    }
  }
`
