import { removeEmptyEntries, sanitizeReceivableDiscontingForSubmit, sanitizeQuoteForSubmit } from './sanitize'
import {
  IReceivablesDiscountingBase,
  InvoiceType,
  RequestType,
  Currency,
  DiscountingType,
  FinancialInstrument,
  SupportingInstrument
} from '@komgo/types'

describe('removeEmptyEntries', () => {
  it('should remove undefined null or empty strings', () => {
    const obj = {
      a: undefined,
      b: 'some value',
      c: null,
      d: ''
    }
    expect(removeEmptyEntries(obj)).toEqual({
      b: 'some value'
    })
  })
})

describe('sanitizeReceivableDiscontingForSubmit()', () => {
  const obj: IReceivablesDiscountingBase = {
    advancedRate: 21,
    invoiceAmount: 43234,
    invoiceType: InvoiceType.Indicative,
    tradeReference: {
      sourceId: '9b19b326-b6c6-4660-bdf6-e69977e9a69e',
      source: 'KOMGO',
      sellerEtrmId: 'MM-RD-2'
    },
    requestType: RequestType.Discount,
    numberOfDaysDiscounting: 22,
    dateOfPerformance: '2019-01-02',
    discountingDate: '2019-01-02',
    currency: Currency.USD,
    supportingInstruments: [],
    discountingType: DiscountingType.WithoutRecourse,
    comment: 'A comment',
    version: 2,
    financialInstrumentInfo: {
      financialInstrument: '' as FinancialInstrument,
      financialInstrumentIssuerName: '',
      financialInstrumentIfOther: ''
    },
    guarantor: 'A guarantor'
  }

  it('should clean up data, remove FinancialInstrumentInfo and Guarantor when no supporting Instruments', () => {
    expect(sanitizeReceivableDiscontingForSubmit(obj)).toEqual({
      advancedRate: 21,
      comment: 'A comment',
      currency: 'USD',
      dateOfPerformance: '2019-01-02',
      discountingDate: '2019-01-02',
      discountingType: 'WITHOUT_RECOURSE',
      invoiceAmount: 43234,
      invoiceType: 'INDICATIVE',
      numberOfDaysDiscounting: 22,
      requestType: 'DISCOUNT',
      supportingInstruments: [],
      tradeReference: {
        sellerEtrmId: 'MM-RD-2',
        source: 'KOMGO',
        sourceId: '9b19b326-b6c6-4660-bdf6-e69977e9a69e'
      },
      version: 2
    })
  })

  it('should NOT remove FinancialInstrumentInfo and Guarantor when supporting Instruments defined', () => {
    obj.financialInstrumentInfo = {
      financialInstrument: FinancialInstrument.Other,
      financialInstrumentIssuerName: 'Issuer',
      financialInstrumentIfOther: 'Another Instrument'
    }
    obj.supportingInstruments = [SupportingInstrument.FinancialInstrument, SupportingInstrument.ParentCompanyGuarantee]

    expect(sanitizeReceivableDiscontingForSubmit(obj)).toEqual({
      advancedRate: 21,
      comment: 'A comment',
      currency: 'USD',
      dateOfPerformance: '2019-01-02',
      discountingDate: '2019-01-02',
      discountingType: 'WITHOUT_RECOURSE',
      invoiceAmount: 43234,
      invoiceType: 'INDICATIVE',
      numberOfDaysDiscounting: 22,
      requestType: 'DISCOUNT',
      supportingInstruments: ['FINANCIAL_INSTRUMENT', 'PARENT_COMPANY_GUARANTEE'],
      financialInstrumentInfo: {
        financialInstrument: FinancialInstrument.Other,
        financialInstrumentIssuerName: 'Issuer',
        financialInstrumentIfOther: 'Another Instrument'
      },
      guarantor: 'A guarantor',
      tradeReference: {
        sellerEtrmId: 'MM-RD-2',
        source: 'KOMGO',
        sourceId: '9b19b326-b6c6-4660-bdf6-e69977e9a69e'
      },
      version: 2
    })
  })
})
