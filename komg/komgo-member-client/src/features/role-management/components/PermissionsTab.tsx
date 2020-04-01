import * as React from 'react'
import { List } from 'immutable'
import { Tab, Menu, Label, Checkbox } from 'semantic-ui-react'
import { Field } from 'formik'
import styled from 'styled-components'

import { Product, RoleForm } from '../store/types'
import ProductActions from './ProductActions'

interface PermissionsTabProps {
  products: List<Product>
  isSystemRole?: boolean
  formValues: RoleForm
}

const StyledTab = styled(Tab)`
  .ui.bottom.attached.segment.active.tab {
    border: none;
    box-shadow: none;
  }
`

const StyledTabPane = styled.div`
  .four.wide.column {
    width: 290px !important;
  }
  .stretched.twelve.wide.column {
    width: 550px !important;
    padding: 0;
  }
`

const StyledProductName = styled.span`
  width: 165px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StyledCheckbox = styled(Checkbox)`
  margin-bottom: -3px;
  margin-right: 10px;
`

const PermissionsTab: React.SFC<PermissionsTabProps> = (props: PermissionsTabProps): any => {
  const { formValues, products, isSystemRole } = props
  const panes = products.toArray().map(product => {
    const { checked, total } = calculateCheckedPermissions(formValues, product)
    return {
      menuItem: (
        <Menu.Item key={product.id}>
          <StyledProductName title={product.label}>
            <Field
              render={({ onChange, form }) => (
                <StyledCheckbox
                  checked={checked > 0}
                  disabled={isSystemRole}
                  name={'bulk.' + product.id}
                  onChange={(e, { name, isChecked }) => {
                    processBulk(product, checked === total, form, isChecked)
                  }}
                />
              )}
            />
            {product.label}
          </StyledProductName>
          <Label>
            {checked}/{total}
          </Label>
        </Menu.Item>
      ),
      pane: {
        key: product.id,
        content: <ProductActions formValues={formValues} product={product} isSystemRole={isSystemRole} />
      }
    }
  })

  return (
    <StyledTabPane>
      <StyledTab menu={{ fluid: true, vertical: true, tabular: true }} renderActiveOnly={false} panes={panes} />
    </StyledTabPane>
  )
}

export const processBulk = (product: Product, all: boolean, form: any, checked: boolean) => {
  const prefix = 'permissions.'
  product.actions.forEach(action => {
    const name = product.id + ':' + action.id
    const hasMultipleLevels = action.permissions && action.permissions.length !== 0
    if (!all) {
      form.setFieldValue('bulk.' + product.id, true)
      checked = true
    }
    form.setFieldValue('rowCheckboxes.' + name, checked)
    if (!checked) {
      form.setFieldValue(prefix + name, undefined)
      return
    }
    if (checked && hasMultipleLevels && !form.values.permissions[name]) {
      form.setFieldValue(prefix + name, action.permissions[0].id)
      return
    }
    if (checked && !hasMultipleLevels) {
      form.setFieldValue(prefix + name, checked)
      return
    }
  })
}

const calculateCheckedPermissions = (formValues: RoleForm, product: Product) => {
  let total = 0
  let checked = 0
  if (product.actions) {
    product.actions.forEach(action => {
      total += 1
      if (formValues.permissions[`${product.id}:${action.id}`]) {
        checked += 1
      }
    })
  }
  return { checked, total }
}

export default PermissionsTab
