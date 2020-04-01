import 'reflect-metadata'

import moment = require('moment')

import { CargoValidator } from './CargoValidator'
import { ICargo, TradeSource, Grade, buildFakeParcel, buildFakeCargo } from '@komgo/types'
import { LOC_STATUS } from '../constants/LetterOfCreditStatus'

let cargo: ICargo

const cargoValidator = new CargoValidator()

describe('CargoController', () => {
  beforeEach(() => {
    cargo = {
      ...buildFakeCargo(),
      _id: '123',
      source: TradeSource.Komgo,
      sourceId: 'V93726453',
      cargoId: 'F0401',
      grade: Grade.Forties,
      parcels: [buildFakeParcel()],
      status: LOC_STATUS.TO_BE_FINANCED
    }
  })

  describe('.validate', () => {
    it('success ', async () => {
      const errors = await cargoValidator.validate(cargo)
      expect(errors).toBeNull()
    })

    it('pass with grade or modeOfTransport as string', async () => {
      cargo.grade = 'FAIL' as any
      cargo.parcels[0].modeOfTransport = 'FAIL_MODE' as any
      const errors = await cargoValidator.validate(cargo)
      expect(errors).toBeNull()
    })

    it('fail dates', async () => {
      cargo.parcels[0].laycanPeriod.startDate = moment('2017-12-31').toDate()
      cargo.parcels[0].laycanPeriod.endDate = moment('2017-12-30').toDate()

      const errors = await cargoValidator.validate(cargo)
      expect(errors.length).toEqual(1)
    })

    it('should fail if dates dates', async () => {
      cargo.parcels[0].laycanPeriod.startDate = moment('2017-12-31').toDate()
      cargo.parcels[0].laycanPeriod.endDate = moment('2017-12-30').toDate()

      const errors = await cargoValidator.validate(cargo)

      expect(errors[0].dataPath).toBe('parcels[0].laycanPeriod.startDate')
      expect(errors.length).toEqual(1)
    })

    it('should fail if multiple parcels have start date after end date', async () => {
      cargo.parcels[0].laycanPeriod.startDate = moment('2017-12-31').toDate()
      cargo.parcels[0].laycanPeriod.endDate = moment('2017-12-30').toDate()
      const newParcel = buildFakeParcel({ endDate: '2017-12-30' })
      cargo.parcels.push(newParcel)

      const errors = await cargoValidator.validate(cargo)

      expect(errors.length).toEqual(2)
      expect(errors[0].dataPath).toBe('parcels[0].laycanPeriod.startDate')
      expect(errors[1].dataPath).toBe('parcels[1].laycanPeriod.startDate')
    })

    it('should fail if one parcel out of multiple have start date after end date', async () => {
      const newParcel = buildFakeParcel({ endDate: '2017-12-30' })
      cargo.parcels.push(newParcel)

      const errors = await cargoValidator.validate(cargo)

      expect(errors[0].dataPath).toBe('parcels[1].laycanPeriod.startDate')
      expect(errors.length).toEqual(1)
    })
  })
})
