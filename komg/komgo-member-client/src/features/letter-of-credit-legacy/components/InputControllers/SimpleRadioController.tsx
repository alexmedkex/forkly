import * as React from 'react'
import { FieldProps } from 'formik'
import { Form, Popup, Radio, Label } from 'semantic-ui-react'
import { RadioGroupProps } from './InputControllers'

export const SimpleRadioController: React.FC<RadioGroupProps & FieldProps> = ({
  fieldName,
  field: { name, value },
  form,
  options,
  type,
  ...props
}) => {
  const handleRadioOptionChange = (value: any) => () => {
    form.setFieldValue(name, value)
  }

  const handleRadioOptionBlur = (value: any) => () => {
    form.setFieldValue(name, value)
    form.setFieldTouched(name)
  }
  return (
    <Form.Field>
      <label id={`field_${name}`}>{fieldName}</label>
      {options.map(
        (option, idx) =>
          option.tooltip ? (
            <Popup
              trigger={
                <Form.Field key={idx}>
                  <Radio
                    checked={value === option.value}
                    onBlur={handleRadioOptionBlur(option.value)}
                    onChange={handleRadioOptionChange(option.value)}
                    label={option.label}
                    data-test-id={`${name}_${option.value}`}
                    {...props}
                  />
                </Form.Field>
              }
            >
              {option.tooltip}
            </Popup>
          ) : (
            <Form.Field key={idx}>
              <Radio
                checked={value === option.value}
                onBlur={handleRadioOptionBlur(option.value)}
                onChange={handleRadioOptionChange(option.value)}
                label={option.label}
                data-test-id={`${name}_${option.value}`}
                {...props}
              />
            </Form.Field>
          )
      )}
    </Form.Field>
  )
}
