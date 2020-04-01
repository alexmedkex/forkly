import { availablePermittedActions } from '@komgo/permissions'
import { IRolePermittedActionResponse } from '@komgo/types'
import { Schema } from 'mongoose'

function getKey({ product, action, permission }): string {
  let key: string = product ? product.id : ''
  key = action ? `${key}:${action.id}` : key
  key = permission ? `${key}:${permission.id}` : key
  return key
}

function actionsAvailable(permittedActions): boolean {
  for (const { product, action, permission } of permittedActions) {
    if (!availablePermittedActions[getKey({ product, action, permission })]) {
      return false
    }
  }
  return true
}

function checkDuplicates(permittedActions): boolean {
  const uniqueActions = Array.from(new Set(permittedActions.map(item => `${item.product.id}:${item.action.id}`)))
  return uniqueActions.length === permittedActions.length
}

export const permittedActionsValidation: (
  permittedActions: IRolePermittedActionResponse[]
) => boolean = permittedActions => {
  return actionsAvailable(permittedActions) && checkDuplicates(permittedActions)
}

export const roleDescriptionValidation = (v: string) => {
  return v.trim().length > 0
}

const PermissionAttributesSchema = new Schema(
  {
    id: {
      type: String,
      required: true
    },

    label: {
      type: String,
      required: true
    }
  },
  {
    _id: false
  }
)

const RolePermissionSchema = new Schema(
  {
    product: {
      type: PermissionAttributesSchema,
      required: true
    },

    action: {
      type: PermissionAttributesSchema,
      required: true
    },

    permission: {
      type: PermissionAttributesSchema
    }
  },
  {
    _id: false
  }
)

export const RoleSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    description: {
      type: String,
      validate: {
        validator: roleDescriptionValidation,
        message: 'Value cannot be empty!'
      },
      required: true
    },
    permittedActions: {
      type: [RolePermissionSchema],
      validate: {
        validator: permittedActionsValidation,
        message: props =>
          `${props.value} is not a valid permission! Value can be one of the following ${JSON.stringify(
            Object.keys(availablePermittedActions)
          )}`
      }
    },
    isSystemRole: Boolean
  },
  {
    versionKey: false
  }
)
