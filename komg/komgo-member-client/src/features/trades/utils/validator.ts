import {
  CreditRequirements,
  Law,
  TRADE_SCHEMA,
  CARGO_SCHEMA,
  PARCEL_SCHEMA,
  getCargoSchemaId,
  CARGO_SCHEMA_VERSION,
  getTradeSchemaId,
  TRADE_SCHEMA_VERSION,
  Commodity,
  DeliveryTerms,
  PaymentTermsEventBase,
  PARCEL_SCHEMA_VERSION,
  getParcelSchemaId,
  ModeOfTransport,
  ICargo
} from '@komgo/types'
import Ajv from 'ajv'
import validateDateRange from '../../../utils/validateDateRange'
import { toFormikErrors } from '../../../utils/validator'
import { ICreateOrUpdateTrade } from '../store/types'
import { FormikErrors } from 'formik'
import { IParcelWithOverrides } from '../components/cargo-form-fields/ParcelData'
import {
  EDITABLE_TRADE_FIELDS_AFTER_QUOTE_ACCEPTED,
  EDITABLE_CARGO_FIELDS_AFTER_QUOTE_ACCEPTED
} from './tradeActionUtils'
import _ from 'lodash'
import { isCargoDataEntered } from './tradeActionUtils'
import { replaceEmptyStringsAndNullWithUndefined } from './formatters'
import { TradingRole } from '../constants'

const validator = new Ajv({ allErrors: true, $data: true }).addSchema([TRADE_SCHEMA, CARGO_SCHEMA, PARCEL_SCHEMA])

export const validateCargo = ({ cargo }: ICreateOrUpdateTrade): FormikErrors<any> => {
  let errors: any = {}
  if (!validator.validate(getCargoSchemaId(CARGO_SCHEMA_VERSION.V2), cargo)) {
    const formikErrors = toFormikErrors(validator.errors, 'cargo.')
    Object.keys(formikErrors)
      .filter(err => !err.includes('parcel') && err !== 'cargo.sourceId')
      .forEach(err => {
        errors = { ...errors, [err]: formikErrors[err] }
      })
  }

  cargo.parcels.forEach(parcel => {
    const parcelErrors = validateParcel(parcel)
    if (Object.keys(parcelErrors).length > 0) {
      errors = { ...errors, 'cargo.parcels': 'Parcels validation error, see below.' }
    }
  })

  if (!cargo.cargoId) {
    errors = {
      ...errors,
      'cargo.cargoId': "'cargoId' should not be empty"
    }
  }

  return errors
}

const normalize = (value: any) => (value == null || value === '' ? undefined : value)

const readonlyErrors = <T>(initial: T, edited: T, allowedFields: Array<keyof T>) => {
  const notEditable = (field: string) => !allowedFields.includes(field as keyof T)
  const changed = field => !_.isEqual(normalize(initial[field]), normalize(edited[field]))
  return Object.keys(edited)
    .filter(notEditable)
    .filter(changed)
    .reduce((fields, field) => ({ ...fields, [field]: `"${field}" cannot be edited` }), {})
}

export const unchangedError = <T>(initial: T, edited: T) =>
  _.isEqual(normalize(initial), normalize(edited)) ? { all: 'You have not made any changes' } : {}

export const createEditTradeValidator = (initialValues: ICreateOrUpdateTrade) => (
  editedValues: ICreateOrUpdateTrade
) => ({
  ...unchangedError(initialValues, editedValues),
  ...readonlyErrors(initialValues.trade, editedValues.trade, EDITABLE_TRADE_FIELDS_AFTER_QUOTE_ACCEPTED),
  ...readonlyErrors(
    normalizeCargoEditValues(initialValues.cargo),
    normalizeCargoEditValues(editedValues.cargo),
    EDITABLE_CARGO_FIELDS_AFTER_QUOTE_ACCEPTED
  ),
  ...validate(initialValues)
})

