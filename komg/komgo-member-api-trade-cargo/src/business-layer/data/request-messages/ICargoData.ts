import { IMessageData } from './IMessageData'
import { IPeriod } from '@komgo/types'

// This is vakt data model
export interface ICargoData extends IMessageData {
  grade: string
  cargoId: string
  parcels: IParcelData[]
}

export interface IParcelData {
  id: string
  laycanPeriod: IPeriod
  modeOfTransport: string
  vesselIMO: number
  vesselName: string
  loadingPort: string
  dischargeArea: string
  inspector: string
  deemedBLDate: string
  quantity: number
}
