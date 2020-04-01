import * as React from 'react'
import { Form, Icon, Popup } from 'semantic-ui-react'
import { Field } from 'formik'
import styled from 'styled-components'

import { withPermissions, WithPermissionsProps } from '../../../components'
import { administration } from '@komgo/permissions'

interface RoleInfoTabProps extends WithPermissionsProps {
  maxLength: number
  currentLength: number
  isModification: boolean
  isSystemRole?: boolean
}

const StyledIcon = styled(Icon)`
  && {
    margin-left: 7px;
  }
`

const StyledCounter = styled.div`
  padding-top: 0.85em;
`

export const StyledTabPane = styled.div`
  width: 500px;
`

export const RoleInfoTab: React.SFC<RoleInfoTabProps> = (props: RoleInfoTabProps): any => {
  const { isModification, isSystemRole, isAuthorized, maxLength, currentLength } = props

  return (
    <StyledTabPane>
      <Form.Field>
        <label htmlFor="role-label">
          Role name
          <Popup
            trigger={<StyledIcon name="info circle" />}
            inverted={true}
            position="right center"
            content={
              isModification
                ? 'Role name cannot be changed'
                : "You won't be able to change role name once role is created"
            }
          />
        </label>
        <Field
          disabled={isModification || isSystemRole}
          component="input"
          name="label"
          id="role-label"
          placeholder="Role name"
        />
      </Form.Field>
      <Form.Field>
        <label htmlFor="role-description">Description</label>
        <Field
          disabled={isSystemRole || !isAuthorized(administration.canCrudRoles)}
          component="textarea"
          name="description"
          id="role-description"
          placeholder="Description"
          rows={5}
        />
        <StyledCounter>
          {props.currentLength} of {props.maxLength} characters remaining
        </StyledCounter>
      </Form.Field>
    </StyledTabPane>
  )
}

export default withPermissions(RoleInfoTab)
