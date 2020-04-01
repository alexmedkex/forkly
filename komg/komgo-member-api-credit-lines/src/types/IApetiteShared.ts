import { IShared, IAppetiteShared } from '@komgo/types'

export interface IAppetiteDataShared {
  data: { appetite?: IShared }
}

export interface IBaseSharedData {
  staticId: string
  sharedWithStaticId: string
}

export type IAppetiteSharedType = IAppetiteShared | IAppetiteDataShared
