import { ICargoData } from '../../src/business-layer/data/request-messages/ICargoData'

const cargoMessage: ICargoData = {
  version: 1,
  messageType: 'KOMGO.Trade.CargoData',
  vaktId: 'E2389423',
  cargoId: 'F17401',
  grade: 'FORTIES',
  parcels: [
    {
      id: 'F0401A',
      laycanPeriod: {
        startDate: '2017-12-31',
        endDate: '2017-12-31'
      },
      modeOfTransport: 'VESSEL',
      vesselIMO: 9747974,
      vesselName: 'TERN SEA',
      loadingPort: 'SULLOM_VOE',
      dischargeArea: 'Korea',
      inspector: 'INTERTEK',
      deemedBLDate: '2017-12-31',
      quantity: 600000
    }
  ]
}

export { cargoMessage }
