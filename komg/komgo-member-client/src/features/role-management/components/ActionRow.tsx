import * as React from 'react'
import { Checkbox, Radio } from 'semantic-ui-react'
import styled from 'styled-components'
import { Field, FieldProps, FormikProps } from 'formik'

import { administration } from '@komgo/permissions'
import { WithPermissionsProps, withPermissions } from '../../../components'
import { ActionType } from '../store/types'

interface ActionRowProps extends WithPermissionsProps {
  productId: string
  isSystemRole?: boolean
  action: ActionType
  disabled?: boolean
}

interface FormikCheckboxProps extends FieldProps {
  linkedName: string
  onChange: (params: {}) => void
}

interface FormikRadioProps extends FieldProps {
  id: string
}

const StyledActionRow = styled.div`
  display: flex;
  padding: 8px 11px 3px 11px;
  border-bottom: 1px solid #dae4eb;
`
const StyledActionName = styled.div`
  width: 150px;
  min-width: 150px;
  font-weight: bold;
  margin-left: 10px;
`
const StyledPermissions = styled.div`
  flex-grow: 1;
`
const StyledPermission = styled.div`
  margin: 0 25px 5px 0;
  display: inline-block;
`

export const FormikCheckbox: React.SFC<FormikCheckboxProps> = ({
  field,
  form,
  linkedName,
  onChange,
  ...props
}: FormikCheckboxProps): any => {
  return (
    <Checkbox
      checked={field.value}
      name={field.name}
      onChange={(e, { name, checked }) => name && onChange({ name, linkedName, checked, form })}
      {...props}
    />
  )
}

export const FormikRadio: React.SFC<FormikRadioProps> = ({ field: { name, value }, form, id, ...props }: any): any => {
  return (
    <Radio
      value={id}
      checked={id === value}
      name={name}
      onChange={(e, { name, value }) => name && form.setFieldValue(name, value)}
      {...props}
    />
  )
}

export class ActionRow extends React.Component<ActionRowProps> {
  constructor(props: ActionRowProps) {
    super(props)
    this.onCheckboxChange = this.onCheckboxChange.bind(this)
  }

  onCheckboxChange({ name, linkedName, checked, form }: any) {
    if (checked) {
      const permissions = this.props.action.permissions
      if (permissions && permissions.length !== 0) {
        form.setFieldValue(linkedName, permissions[0].id)
      } else {
        form.setFieldValue(linkedName, true)
      }
    } else {
      form.setFieldValue(linkedName, undefined)
    }

    // use undefined so Formik correctly calculates "dirty" flag
    form.setFieldValue(name, checked || undefined)
  }

  render() {
    const { productId, action, isSystemRole, isAuthorized } = this.props
    return (
      <StyledActionRow>
        <Field
          onChange={this.onCheckboxChange}
          name={`rowCheckboxes.${productId}:${action.id}`}
          linkedName={`permissions.${productId}:${action.id}`}
          disabled={isSystemRole || !isAuthorized(administration.canCrudRoles)}
          component={FormikCheckbox}
        />
        <StyledActionName>{action.label}</StyledActionName>
        <StyledPermissions>
          {action.permissions &&
            action.permissions.map(p => (
              <StyledPermission key={p.id}>
                <Field
                  disabled={isSystemRole || this.props.disabled || !isAuthorized(administration.canCrudRoles)}
                  id={p.id}
                  name={`permissions.${productId}:${action.id}`}
                  label={p.label}
                  component={FormikRadio}
                />
              </StyledPermission>
            ))}
        </StyledPermissions>
      </StyledActionRow>
    )
  }
}

export default withPermissions(ActionRow)
