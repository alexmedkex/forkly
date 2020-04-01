import * as React from 'react'

import { Product, RoleForm } from '../store/types'
import ActionRow from './ActionRow'

interface ProductActionsProps {
  isSystemRole?: boolean
  product: Product
  formValues: RoleForm
}

const ProductActions: React.SFC<ProductActionsProps> = (props: ProductActionsProps): any => {
  const { product, isSystemRole, formValues } = props

  return (
    <>
      {product.actions &&
        product.actions.map(action => (
          <ActionRow
            key={action.id}
            productId={product.id}
            action={action}
            isSystemRole={isSystemRole}
            disabled={!formValues.rowCheckboxes[`${product.id}:${action.id}`]}
          />
        ))}
    </>
  )
}

export default ProductActions
