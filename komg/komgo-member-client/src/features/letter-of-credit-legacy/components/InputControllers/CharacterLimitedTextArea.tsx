import * as React from 'react'
import { InputProps, TextAreaController } from './InputControllers'
import { FieldProps } from 'formik'
import { CharactersCounter } from '../../../../components/characters-counter/CharactersCounter'

export interface CharacterLimitedTextAreaProps extends InputProps {
  name: string
  placeholder: string
  maxLength: number
  disabled?: boolean
}

export const CharacterLimitedTextArea: React.SFC<CharacterLimitedTextAreaProps & FieldProps> = ({
  field,
  form,
  maxLength,
  ...props
}) => {
  return (
    <React.Fragment>
      <TextAreaController field={field} form={form} {...props} />
      <CharactersCounter hidden={false} counter={field.value ? field.value.length : 0} maxChars={maxLength} />
    </React.Fragment>
  )
}
