import * as React from 'react'
import {
  Form,
  Input,
  Dropdown,
  DropdownProps as SemanticDropdownProps,
  Checkbox,
  Radio,
  Grid,
  TextArea,
  Popup,
  SemanticShorthandItem,
  LabelProps
} from 'semantic-ui-react'
import { FieldProps } from 'formik'
import { startCase } from 'lodash'
import { sentenceCaseWithAcronyms } from '../../../../utils/casings'
import { FIELD_ERROR_CLASSNAME, FIELD_DISABLED_CLASSNAME } from '../../constants'
import { domainSpecificCasingOverrides } from './acronyms'
import { truncate } from '../../../../utils/casings'
import { findTooltipValueForDropdown } from '../../utils/selectors'
import { stringOrNull } from '../../../../utils/types'

export interface InputProps {
  fieldName: string
  type?: string
  fieldStyle?: React.CSSProperties
  disabled?: boolean
  error?: boolean
  customOnChange?: (e?: React.ChangeEvent<any>, data?: any) => void
  maxLength?: number
  style?: React.CSSProperties
  inline?: boolean
}

export interface DropdownOptions {
  value: string
  content: string
  text: string
}

export interface RadioOptions {
  value: any
  label: string
  tooltip?: string
  style?: React.CSSProperties
}

interface DropdownProps extends InputProps {
  options?: DropdownOptions[]
  tooltip?: boolean
  tooltipValue?: stringOrNull
  hideLabel?: boolean
  customStyle?: React.CSSProperties // TODO LS should we move it to InputProps
}

export interface CustomStyles {
  columnStyle?: React.CSSProperties
  fieldStyle?: React.CSSProperties
  wrapperFieldsStyle?: React.CSSProperties
}

export interface RadioGroupProps extends InputProps {
  options: RadioOptions[]
  stylingValues?: CustomStyles
  customStyle?: React.CSSProperties // TODO LS should we move it to InputProps
}

interface InputConfigurationOptions {
  tooltipValue: string
  maxLengthOfValue?: number
  style?: React.CSSProperties
}

export interface InputConfiguration extends InputProps {
  configuration?: InputConfigurationOptions
  value?: string | undefined
  hideLabel?: boolean
  customStyle?: React.CSSProperties
}

export const fieldColumnStyling = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

export const TextAreaController: React.SFC<InputProps & FieldProps> = ({ field, error, form, style, ...props }) => (
  <TextArea
    {...field}
    {...props}
    // unfortunately TextArea doesn't respect the FIELD_ERROR_CLASSNAME className so we have to do this custom
    // styling
    style={{ ...style, border: error && '1px solid #d45c64', background: error && '#fff6f6' }}
  />
)

export const TextController: React.SFC<InputProps & FieldProps> = ({ field, error, ...props }) => (
  <Input {...field} {...props} className={error ? FIELD_ERROR_CLASSNAME : ''} />
)

export const DropdownController: React.SFC<DropdownProps & FieldProps> = ({
  field,
  error,
  disabled,
  tooltip,
  ...props
}) => {
  const handleDropdownChange = (_: React.SyntheticEvent, { name, value }: SemanticDropdownProps) => {
    props.form.setFieldValue(name, value)
  }

  const handleDropdownBlur = (_: React.SyntheticEvent, { name, value }: SemanticDropdownProps) => {
    props.form.setFieldValue(name, value)
    props.form.setFieldTouched(name)
  }

  const dropdownComponent = (
    <Dropdown
      {...field}
      {...props}
      onChange={handleDropdownChange}
      onBlur={handleDropdownBlur}
      className={error ? FIELD_ERROR_CLASSNAME : disabled ? FIELD_DISABLED_CLASSNAME : ''}
      disabled={disabled}
    />
  )
  if (tooltip) {
    return <Popup trigger={<span style={{ paddingTop: '8px' }}>{dropdownComponent}</span>} content={tooltip} />
  }
  return dropdownComponent
}

