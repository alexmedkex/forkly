import DataAccess from '@komgo/data-access'
import { Model } from 'mongoose'

import { IMemberDocument } from './IMemberDocument'
import { MemberSchema } from './MemberSchema'

export type MemberModel = Model<IMemberDocument>

export const MemberRepo: MemberModel = DataAccess.connection.model<IMemberDocument>('member', MemberSchema)
