import * as mongoose from 'mongoose'

export interface IPermittedActions {
  product: {
    id: string
    label: string
  }
  action: {
    id: string
    label: string
  }
  permission?: {
    id: string
    label: string
  }
}

export interface IRoleDocument extends mongoose.Document {
  id?: string
  label: string
  description: string
  permittedActions: IPermittedActions[]
  isSystemRole?: boolean
}
