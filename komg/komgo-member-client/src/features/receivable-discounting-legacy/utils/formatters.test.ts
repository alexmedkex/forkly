import { formatRdForInputs, formatInputDate, receivablesDiscountingBaseDiff, formatMonetaryAmount } from './formatters'
import { IReceivablesDiscounting, InvoiceType, Currency, RequestType, DiscountingType } from '@komgo/types'

// Generated like this because the one that comes from the server is different
// to the one that comes from buiidFakeRD(), the main issue is the dates are in the wrong format, which was why
// I created the formatRdForInputs() method in the first place.
const rd: IReceivablesDiscounting = {
  version: 2,
  requestType: RequestType.Discount,
  discountingType: DiscountingType.WithoutRecourse,
  advancedRate: 78,
  invoiceAmount: 7777,
  invoiceType: InvoiceType.Provisional,
  tradeReference: {
    sourceId: '4b814a6d-6a49-49b1-84c1-d36550ca9431',
    sellerEtrmId: '1234',
    source: 'KOMGO'
  },
  staticId: 'f7103c55-11b3-4568-8075-716f9e044413',
  numberOfDaysDiscounting: 99,
  dateOfPerformance: '2088-08-08T00:00:00.000Z',
  updatedAt: '2019-07-23T09:45:29.578Z',
  discountingDate: '2077-07-07T00:00:00.000Z',
  currency: Currency.CHF,
  supportingInstruments: [],
  createdAt: '2019-07-23T09:45:29.578Z'
}

describe('formatRdForInputs()', () => {
  it('should return correct formatting for input fields', () => {
    const expected = {
      version: 2,
      requestType: RequestType.Discount,
      discountingType: DiscountingType.WithoutRecourse,
      advancedRate: 78,
      invoiceAmount: 7777,
      invoiceType: 'PROVISIONAL',
      tradeReference: {
        sourceId: '4b814a6d-6a49-49b1-84c1-d36550ca9431',
        sellerEtrmId: '1234',
        source: 'KOMGO'
      },
      staticId: 'f7103c55-11b3-4568-8075-716f9e044413',
      numberOfDaysDiscounting: 99,
      dateOfPerformance: '2088-08-08',
      updatedAt: '2019-07-23T09:45:29.578Z',
      discountingDate: '2077-07-07',
      currency: 'CHF',
      createdAt: '2019-07-23T09:45:29.578Z',
      supportingInstruments: []
    }

    expect(formatRdForInputs(rd)).toEqual(expected)
  })
})

describe('formatInputDate()', () => {
  it('should return correct formatting for the input field', () => {
    const date = '2019-07-23T09:45:29.578Z'
    const expected = '2019-07-23'

    expect(formatInputDate(date)).toEqual(expected)
  })
})

describe('formatMonetaryAmount()', () => {
  it('should return correct formatting for the input field', () => {
    const amount = 3400020
    const currency = Currency.CHF

    expect(formatMonetaryAmount(amount, currency)).toEqual('CHF 3,400,020.00')
  })
})

describe('receivablesDiscountingBaseDiff()', () => {
  it('should flag any differences between two RDs', () => {
    const rdEdited = { ...rd, advancedRate: 12, invoiceAmount: 764499 }

    const expected = [
      { oldValue: 7777, op: 'replace', path: '/invoiceAmount', type: 'IReceivablesDiscountingBase', value: 764499 },
      { oldValue: 78, op: 'replace', path: '/advancedRate', type: 'IReceivablesDiscountingBase', value: 12 }
    ]

    expect(receivablesDiscountingBaseDiff(rd, rdEdited)).toEqual(expected)
  })
})
