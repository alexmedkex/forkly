import * as ajv from 'ajv'
import { injectable } from 'inversify'
import moment = require('moment')
import {
  CARGO_SCHEMA,
  PARCEL_SCHEMA,
  CARGO_SCHEMA_VERSION,
  CargoSchema,
  ICargo,
  ParcelSchema,
  TRADE_SCHEMA,
  TRADE_SCHEMA_VERSION,
  TradeSchema
} from '@komgo/types'
import { start } from 'repl'
import { getLogger } from '@komgo/logging'
export interface ICargoValidator {
  validate(data: any)
}

@injectable()
export class CargoValidator implements ICargoValidator {
  private readonly logger = getLogger('TradeValidator')
  private readonly validator: ajv.Ajv
  constructor() {
    this.validator = new ajv({ allErrors: true, $data: true }).addSchema([
      CargoSchema,
      ParcelSchema,
      CARGO_SCHEMA,
      PARCEL_SCHEMA
    ])
  }

  async validate(data: any) {
    const json = JSON.stringify(data, (key, value) => {
      if (['deemedBLDate', 'startDate', 'endDate'].indexOf(key) > -1) {
        return moment(value).format(moment.HTML5_FMT.DATE)
      }
      return value
    })

    return this.validateSchema(JSON.parse(json))
  }

  private validateSchema(data: ICargo) {
    const version = data.version
    const schemaId = version === CARGO_SCHEMA_VERSION.V1 ? CargoSchema.$id : (CARGO_SCHEMA as any).$id
    this.logger.info(`cargo version: ${version} checking with schema: ${schemaId}`)
    this.validator.validate(schemaId, data)

    const dateErrors = this.validateParcelDates(data)

    if (this.validator.errors) {
      this.validator.errors.push.apply(this.validator.errors, dateErrors)
    } else {
      this.validator.errors = dateErrors
    }

    if (this.validator.errors.length > 0) {
      return this.validator.errors
    }

    return null
  }

  private validateParcelDates(data: ICargo) {
    const errors = []
    if (data.parcels && data.parcels.length > 0) {
      for (let i = 0; i < data.parcels.length; i++) {
        const laycanPeriod = data.parcels[i].laycanPeriod

        if (laycanPeriod && laycanPeriod.startDate && laycanPeriod.endDate) {
          if (moment(laycanPeriod.startDate).isAfter(laycanPeriod.endDate)) {
            const error: ajv.ErrorObject = {
              keyword: 'Date',
              schemaPath: '',
              params: '',
              dataPath: `parcels[${i}].laycanPeriod.startDate`,
              message: 'startDate cannot be after endDate'
            }
            errors.push(error)
          }
        }
      }
    }
    return errors
  }
}
