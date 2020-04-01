import { cargoDataMapper } from './cargoDataMapper'
import { ICargoData } from '../ICargoData'
import * as moment from 'moment'
import { LOC_STATUS } from '../../../../data-layer/constants/LetterOfCreditStatus'
import { buildFakeCargo, Grade, ICargo, ModeOfTransport, TradeSource } from '@komgo/types'
import { Cargo } from '../../../../data-layer/models/Cargo'

const receivedCargoData: ICargoData = {
  cargoId: 'F0401',
  vaktId: 'E2389423',
  grade: 'A1',
  messageType: 'KOMGO.Trade.CargoData',
  version: 1,
  parcels: [
    {
      deemedBLDate: '2017-12-31',
      dischargeArea: 'FAWLEY',
      id: 'F0401/A',
      inspector: 'INTERTEK',
      laycanPeriod: { startDate: '2017-12-31', endDate: '2017-12-31' },
      loadingPort: 'SULLOM_VOE',
      quantity: 600000,
      vesselIMO: 9747974,
      vesselName: 'TERN SEA',
      modeOfTransport: ModeOfTransport.Vessel
    }
  ]
}

const CARGO_MOCK: ICargo = {
  ...buildFakeCargo(),
  cargoId: 'F0401',
  source: TradeSource.Vakt,
  sourceId: 'E2389423',
  grade: 'A1',
  status: LOC_STATUS.TO_BE_FINANCED,
  parcels: [
    {
      deemedBLDate: moment('2017-12-31').toDate(),
      dischargeArea: 'FAWLEY',
      id: 'F0401/A',
      inspector: 'INTERTEK',
      laycanPeriod: { startDate: moment('2017-12-31').toDate(), endDate: moment('2017-12-31').toDate() },
      loadingPort: 'SULLOM_VOE',
      quantity: 600000,
      vesselIMO: 9747974,
      vesselName: 'TERN SEA',
      modeOfTransport: ModeOfTransport.Vessel
    }
  ],
  // Not part of VAKT data model
  _id: undefined,
  createdAt: undefined,
  deletedAt: undefined,
  originOfGoods: undefined,
  quality: undefined,
  version: undefined,
  updatedAt: undefined
}

const receivedCargoDataWithoutGrade: ICargoData = {
  ...receivedCargoData,
  grade: ''
}

const cargoDataWithoutParcels: ICargoData = {
  cargoId: 'F0401',
  vaktId: 'E2389423',
  grade: Grade.Brent,
  messageType: 'KOMGO.Trade.CargoData',
  version: 1,
  parcels: null
}

const cargoDataWithoutParcelsMapped: Cargo = {
  ...CARGO_MOCK,
  cargoId: 'F0401',
  grade: Grade.Brent,
  parcels: null,
  source: TradeSource.Vakt,
  status: 'TO_BE_FINANCED',
  sourceId: 'E2389423'
}

const cargoDataGradeFORTIES: ICargo = {
  ...CARGO_MOCK,
  grade: 'FORTIES'
}

describe('CargoDataMapper', () => {
  it('Maps Cargo Data', () => {
    const mapped = cargoDataMapper(receivedCargoData, TradeSource.Vakt)
    expect(mapped).toEqual(CARGO_MOCK)
  })

  it('Maps Cargo Data without parcels', () => {
    expect(cargoDataWithoutParcelsMapped).toEqual(cargoDataMapper(cargoDataWithoutParcels, TradeSource.Vakt))
  })

  it('Maps Cargo Data with Grade added automatically', () => {
    expect(cargoDataGradeFORTIES).toEqual(cargoDataMapper(receivedCargoDataWithoutGrade, TradeSource.Vakt))
  })
})
