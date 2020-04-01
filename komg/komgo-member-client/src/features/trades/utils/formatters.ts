import { displayDate, dateFormats } from '../../../utils/date'
import { ITradeEnriched, ICreateOrUpdateTrade, ITradeDocument } from '../store/types'
import {
  initialCargoData,
  initialTradeData,
  initialParcelData,
  TRADING_ROLE_OPTIONS,
  tradeDefaultEmptyValues
} from '../constants'
import {
  Law,
  ICargo,
  ICargoBase,
  IParcel,
  ITrade,
  Commodity,
  PaymentTermsEventBase,
  DeliveryTerms,
  PriceOption,
  PaymentTermsOption,
  ModeOfTransport,
  TRADE_SCHEMA_VERSION,
  CARGO_SCHEMA_VERSION,
  PARCEL_SCHEMA_VERSION,
  CreditRequirements,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  PaymentTermsWhen
} from '@komgo/types'
import { Document } from '../../document-management'
import { PERMITTED_MIME_TYPES } from '../../document-management/utils/permittedMimeTypes'
import { IParcelWithOverrides } from '../components/cargo-form-fields/ParcelData'
import { v4 } from 'uuid'
import _ from 'lodash'

// Format for dates are different on api and on form
export const formatEditTrade = (
  trade: ITradeEnriched,
  cargos: ICargo[],
  documents: Document[]
): ICreateOrUpdateTrade => {
  const cargo = cargos[0] ? formatCargoDates(cargos[0]) : ({ ...initialCargoData, cargoId: v4() } as ICargo)
  const formattedTrade = formatTradeDate(trade)

  const { lawOther, commodityOther, eventBaseOther, deliveryTermsOther } = getOtherFields(formattedTrade)

  const { paymentTerms, paymentTermsOption } = getPaymentTermsFields(formattedTrade, eventBaseOther)

  let tradeData: ITradeEnriched = {
    ...initialTradeData,
    ...formattedTrade,
    status: trade.status,
    law: lawOther ? Law.Other : trade.law,
    commodity: commodityOther ? Commodity.Other : trade.commodity,
    paymentTerms,
    deliveryTerms: deliveryTermsOther ? DeliveryTerms.Other : trade.deliveryTerms,
    paymentTermsOption,
    priceFormula: trade.priceFormula ? trade.priceFormula : '',
    version: trade.version ? trade.version : TRADE_SCHEMA_VERSION.V2
  }

  const requiredDocuments = tradeData.requiredDocuments || []

  tradeData = _.merge({}, tradeDefaultEmptyValues, removeUndefinedOrNull(tradeData))

  return {
    trade: {
      ...tradeData,
      requiredDocuments
    },
    cargo: {
      ...initialCargoData,
      ...cargo,
      parcels: cargo.parcels.map(formatParcelForEdit),
      version: cargo.version ? cargo.version : CARGO_SCHEMA_VERSION.V2
    },
    lawOther,
    commodityOther,
    eventBaseOther,
    deliveryTermsOther,
    documents: formatDocuments(documents)
  }
}

const getPaymentTermsFields = (trade: ITradeEnriched, eventBaseOther?: string) => {
  const paymentTermsOption = trade.paymentTermsOption ? trade.paymentTermsOption : null

  const paymentTerms =
    paymentTermsOption === PaymentTermsOption.Deferred
      ? {
          ...trade.paymentTerms,
          eventBase: eventBaseOther ? PaymentTermsEventBase.Other : trade.paymentTerms.eventBase
        }
      : initialTradeData.paymentTerms

  return { paymentTermsOption, paymentTerms }
}

const getOtherFields = (trade: ITradeEnriched) => {
  const lawOther = !Object.values(Law).includes(trade.law) && !!trade.law ? trade.law : ''
  const commodityOther = !Object.values(Commodity).includes(trade.commodity) && !!trade.commodity ? trade.commodity : ''
  const eventBaseOther =
    trade.paymentTerms &&
    !Object.values(PaymentTermsEventBase).includes(trade.paymentTerms.eventBase) &&
    !!trade.paymentTerms.eventBase
      ? trade.paymentTerms.eventBase
      : ''
  const deliveryTermsOther =
    !Object.values(DeliveryTerms).includes(trade.deliveryTerms) && !!trade.deliveryTerms ? trade.deliveryTerms : ''

  return {
    lawOther,
    commodityOther,
    deliveryTermsOther,
    eventBaseOther
  }
}

export const formatParcelForEdit = (parcel: IParcel): IParcelWithOverrides => {
  const modeOfTransportOther =
    !Object.values(ModeOfTransport).includes(parcel.modeOfTransport) && !!parcel.modeOfTransport
      ? parcel.modeOfTransport
      : ''

  return {
    ...initialParcelData,
    ...parcel,
    modeOfTransport: modeOfTransportOther ? ModeOfTransport.Other : parcel.modeOfTransport,
    modeOfTransportOther,
    version: parcel.version ? parcel.version : PARCEL_SCHEMA_VERSION.V2
  }
}

