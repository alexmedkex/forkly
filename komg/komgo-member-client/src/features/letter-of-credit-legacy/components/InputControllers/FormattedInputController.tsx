import * as React from 'react'
import { InputProps } from './InputControllers'
import { FieldProps } from 'formik'
import { FIELD_ERROR_CLASSNAME } from '../../constants'
import { Input, Popup, Form } from 'semantic-ui-react'

export interface FormattedInputControllerProps<V> extends InputProps {
  initialValue: V
  defaultValue: V
  tooltipDescription?: string
  formatAsString: (value: V) => string
  toValue: (s: string | V) => V
  // Optionally you can use supply onChange instead of setFieldValue/setFieldTouched
  onChange?: (value: V) => any
  onFocus?: (value: V) => any
  setFieldValue?: (name: string, value: V) => any
  setFieldTouched?: (name: string, isTouched?: boolean | undefined) => any
}

export interface FormattedInputControllerState<V> {
  value: V
  focussed: boolean
}

export const WrappedFormattedInputController = (
  p: FormattedInputControllerProps<any> & Partial<FieldProps> & InputProps & { customStyle?: React.CSSProperties }
) => {
  const { fieldStyle, inline, customStyle, ...props } = p
  return (
    <Form.Field inline={inline} style={fieldStyle}>
      <label className="inputLabel">{p.fieldName}</label>
      <FormattedInputController {...props} style={customStyle} />
    </Form.Field>
  )
}

export class FormattedInputController<V> extends React.Component<
  FormattedInputControllerProps<V> & Partial<FieldProps>,
  FormattedInputControllerState<V>
> {
  constructor(props: any) {
    super(props)

    this.state = {
      value: this.props.initialValue !== undefined ? this.props.initialValue : this.props.field.value,
      focussed: false
    }
  }

  handleChange = (e: any) => {
    this.setState({ value: e.target.value })
  }

  handleFocus = e => {
    const { onFocus } = this.props
    this.setState({ focussed: true })
    if (onFocus) {
      onFocus(e)
    }
  }

  handleBlur = () => {
    const { setFieldValue, setFieldTouched, toValue, form, field, defaultValue, onChange } = this.props
    this.setState({ focussed: false, value: toValue(this.state.value) }, () => {
      if (onChange) {
        onChange(this.state.value)
      } else {
        if (setFieldValue) {
          setFieldValue(field.name, this.state.value ? this.state.value : defaultValue)
        } else {
          form.setFieldValue(field.name, this.state.value ? this.state.value : defaultValue)
        }
        if (setFieldTouched) {
          setFieldTouched(field.name, true)
        } else {
          form.setFieldTouched(field.name, true)
        }
      }
    })
  }

  render() {
    const {
      formatAsString,
      toValue,
      initialValue,
      setFieldValue,
      setFieldTouched,
      form,
      field,
      fieldName,
      error,
      defaultValue,
      tooltipDescription,
      ...props
    } = this.props
    const { value, focussed } = this.state
    const realValue = value === undefined ? field.value : value

    let dataValue = focussed ? realValue : formatAsString(realValue)

    if (props.type === 'text' || props.type === 'number') {
      dataValue = dataValue || ''
    }

    const inputComponent = (
      <Input
        {...field}
        {...props}
        className={error ? FIELD_ERROR_CLASSNAME : ''}
        value={dataValue}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
      />
    )
    if (tooltipDescription) {
      return (
        <Popup trigger={<span style={{ paddingTop: '8px' }}>{inputComponent}</span>} content={tooltipDescription} />
      )
    }
    return inputComponent
  }
}
