import { modelFactory } from '@komgo/data-access'
import * as mongoose from 'mongoose'

import { IRoleDocument } from './IRoleDocument'
import { RoleSchema } from './RoleSchema'

export type RoleModel = mongoose.Model<IRoleDocument>

export const roleModelFactory = modelFactory<IRoleDocument>('role', RoleSchema)
