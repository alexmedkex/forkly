import { Schema } from 'mongoose'
import { permissionsByProductAndAction } from '@komgo/permissions'
import { TaskType } from '../../../../service-layer/request/task'

function getKey({ productId, actionId }): string {
  return `${productId}:${actionId}`
}

function actionsAvailable(requiredPermission): boolean {
  return permissionsByProductAndAction.hasOwnProperty(getKey(requiredPermission))
}

export function requiredPermissionValidation(requiredActions): boolean {
  return actionsAvailable(requiredActions)
}

const RequiredPermissionSchema = new Schema(
  {
    productId: {
      type: String,
      required: true
    },
    actionId: {
      type: String,
      required: true
    }
  },
  { _id: false }
)

const TaskSchema = new Schema(
  {
    summary: {
      type: String,
      required: true
    },
    taskType: {
      type: TaskType,
      required: true
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done', 'Pending Confirmation'],
      required: true
    },
    counterpartyStaticId: {
      type: String
    },
    requiredPermission: {
      type: RequiredPermissionSchema,
      validate: {
        validator: requiredPermissionValidation,
        msg: `Value can be one of the following ${JSON.stringify(Object.keys(permissionsByProductAndAction))}`
      },
      required: true
    },
    assignee: {
      type: String,
      default: null
    },
    comment: {
      type: String
    },
    outcome: {
      type: Boolean
    },
    context: {
      type: Object,
      validate: {
        validator: (obj): boolean => Object.keys(obj).length !== 0,
        msg: 'context can not be empty'
      },
      required: true
    },
    dueAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

TaskSchema.index({
  createdAt: 1
})

export default TaskSchema