export const GridTextController: React.FC<InputConfiguration & FieldProps> = ({
  fieldName,
  field,
  fieldStyle,
  type,
  disabled,
  error,
  form,
  value,
  configuration,
  hideLabel,
  customStyle,
  ...props
}) => {
  if (type === 'textarea') {
    return basicTextArea(disabled, field, props, error, fieldStyle, fieldName, value, customStyle)
  } else if (configuration) {
    return inputWithTooltip(
      type,
      fieldStyle,
      fieldName,
      disabled,
      field,
      props,
      error,
      value,
      configuration,
      hideLabel,
      customStyle
    )
  }
  return basicInput(type, disabled, field, props, error, fieldStyle, fieldName, value, hideLabel, customStyle)
}

function inputWithTooltip(
  type: string | undefined,
  fieldStyle: React.CSSProperties | undefined,
  fieldName: string,
  disabled: boolean | undefined,
  field: { onChange: (e: React.ChangeEvent<any>) => void; onBlur: (e: any) => void; value: any; name: string },
  props: {
    customOnChange?: ((e?: React.ChangeEvent<any> | undefined) => void) | undefined
    maxLength?: number | undefined
    style?: React.CSSProperties | undefined
    children?: React.ReactNode
  },
  error: boolean | undefined,
  value: string | undefined,
  configuration: InputConfigurationOptions,
  hideLabel: boolean = false,
  customStyle?: React.CSSProperties
): React.ReactElement<any> | null {
  return (
    <Form.Field inline={true} style={fieldStyle}>
      {!hideLabel && <label className="inputLabel">{fieldName}</label>}
      <Popup
        trigger={
          <span style={configuration.style ? configuration.style : { width: '50%', display: 'inline-block' }}>
            <Input
              type={type || 'text'}
              disabled={disabled}
              style={customStyle ? customStyle : { width: '100%' }}
              name={field.name}
              {...props}
              {...field}
              className={error ? FIELD_ERROR_CLASSNAME : disabled ? FIELD_DISABLED_CLASSNAME : ''}
              value={truncate(value, configuration.maxLengthOfValue ? configuration.maxLengthOfValue : 40)}
            />
          </span>
        }
        content={configuration && configuration.tooltipValue ? configuration.tooltipValue : ''}
      />
    </Form.Field>
  )
}

function basicInput(
  type: string | undefined,
  disabled: boolean | undefined,
  field: { onChange: (e: React.ChangeEvent<any>) => void; onBlur: (e: any) => void; value: any; name: string },
  props: {
    customOnChange?: ((e?: React.ChangeEvent<any> | undefined) => void) | undefined
    onFocus?: ((e?: React.ChangeEvent<any> | undefined) => void) | undefined
    maxLength?: number | undefined
    style?: React.CSSProperties | undefined
    children?: React.ReactNode
    inline?: boolean
    label?: SemanticShorthandItem<LabelProps>
  },
  error: boolean | undefined,
  fieldStyle: React.CSSProperties | undefined,
  fieldName: string,
  value: string | undefined,
  hideLabel: boolean = false,
  customStyle?: React.CSSProperties
): React.ReactElement<any> | null {
  const { inline, label, onFocus, ...properties } = props
  const focusHandler = (e: React.FocusEvent) => {
    return onFocus && onFocus(e)
  }
  return (
    <Form.Field inline={inline} style={fieldStyle}>
      {!hideLabel ? <label className="inputLabel">{fieldName}</label> : undefined}
      <Input
        type={type ? type : 'text'}
        disabled={disabled}
        style={customStyle ? customStyle : { width: '50%' }}
        label={label}
        {...field}
        {...properties}
        onFocus={focusHandler}
        className={error ? FIELD_ERROR_CLASSNAME : disabled ? FIELD_DISABLED_CLASSNAME : ''}
        value={value === undefined ? field.value : value}
      />
    </Form.Field>
  )
}

