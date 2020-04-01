import {
  ModeOfTransport,
  IParcel,
  Law,
  Commodity,
  PaymentTermsEventBase,
  DeliveryTerms,
  PriceOption,
  PaymentTermsOption,
  TRADE_SCHEMA_VERSION,
  CARGO_SCHEMA_VERSION
} from '@komgo/types'
import { IParcelWithOverrides } from '../components/cargo-form-fields/ParcelData'
import { ICreateOrUpdateTrade } from '../store/types'
import { TRADING_ROLE_OPTIONS } from '../constants'
import { replaceEmptyStringsAndNullWithUndefined } from './formatters'

export const sanitiseParcelValues = (values: IParcelWithOverrides): IParcel => {
  const sanitisedValues = { ...values }

  switch (values.modeOfTransport) {
    case ModeOfTransport.Vessel:
      sanitisedValues.tankFarmOperatorName = ''
      sanitisedValues.pipelineName = ''
      sanitisedValues.warehouseOperatorName = ''
      return sanitisedValues

    case ModeOfTransport.Pipeline:
      sanitisedValues.tankFarmOperatorName = ''
      sanitisedValues.warehouseOperatorName = ''
      sanitisedValues.vesselIMO = 0
      sanitisedValues.vesselName = ''
      return sanitisedValues
    case ModeOfTransport.ITT:
      sanitisedValues.warehouseOperatorName = ''
      sanitisedValues.vesselIMO = 0
      sanitisedValues.vesselName = ''
      sanitisedValues.pipelineName = ''
      return sanitisedValues
    case ModeOfTransport.Warehouse:
      sanitisedValues.tankFarmOperatorName = ''
      sanitisedValues.vesselIMO = 0
      sanitisedValues.vesselName = ''
      sanitisedValues.pipelineName = ''
      return sanitisedValues
    case ModeOfTransport.Other:
      sanitisedValues.modeOfTransport = sanitisedValues.modeOfTransportOther || ''
      sanitisedValues.tankFarmOperatorName = ''
      sanitisedValues.vesselIMO = 0
      sanitisedValues.vesselName = ''
      sanitisedValues.pipelineName = ''
      sanitisedValues.warehouseOperatorName = ''
      delete sanitisedValues.modeOfTransportOther
      return sanitisedValues
    default:
      sanitisedValues.tankFarmOperatorName = ''
      sanitisedValues.vesselIMO = 0
      sanitisedValues.vesselName = ''
      sanitisedValues.pipelineName = ''
      sanitisedValues.warehouseOperatorName = ''
      return sanitisedValues
  }
}

const tradeRole = (tradingRole: string, companyStaticId: string) => {
  return tradingRole === TRADING_ROLE_OPTIONS.BUYER ? { buyer: companyStaticId } : { seller: companyStaticId }
}

export const sanitiseCreateOrUpdateTrade = (
  values: ICreateOrUpdateTrade,
  tradingRole: string,
  companyStaticId: string
): ICreateOrUpdateTrade => {
  const setCompanyStaticIdBasedOnTradingRole = tradeRole(tradingRole, companyStaticId)
  const law = values.trade.law === Law.Other ? values.lawOther : values.trade.law
  const commodity = values.trade.commodity === Commodity.Other ? values.commodityOther : values.trade.commodity
  const deliveryTerms =
    values.trade.deliveryTerms === DeliveryTerms.Other ? values.deliveryTermsOther : values.trade.deliveryTerms
  const priceFormula = values.trade.priceOption === PriceOption.Floating ? values.trade.priceFormula : undefined
  const requiredDocuments = values.trade.requiredDocuments || []

  let paymentTerms

  if (values.trade.paymentTermsOption !== PaymentTermsOption.Deferred) {
    values.trade.paymentTerms = undefined
  }

  if (values.trade.paymentTerms) {
    const eventBase =
      values.trade.paymentTerms.eventBase === PaymentTermsEventBase.Other
        ? values.eventBaseOther
        : values.trade.paymentTerms.eventBase
    paymentTerms =
      values.trade.paymentTermsOption === PaymentTermsOption.Deferred
        ? { ...values.trade.paymentTerms, eventBase }
        : undefined
  }

  return {
    ...values,
    trade: {
      ...replaceEmptyStringsAndNullWithUndefined({
        ...values.trade,
        ...setCompanyStaticIdBasedOnTradingRole,
        law,
        commodity,
        paymentTerms,
        deliveryTerms,
        priceFormula,
        version: TRADE_SCHEMA_VERSION.V2
      }),
      requiredDocuments
    },
    cargo: replaceEmptyStringsAndNullWithUndefined({
      ...values.cargo,
      parcels: values.cargo.parcels.map(sanitiseParcelValues),
      version: CARGO_SCHEMA_VERSION.V2
    })
  }
}
