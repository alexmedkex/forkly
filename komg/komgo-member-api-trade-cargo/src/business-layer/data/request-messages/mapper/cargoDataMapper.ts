import { ICargoData, IParcelData } from '../ICargoData'
import { Cargo } from '../../../../data-layer/models/Cargo'
// import { IParcel } from '../../../../data-layer/models/IParcel'
import { IParcel, TradeSource } from '@komgo/types'
import { mapPeriod, mapDate } from './commonMappers'

export const cargoDataMapper = (message: ICargoData, source: TradeSource) => {
  return new Cargo(source, message.vaktId, {
    cargoId: message.cargoId,
    grade: message.grade,
    parcels: message.parcels ? message.parcels.map(mapParcel) : message.parcels
  })
}

export const mapParcel = (parceldata: IParcelData): IParcel => {
  const { laycanPeriod, deemedBLDate, ...parcel } = parceldata

  return {
    ...parcel,
    deemedBLDate: mapDate(deemedBLDate),
    laycanPeriod: mapPeriod(laycanPeriod)
  }
}
