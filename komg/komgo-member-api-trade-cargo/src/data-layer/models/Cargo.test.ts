import { Cargo } from './Cargo'
import { ModeOfTransport, Grade, TradeSource } from '@komgo/types'

import { LOC_STATUS } from '../constants/LetterOfCreditStatus'
import { CargoArgumentError } from './CargoArgumentError'

const MOCK_CARGO_GRADE_A1 = {
  cargoId: 'F0401',
  sourceId: 'E2389423',
  grade: 'A1',
  status: LOC_STATUS.TO_BE_FINANCED,
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

describe('Cargo', () => {
  it('should be defined', () => {
    expect(Cargo).toBeDefined()
  })

  it('should fails if invalid SOURCE', () => {
    const { sourceId, ...data } = MOCK_CARGO_GRADE_A1
    expect(() => new Cargo('__INVALID__' as any, sourceId, data)).toThrow(CargoArgumentError)
  })

  it('should create a Cargo with provided grade', () => {
    const { sourceId, ...data } = MOCK_CARGO_GRADE_A1
    expect(new Cargo(TradeSource.Vakt, sourceId, data)).toMatchObject(MOCK_CARGO_GRADE_A1)
  })

  it('should create a Cargo with grade BRENT from CargoId starting with B', () => {
    const { sourceId, ...data } = {
      ...MOCK_CARGO_GRADE_A1,
      grade: undefined,
      cargoId: 'B0401'
    }

    const cargo = new Cargo(TradeSource.Vakt, sourceId, data)

    expect(cargo.grade).toEqual('BRENT')
  })

  it('should create a Cargo with grade OSEBERG from CargoId starting with e', () => {
    const { sourceId, ...data } = {
      ...MOCK_CARGO_GRADE_A1,
      grade: undefined,
      cargoId: 'e588'
    }

    const cargo = new Cargo(TradeSource.Vakt, sourceId, data)

    expect(cargo.grade).toEqual('EKOFISK')
  })

  it('should create a Cargo without grade if the cargoId doesnt match', () => {
    const { sourceId, ...data } = {
      ...MOCK_CARGO_GRADE_A1,
      grade: undefined,
      cargoId: 'YE588'
    }

    const cargo = new Cargo(TradeSource.Vakt, sourceId, data)

    expect(cargo.grade).toBeUndefined()
  })

  it('should create a Cargo with grade TROLL from CargoId starting with T, if grade is empty string', () => {
    const { sourceId, ...data } = {
      ...MOCK_CARGO_GRADE_A1,
      grade: '',
      cargoId: 'TTD'
    }

    const cargo = new Cargo(TradeSource.Vakt, sourceId, data)

    expect(cargo.grade).toEqual('TROLL')
  })

  it('should create a Cargo with grade FORTIES from CargoId starting with f, if grade is empty string', () => {
    const { sourceId, ...data } = {
      ...MOCK_CARGO_GRADE_A1,
      grade: '',
      cargoId: 'f588'
    }

    const cargo = new Cargo(TradeSource.Vakt, sourceId, data)

    expect(cargo.grade).toEqual(Grade.Forties)
  })
})