export const formatCargoData = (cargo: ICargo, sourceId: string): ICargoBase => ({
  ...cargo,
  sourceId
})

export const formatCargoDates = (cargo: ICargo): ICargo => ({
  ...cargo,
  parcels: cargo.parcels.map(parcel => ({
    ...parcel,
    laycanPeriod: {
      startDate: displayDate(parcel.laycanPeriod.startDate, dateFormats.inputs),
      endDate: displayDate(parcel.laycanPeriod.endDate, dateFormats.inputs)
    },
    deemedBLDate: displayDate(parcel.deemedBLDate, dateFormats.inputs)
  }))
})

export const formatTradeDate = (trade: ITradeEnriched): ITradeEnriched => ({
  ...(trade as ITrade),
  deliveryPeriod: {
    startDate: trade.deliveryPeriod ? displayDate(trade.deliveryPeriod.startDate, dateFormats.inputs) : '',
    endDate: trade.deliveryPeriod ? displayDate(trade.deliveryPeriod.endDate, dateFormats.inputs) : ''
  },
  dealDate: displayDate(trade.dealDate, dateFormats.inputs),
  contractDate: displayDate(trade.contractDate, dateFormats.inputs)
})

export const findMimeType = (documentName: string): string => {
  const extension = documentName.substr(documentName.lastIndexOf('.') + 1)
  const [type] = Object.values(PERMITTED_MIME_TYPES).filter(t => t.includes(extension))
  return type || ''
}

export const formatDocuments = (documents: Document[]): ITradeDocument[] =>
  documents.map(document => ({
    id: document.id,
    name: document.name.substr(0, document.name.lastIndexOf('.')),
    categoryId: document.category.id,
    typeId: document.type.id,
    fileName: document.name,
    fileType: findMimeType(document.name),
    file: null
  }))

export const generateInitialFormData = (
  trade: ITradeEnriched,
  tradeMovements: ICargo[],
  documents: Document[],
  tradingRole: string,
  company: string
): ICreateOrUpdateTrade => {
  if (!tradingRole) {
    return null
  }

  const setCompanyNameBasedOnTradingRole =
    tradingRole === TRADING_ROLE_OPTIONS.BUYER ? { buyer: company } : { seller: company }

  if (trade) {
    const editTrade = formatEditTrade(trade, tradeMovements, documents)

    return {
      ...editTrade,
      trade: {
        ...editTrade.trade,
        ...setCompanyNameBasedOnTradingRole
      }
    }
  }

  return {
    documents: [],
    lawOther: '',
    commodityOther: '',
    eventBaseOther: '',
    deliveryTermsOther: '',
    trade: {
      ...initialTradeData,
      dealDate: displayDate(new Date(), dateFormats.inputs),
      ...setCompanyNameBasedOnTradingRole,
      creditRequirement:
        tradingRole === TRADING_ROLE_OPTIONS.BUYER
          ? CreditRequirements.StandbyLetterOfCredit
          : (CreditRequirements.OpenCredit as any)
    } as any,
    cargo: { ...initialCargoData, cargoId: v4() } as any // initialize cargoId in order to provide uniqueness. Temporary solution
  }
}

export const handlePaymentOptionsChange = (value: PaymentTermsOption, trade: ITrade) => {
  trade.paymentTerms =
    value === PaymentTermsOption.Deferred
      ? {
          time: '' as any,
          timeUnit: PaymentTermsTimeUnit.Days,
          dayType: PaymentTermsDayType.Calendar,
          when: PaymentTermsWhen.After,
          eventBase: PaymentTermsEventBase.BL
        }
      : undefined
}

export const replaceEmptyStringsAndNullWithUndefined = (values: any) => {
  const entries = Object.entries(values).map(([key, value]) => [
    value === '' || value === null ? undefined : value,
    key
  ])
  const cleaned = entries.reduce(
    (memo: any, [value, key]: any) => ({
      ...memo,
      [key]: _.isArray(value)
        ? value.map(v => replaceEmptyStringsAndNullWithUndefined(v))
        : _.isObject(value)
          ? replaceEmptyStringsAndNullWithUndefined(value)
          : value
    }),
    {}
  )
  return cleaned
}

export const removeUndefinedOrNull = <T extends object = object>(obj: T): T =>
  Object.keys(obj)
    .filter(key => obj[key] != null)
    .reduce<T>(
      (memo: object, key: string) =>
        ({
          ...memo,
          [key]: _.isArray(obj[key])
            ? obj[key].map(v => removeUndefinedOrNull(v))
            : _.isObject(obj[key])
              ? removeUndefinedOrNull(obj[key])
              : obj[key]
        } as T),
      {} as any
    )
