import { ITradeDocument } from './store/types'
import {
  TradeSource,
  PriceUnit,
  PaymentTermsTimeUnit,
  PaymentTermsDayType,
  PaymentTermsWhen,
  PaymentTermsEventBase,
  Currency,
  ICargoBase,
  ITradeBase,
  CreditRequirements,
  CARGO_SCHEMA_VERSION,
  PARCEL_SCHEMA_VERSION,
  TRADE_SCHEMA_VERSION
} from '@komgo/types'
import { IParcelWithOverrides } from './components/cargo-form-fields/ParcelData'
import { v4 } from 'uuid'

export const NOTENOUGHINFO = 'Not enough information provided.'
export const UNRECOGNISED_STATUS = 'Status unrecognized'

export const LOC_STATUS = {
  TO_BE_FINANCED: 'TO_BE_FINANCED',
  SUBMITTED: 'SUBMITTED',
  RECEIVED: 'RECEIVED',
  ADVISED: 'ADVISED',
  AMENDMENT_REQUESTED: 'AMENDMENT_REQUESTED',
  AMENDMENT_UNDER_NEGOTIATION: 'AMENDMENT_UNDER_NEGOTIATION',
  AMENDMENT_ACCEPTED: 'AMENDMENT_ACCEPTED',
  PAID: 'PAID',
  REFUSED: 'REFUSED',
  EXPIRED: 'EXPIRED'
}

export enum LOC_CATEGORIES {
  TO_BE_FINANCED = 'TO_BE_FINANCED',
  IN_PROGRESS = 'IN_PROGRESS',
  ISSUED = 'ISSUED',
  CLOSED = 'CLOSED'
}

export enum TRADE_STATUS {
  ToBeFinanced = 'TO_BE_FINANCED',
  ToBeDiscounted = 'TO_BE_DISCOUNTED'
}

export const LOC_CATEGORY_COLOURS = {
  [LOC_CATEGORIES.TO_BE_FINANCED]: 'red',
  [LOC_CATEGORIES.IN_PROGRESS]: 'yellow',
  [LOC_CATEGORIES.ISSUED]: 'green'
}

export const READABLE_LOC_STATUS = {
  [LOC_CATEGORIES.TO_BE_FINANCED]: [LOC_STATUS.TO_BE_FINANCED],
  [LOC_CATEGORIES.IN_PROGRESS]: [LOC_STATUS.SUBMITTED],
  [LOC_CATEGORIES.ISSUED]: [
    LOC_STATUS.RECEIVED,
    LOC_STATUS.ADVISED,
    LOC_STATUS.AMENDMENT_ACCEPTED,
    LOC_STATUS.AMENDMENT_UNDER_NEGOTIATION,
    LOC_STATUS.AMENDMENT_ACCEPTED
  ],
  [LOC_CATEGORIES.CLOSED]: [LOC_STATUS.PAID, LOC_STATUS.REFUSED, LOC_STATUS.EXPIRED]
}

export const DESC = -1
export const ASC = 1
export const DESC_TEXT = 'descending'
export const ASC_TEXT = 'ascending'

export enum TradingRole {
  SELLER = 'seller',
  BUYER = 'buyer'
}

export const TRADING_ROLE_OPTIONS = {
  BUYER: TradingRole.BUYER.toUpperCase(),
  SELLER: TradingRole.SELLER.toUpperCase()
}

export const CREDIT_REQUIREMENT_LABEL = {
  DOCUMENTARY_LETTER_OF_CREDIT: 'Documentary LC',
  STANDBY_LETTER_OF_CREDIT: 'Standby LC',
  OPEN_CREDIT: 'Open Credit',
  OFFSET: 'Offset'
}

export const CREDIT_REQUIREMENT_DISPLAY_VALUES = {
  [CreditRequirements.DocumentaryLetterOfCredit]: [CREDIT_REQUIREMENT_LABEL.DOCUMENTARY_LETTER_OF_CREDIT],
  [CreditRequirements.StandbyLetterOfCredit]: [CREDIT_REQUIREMENT_LABEL.STANDBY_LETTER_OF_CREDIT],
  [CreditRequirements.OpenCredit]: [CREDIT_REQUIREMENT_LABEL.OPEN_CREDIT],
  [CreditRequirements.Offset]: [CREDIT_REQUIREMENT_LABEL.OFFSET]
}

export const tradeDefaultEmptyValues: Partial<ITradeBase> = {
  buyerEtrmId: '',
  sellerEtrmId: '',
  dealDate: '',
  seller: '',
  buyer: '',
  commodity: '',
  generalTermsAndConditions: '',
  deliveryPeriod: { startDate: '', endDate: '' },
  demurrageTerms: '',
  laytime: '',
  law: '',
  creditRequirement: '' as any,
  contractReference: '',
  priceFormula: ''
}

export const initialTradeData: ITradeBase = {
  version: TRADE_SCHEMA_VERSION.V2,
  ...(tradeDefaultEmptyValues as ITradeBase),
  source: TradeSource.Komgo,
  dealDate: '',
  priceOption: undefined,
  price: undefined,
  currency: Currency.USD,
  priceUnit: PriceUnit.BBL,
  quantity: undefined,
  minTolerance: undefined,
  maxTolerance: undefined,
  invoiceQuantity: undefined,
  paymentTermsOption: undefined,
  paymentTerms: undefined,
  deliveryTerms: undefined,
  deliveryLocation: undefined,
  requiredDocuments: []
}

export const initialCargoData: ICargoBase = {
  source: TradeSource.Komgo,
  grade: '',
  cargoId: '',
  parcels: [],
  sourceId: '',
  originOfGoods: '',
  quality: '',
  version: CARGO_SCHEMA_VERSION.V2
}

export const generateInitialParcelData = (): IParcelWithOverrides => {
  const uniqueKey = v4()

  // As we have all parcels stored in a list in formik, when a new parcel is created
  // we need a unique key to track which item in the list is being edited
  return { ...initialParcelData, uniqueKey }
}

export const initialParcelData: IParcelWithOverrides = {
  id: '',
  laycanPeriod: {
    startDate: '',
    endDate: ''
  },
  modeOfTransport: '',
  modeOfTransportOther: '',
  vesselIMO: 0,
  vesselName: '',
  loadingPort: '',
  dischargeArea: '',
  inspector: '',
  deemedBLDate: '',
  quantity: undefined,
  warehouseOperatorName: '',
  pipelineName: '',
  tankFarmOperatorName: '',
  destinationPlace: '',
  loadingPlace: '',
  version: PARCEL_SCHEMA_VERSION.V2
}

export const initialDocumentData: ITradeDocument = {
  name: '',
  typeId: '',
  file: null,
  fileName: '',
  fileType: ''
}

export const TRADE_EDITED_MESSAGE = 'Trade edited'
export const TRADE_CREATED_MESSAGE = 'New trade created'
export const TRADE_AND_CARGO_EDITED_MESSAGE = 'Trade and cargo edited'
export const TRADE_DELETED_MESSAGE = 'Trade deleted'

export const emptyDropdownItem = { text: '(none)', content: '(none)' }
