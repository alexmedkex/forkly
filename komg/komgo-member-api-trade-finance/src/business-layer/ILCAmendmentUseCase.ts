import IUser from './IUser'
import { ILCAmendmentBase } from '@komgo/types'

export interface ILCAmendmentUseCase {
  create(amendment: ILCAmendmentBase, user: IUser): Promise<string[]>
  approve(amendmentStaticId: string, request?: any, user?: IUser)
  reject(amendmentStaticId: string, comments: string)
}
