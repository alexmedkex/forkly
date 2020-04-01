import * as React from 'react'
import { FieldProps } from 'formik'
import { Form, Input, TextArea } from 'semantic-ui-react'

interface InputConfiguration {
  name: string
  type: string
  disabled: boolean
  error?: boolean
  value?: string
  info?: string
  inline?: boolean
  label?: string
}

const InputController: React.FC<InputConfiguration & FieldProps> = (props: InputConfiguration & FieldProps) => {
  const { type, disabled, field, value, error, info, inline, label, ...properties } = props
  const labelStyle = info ? { marginBottom: 0 } : undefined
  return (
    <Form.Field inline={inline} error={error} disabled={disabled}>
      {label ? (
        <label htmlFor={field.name} style={labelStyle}>
          {label}
        </label>
      ) : (
        undefined
      )}
      {info ? <small className="grey">{info}</small> : undefined}
      {type === 'textarea' ? (
        <TextArea
          id={field.name}
          {...field}
          {...properties}
          value={value === undefined ? field.value : value}
          disabled={disabled}
        />
      ) : (
        <Input
          id={field.name}
          type={type}
          {...field}
          {...properties}
          value={value === undefined ? field.value : value}
          disabled={disabled}
          error={error}
        />
      )}
    </Form.Field>
  )
}

export default InputController
