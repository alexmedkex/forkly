import { LOC_STATUS } from '../constants/LetterOfCreditStatus'
import { GradeFactory } from '../constants/Grade'
import { CargoArgumentError } from './CargoArgumentError'
import { ICargo, IParcel, TradeSource, Grade, CARGO_SCHEMA_VERSION } from '@komgo/types'

export class Cargo implements ICargo {
  readonly status: string
  readonly source: TradeSource
  readonly sourceId: string
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt?: string
  // tslint:disable-next-line
  readonly _id: string
  grade: Grade
  cargoId: string
  parcels: IParcel[]
  version?: CARGO_SCHEMA_VERSION
  quality?: string
  originOfGoods?: string

  constructor(source: TradeSource, sourceId: string, options: any = {}) {
    const { grade, cargoId, parcels, createdAt, updatedAt, deletedAt, _id, version, quality, originOfGoods } = options

    if (!Object.values(TradeSource).includes(source)) {
      throw new CargoArgumentError(`'source' ${source} invalid. Valid values: (${Object.keys(TradeSource).join('|')})`)
    }

    this.source = source
    this.sourceId = sourceId
    this.status = LOC_STATUS.TO_BE_FINANCED
    this.cargoId = cargoId
    this.parcels = parcels
    this.grade = grade ? grade : source === TradeSource.Vakt ? GradeFactory.fromCargoId(cargoId) : null
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.deletedAt = deletedAt
    this.version = version
    this.quality = quality
    this.originOfGoods = originOfGoods
    // this._id = _id
  }
}