function basicTextArea(
  disabled: boolean | undefined,
  field: { onChange: (e: React.ChangeEvent<any>) => void; onBlur: (e: any) => void; value: any; name: string },
  props: {
    customOnChange?: ((e?: React.ChangeEvent<any> | undefined) => void) | undefined
    onFocus?: ((e?: React.ChangeEvent<any> | undefined) => void) | undefined
    maxLength?: number | undefined
    style?: React.CSSProperties | undefined
    children?: React.ReactNode
  },
  error: boolean | undefined,
  fieldStyle: React.CSSProperties | undefined,
  fieldName: string,
  value: string | undefined,
  customStyle: any
): React.ReactElement<any> | null {
  const normalStyling = { width: '50%', ...(customStyle ? customStyle : {}) }

  // We have to declare disabled and error styling as semantic disabled/error props
  // don't work on text areas
  const disabledStyling = {
    ...normalStyling,
    backgroundColor: 'rgb(245,247,249)',
    color: 'rgb(158,172,186)',
    pointerEvents: 'inherit'
  }

  const errorStyling = {
    ...normalStyling,
    backgroundColor: '#FCF2F2',
    border: '1px solid rgb(227, 85, 101)',
    borderRadius: '5px'
  }

  return (
    <Form.Field inline={true} style={fieldStyle}>
      <label className="inputLabel">{fieldName}</label>
      <TextArea
        disabled={disabled}
        style={disabled ? disabledStyling : error ? errorStyling : normalStyling}
        {...field}
        {...props}
        className={error ? FIELD_ERROR_CLASSNAME : ''}
        value={value === undefined ? field.value : value}
      />
    </Form.Field>
  )
}

const attachDropdownCssClass = (className: string) => (className ? `${className} dropdown-input` : 'dropdown-input')

export const GridDropdownController: React.FC<DropdownProps & FieldProps> = ({
  fieldName,
  field,
  form,
  fieldStyle,
  options,
  disabled,
  error,
  tooltip,
  tooltipValue,
  hideLabel,
  inline,
  customStyle,
  customOnChange,
  ...props
}) => {
  const handleDropdownChange = (e: React.SyntheticEvent, { name, value }: SemanticDropdownProps) => {
    form.setFieldValue(name, value)
    if (customOnChange) {
      customOnChange(e, { name, value })
    }
  }

  const handleDropdownBlur = (_: React.SyntheticEvent, { name, value }: SemanticDropdownProps) => {
    form.setFieldValue(name, value)
    form.setFieldTouched(name)
  }

  if (options && tooltip && !tooltipValue) {
    tooltipValue = findTooltipValueForDropdown(options, field.value)
  }

  const isSupportedValue = options ? options.map(o => o.value).includes(field.value) : false
  const className = error ? FIELD_ERROR_CLASSNAME : disabled ? FIELD_DISABLED_CLASSNAME : ''
  const style = customStyle ? customStyle : { width: '50%' }
  const classNameExtended = attachDropdownCssClass(className)
  const Controller =
    !isSupportedValue && disabled ? (
      // fallback to a not editable field if the value isn't supported
      <Input
        type={'text'}
        disabled={true}
        style={style}
        {...field}
        {...props}
        className={className}
        value={field.value}
      />
    ) : (
      <Dropdown
        className={classNameExtended}
        style={style}
        compact={true}
        name={field.name}
        selection={true}
        disabled={disabled}
        options={options}
        ref={(element: any) => {
          // Workaround inject the id to the actual input field
          return element && field && element.searchRef && element.searchRef.setAttribute('id', `field_${field.name}`)
        }}
        onChange={handleDropdownChange}
        onBlur={handleDropdownBlur}
        value={field.value}
        {...props}
      />
    )

  return dropdownFormField(fieldStyle, fieldName, tooltipValue, Controller, hideLabel, inline)
}

function dropdownFormField(
  fieldStyle: React.CSSProperties,
  fieldName: string,
  tooltipValue: string,
  Controller: JSX.Element,
  hideLabel: boolean,
  inline: boolean
): React.ReactElement<any> {
  return (
    <Form.Field inline={inline} style={fieldStyle}>
      {!hideLabel && <label className="inputLabel">{fieldName}</label>}
      {tooltipValue ? <Popup trigger={Controller} content={tooltipValue} /> : Controller}
    </Form.Field>
  )
}