export const validate = (values: ICreateOrUpdateTrade) => {
  let errors = {}
  const tradeDataToValidate = {
    ...replaceEmptyStringsAndNullWithUndefined({ ...values.trade }),
    creditRequirement: values.trade.creditRequirement
  }

  if (
    !validator.validate(getTradeSchemaId(TRADE_SCHEMA_VERSION.V2), {
      ...tradeDataToValidate,
      paymentTermsOptionProvided: !!tradeDataToValidate.PaymentTermsOption
    })
  ) {
    const formikErrors = toFormikErrors(validator.errors, 'trade.')
    errors = { ...formikErrors }
  }
  if (
    tradeDataToValidate.deliveryPeriod &&
    !validateDateRange(tradeDataToValidate.deliveryPeriod.startDate, tradeDataToValidate.deliveryPeriod.endDate)
  ) {
    errors = {
      ...errors,
      'trade.deliveryPeriod.startDate': `'deliveryPeriod.startDate' should be before ${
        tradeDataToValidate.deliveryPeriod.endDate
      }`,
      'trade.deliveryPeriod.endDate': `'deliveryPeriod.endDate' should be after ${
        tradeDataToValidate.deliveryPeriod.startDate
      }`
    }
  }
  if (
    _.isNumber(tradeDataToValidate.minTolerance) &&
    _.isNumber(tradeDataToValidate.maxTolerance) &&
    tradeDataToValidate.minTolerance > tradeDataToValidate.maxTolerance
  ) {
    errors = {
      ...errors,
      'trade.minTolerance': "'minTolerance' should be less than or equal to 'Max tolerance'.",
      'trade.maxTolerance': "'maxTolerance' should be greater than or equal to 'Min tolerance'."
    }
  }

  if (shouldValidateCargo(values)) {
    const cargoErrors = validateCargo(replaceEmptyStringsAndNullWithUndefined({ cargo: { ...values.cargo } }))

    if (Object.keys(cargoErrors).length > 0) {
      errors = { ...errors, ...cargoErrors }
    }
  }

  return { ...errors, ...validateOtherFields(values) }
}

const validateOtherFields = (values: ICreateOrUpdateTrade) => {
  let errors = {}
  if (values.trade.law === Law.Other && values.lawOther.length === 0) {
    errors = {
      ...errors,
      lawOther: `'Law' should be specified if you have selected ${Law.Other}`
    }
  }
  if (values.trade.commodity === Commodity.Other && values.commodityOther.length === 0) {
    errors = {
      ...errors,
      commodityOther: `'Commodity type' should be specified if you have selected ${Commodity.Other}`
    }
  }
  if (values.trade.deliveryTerms === DeliveryTerms.Other && values.deliveryTermsOther.length === 0) {
    errors = {
      ...errors,
      deliveryTermsOther: `'Delivery terms' should be specified if you have selected ${DeliveryTerms.Other}`
    }
  }
  if (
    values.trade.paymentTerms &&
    values.trade.paymentTerms.eventBase === PaymentTermsEventBase.Other &&
    values.eventBaseOther.length === 0
  ) {
    errors = {
      ...errors,
      eventBaseOther: `'Payment terms' should be specified if you have selected ${PaymentTermsEventBase.Other}`
    }
  }
  return errors
}

export const validateParcel = (values: IParcelWithOverrides) => {
  let errors = {}
  if (!validator.validate(getParcelSchemaId(PARCEL_SCHEMA_VERSION.V2), values)) {
    errors = { ...toFormikErrors(validator.errors) }
  }
  if (!validateDateRange(values.laycanPeriod.startDate, values.laycanPeriod.endDate)) {
    errors = {
      ...errors,
      'laycanPeriod.startDate': `'laycanPeriod.startDate' should be before ${values.laycanPeriod.endDate}`,
      'laycanPeriod.endDate': `'laycanPeriod.endDate' should be after ${values.laycanPeriod.startDate}`
    }
  }
  if (values.modeOfTransport === ModeOfTransport.Other && values.modeOfTransportOther.length === 0) {
    errors = {
      ...errors,
      modeOfTransportOther: `'Mode of transport' should be specified if you have selected ${ModeOfTransport.Other}`
    }
  }

  return errors
}

function normalizeCargoEditValues(cargo: ICargo) {
  if (cargo._id) {
    return cargo
  }

  // cargoId is set automatically
  // if cargo._id is null
  return {
    ...cargo,
    cargoId: null
  }
}

function shouldValidateCargo({ trade, cargo }: ICreateOrUpdateTrade) {
  // Check for the cargo rules before validating cargo
  // If anything entered, validation for cargo should be triggered
  // If BUYER trade, cargo is required. so we validate cargo (check by validating against OPEN_CREDIT credit requirement)
  return isCargoDataEntered(cargo) || (!trade.tradingRole || trade.tradingRole !== TradingRole.SELLER)
}
