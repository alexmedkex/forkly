import { IParcel } from './IParcel'

export interface ICargoModel {
  readonly _id?: string
  readonly status?: string
  readonly vaktId: string
  readonly source: string
  grade?: string
  cargoId: string
  parcels: IParcel[]
}