export const CheckboxController: React.SFC<InputProps & FieldProps> = ({
  fieldName,
  form,
  field: { name, value, onBlur, onChange },
  type,
  customOnChange,
  ...props
}) => {
  return (
    <Form.Field inline={true}>
      <Checkbox
        id={name}
        checked={value}
        onBlur={onBlur}
        onChange={(e: React.ChangeEvent<any>) => {
          onChange(e)
          return customOnChange && customOnChange(e)
        }}
        label={fieldName}
        {...props}
      />
    </Form.Field>
  )
}

export const enumToRadioOptions = (input: any, tooltips?: any, extraInfo?: any, labels?: any): RadioOptions[] =>
  Object.values(input).map((i: string) => ({
    value: i,
    label:
      labels && labels[i]!
        ? labels[i]
        : sentenceCaseWithAcronyms(startCase(extraInfo && extraInfo[i] ? `${i} ${extraInfo[i]}` : i)),
    tooltip: tooltips && tooltips[i]
  }))

export const booleanToRadioOptions: RadioOptions[] = [
  {
    value: true,
    label: 'Yes'
  },
  {
    value: false,
    label: 'No'
  }
]

export const enumToDropdownOptions = (input: any, simple?: boolean): DropdownOptions[] =>
  Object.values(input).map((i: string) => ({
    value: i,
    content: simple ? i : sentenceCaseWithAcronyms(startCase(i), domainSpecificCasingOverrides),
    text: simple ? i : sentenceCaseWithAcronyms(startCase(i), domainSpecificCasingOverrides)
  }))

export const enumToDropdownOptionsCustomLabels = (input: any, labels?: any): DropdownOptions[] =>
  Object.values(input).map((i: string) => ({
    value: i,
    content: labels && labels[i] ? labels[i] : sentenceCaseWithAcronyms(startCase(i), domainSpecificCasingOverrides),
    text: labels && labels[i] ? labels[i] : sentenceCaseWithAcronyms(startCase(i), domainSpecificCasingOverrides)
  }))

export const withEmptyItem = (items: DropdownOptions[], emptyValue?: Partial<DropdownOptions>): DropdownOptions[] => [
  { value: null, content: '', text: '', ...(emptyValue || {}) },
  ...items
]

export const RadioController: React.FC<RadioGroupProps & FieldProps> = ({
  fieldName,
  field: { name, value },
  fieldStyle,
  form,
  options,
  type,
  customOnChange,
  stylingValues,
  ...props
}) => {
  const handleRadioOptionChange = (buttonValue: string | boolean) => () => {
    form.setFieldValue(name, buttonValue)
    return customOnChange && customOnChange()
  }

  const handleRadioOptionBlur = (buttonValue: string | boolean) => () => {
    form.setFieldValue(name, buttonValue)
    form.setFieldTouched(name)
  }

  return (
    <Grid columns={2}>
      <Grid.Row>
        <Grid.Column style={stylingValues && stylingValues.columnStyle ? stylingValues.columnStyle : {}}>
          <Form.Field inline={true} style={fieldStyle}>
            <label className="inputLabel">{fieldName}</label>
          </Form.Field>
        </Grid.Column>
        <Grid.Column style={stylingValues && stylingValues.wrapperFieldsStyle ? stylingValues.wrapperFieldsStyle : {}}>
          {options.map((option, idx) => (
            <Form.Field key={idx} style={stylingValues && stylingValues.fieldStyle ? stylingValues.fieldStyle : {}}>
              {option.tooltip ? (
                <Popup
                  trigger={
                    <Radio
                      {...props}
                      checked={value === option.value}
                      onBlur={handleRadioOptionBlur(option.value)}
                      onChange={handleRadioOptionChange(option.value)}
                      label={option.label}
                      style={option.style ? option.style : {}}
                    />
                  }
                >
                  {option.tooltip}
                </Popup>
              ) : (
                <Radio
                  checked={value === option.value}
                  onBlur={handleRadioOptionBlur(option.value)}
                  onChange={handleRadioOptionChange(option.value)}
                  label={option.label}
                  {...props}
                />
              )}
            </Form.Field>
          ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
