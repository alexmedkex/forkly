import {
  formatRdHistory,
  formatMergedInvoiceAmount,
  formatAgreedTermsHistory,
  getHistoryEntry,
  formatFinancialInstrument,
  FINANCIAL_INSTRUMENT_INFO,
  shouldShowHistory
} from './historySelectors'
import { fakeRdApplicationHistory, fakeAgreedTermsHistory } from '../utils/faker'
import {
  Currency,
  IHistory,
  buildFakeReceivablesDiscountingExtended,
  IReceivablesDiscounting,
  InvoiceType,
  FinancialInstrument,
  IFinancialInstrumentInfo
} from '@komgo/types'
import { displayQuantity } from '../../trades/utils/displaySelectors'
import { capitalize } from 'lodash'

describe('formatRdHistory', () => {
  it('should correctly format history and turn values to array', () => {
    expect(
      formatRdHistory(
        'invoiceAmount',
        fakeRdApplicationHistory({ historyEntry: { invoiceAmount: [{ value: 1200 }, { value: 1400 }] } }).historyEntry
          .invoiceAmount,
        Currency.USD
      )
    ).toEqual([
      {
        updatedAt: '2019/05/19',
        values: ['1,200 USD']
      },
      {
        updatedAt: '2019/05/20',
        values: ['1,400 USD']
      }
    ])
  })

  it('should correctly format history including the empty tag for any arrays that have no value', () => {
    expect(
      formatRdHistory('supportingInstruments', fakeRdApplicationHistory().historyEntry.supportingInstruments)
    ).toEqual([
      {
        updatedAt: '2019/05/19',
        values: ['Payment confirmation, Parent company guarantee and Promissory note']
      },
      {
        updatedAt: '2019/05/20',
        values: ['(Empty)']
      },
      {
        updatedAt: '2019/05/21',
        values: ['Bill of exchange']
      }
    ])
  })
})

describe('formatAgreedTermsHistory', () => {
  it('should correctly format day history values', () => {
    expect(
      formatAgreedTermsHistory(
        'numberOfDaysDiscounting',
        fakeAgreedTermsHistory({ historyEntry: { numberOfDaysDiscounting: [{ value: 12 }, { value: 30 }] } })
          .historyEntry.numberOfDaysDiscounting
      )
    ).toEqual([
      {
        updatedAt: '2019/05/19',
        values: ['12 days']
      },
      {
        updatedAt: '2019/05/20',
        values: ['30 days']
      }
    ])
  })

  it('should correctly format history and turn values to array', () => {
    expect(
      formatAgreedTermsHistory(
        'advanceRate',
        fakeAgreedTermsHistory({ historyEntry: { advanceRate: [{ value: 1 }, { value: 2 }] } }).historyEntry.advanceRate
      )
    ).toEqual([
      {
        updatedAt: '2019/05/19',
        values: ['1.00%']
      },
      {
        updatedAt: '2019/05/20',
        values: ['2.00%']
      }
    ])
  })

  it('should correctly format history and turn values to array', () => {
    expect(
      formatAgreedTermsHistory(
        'daysUntilMaturity',
        fakeAgreedTermsHistory({ historyEntry: { daysUntilMaturity: [{ value: 30 }, { value: 60 }] } }).historyEntry
          .daysUntilMaturity
      )
    ).toEqual([
      {
        updatedAt: '2019/05/19',
        values: ['1 month']
      },
      {
        updatedAt: '2019/05/20',
        values: ['2 months']
      }
    ])
  })
})

describe('formatMergedInvoiceAmount', () => {
  let fakeHistory: IHistory<IReceivablesDiscounting>
  let fakeRd: IReceivablesDiscounting
  beforeEach(() => {
    fakeHistory = fakeRdApplicationHistory()
    fakeRd = {
      ...buildFakeReceivablesDiscountingExtended(),
      ...{ invoiceAmount: 10000, invoiceType: InvoiceType.Final }
    }
  })
  it('should return an empty array if there is no change to invoice amount or type', () => {
    delete fakeHistory.historyEntry.invoiceAmount
    delete fakeHistory.historyEntry.invoiceType

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([])
  })
  it('should return an empty array if there is an empty array in both', () => {
    fakeHistory.historyEntry.invoiceAmount = []
    fakeHistory.historyEntry.invoiceType = []

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([])
  })
  it('should use only invoice type if there is no invoice amount', () => {
    fakeHistory.historyEntry.invoiceType = [
      { updatedAt: '2019/01/01', value: InvoiceType.Provisional },
      { updatedAt: '2019/01/03', value: InvoiceType.Indicative }
    ]
    fakeHistory.historyEntry.invoiceAmount = []
    fakeRd.invoiceAmount = 100

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([
      {
        updatedAt: '2019/01/03',
        values: ['100 USD', 'Indicative']
      },
      {
        updatedAt: '2019/01/01',
        values: ['100 USD', 'Provisional']
      }
    ])
  })
  it('should use only invoice amount if there is no invoice type', () => {
    fakeHistory.historyEntry.invoiceAmount = [
      { updatedAt: '2019/01/02', value: 200 },
      { updatedAt: '2019/01/04', value: 500 }
    ]
    fakeHistory.historyEntry.invoiceType = []
    fakeRd.invoiceType = InvoiceType.Provisional

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([
      {
        updatedAt: '2019/01/04',
        values: ['500 USD', 'Provisional']
      },
      {
        updatedAt: '2019/01/02',
        values: ['200 USD', 'Provisional']
      }
    ])
  })

  it('should correctly merge invoice amount and invoice type values', () => {
    fakeHistory.historyEntry.invoiceAmount = [
      { updatedAt: '2019-01-02T10:18:24.118Z', value: 1000 },
      { updatedAt: '2019-01-02T14:18:24.118Z', value: 1200 },
      { updatedAt: '2019/01/04', value: 1400 },
      { updatedAt: '2019/01/05', value: 1500 }
    ]
    fakeHistory.historyEntry.invoiceType = [
      { updatedAt: '2019/01/01', value: InvoiceType.Provisional },
      { updatedAt: '2019/01/03', value: InvoiceType.Indicative }
    ]

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([
      {
        updatedAt: '2019/01/05',
        values: ['1,500 USD', 'Indicative']
      },
      {
        updatedAt: '2019/01/04',
        values: ['1,400 USD', 'Indicative']
      },
      {
        updatedAt: '2019/01/03',
        values: ['1,200 USD', 'Indicative']
      },
      {
        updatedAt: '2019/01/02',
        values: ['1,200 USD', 'Provisional']
      },
      {
        updatedAt: '2019/01/02',
        values: ['1,000 USD', 'Provisional']
      },
      {
        updatedAt: '2019/01/01',
        values: ['1,000 USD', 'Provisional']
      }
    ])
  })

  it('should correctly merge invoice amount and invoice type with right order with invalid invoiceType length', () => {
    fakeHistory.historyEntry.invoiceAmount = [
      { updatedAt: '2019-07-17T10:18:24.118Z', value: fakeRd.invoiceAmount },
      { updatedAt: '2019-07-17T10:20:00.454Z', value: 44444 }
    ]
    fakeHistory.historyEntry.invoiceType = [{ updatedAt: '2019-07-17T10:18:24.118Z', value: InvoiceType.Indicative }]

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([
      {
        updatedAt: '2019/07/17',
        values: ['44,444 USD', capitalize(fakeRd.invoiceType)]
      },
      {
        updatedAt: '2019/07/17',
        values: [displayQuantity(fakeRd.invoiceAmount, Currency.USD), capitalize(fakeRd.invoiceType)]
      }
    ])
  })

  it('should correctly merge invoice amount and invoice type with right order with invalid invoiceAmount length', () => {
    fakeHistory.historyEntry.invoiceAmount = [{ updatedAt: '2019-07-17T10:18:24.118Z', value: 2365897 }]
    fakeHistory.historyEntry.invoiceType = [
      { updatedAt: '2019-07-17T10:18:24.118Z', value: fakeRd.invoiceType },
      { updatedAt: '2019-07-17T10:20:19.867Z', value: InvoiceType.Final }
    ]

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([
      {
        updatedAt: '2019/07/17',
        values: [displayQuantity(fakeRd.invoiceAmount, Currency.USD), 'Final']
      },
      {
        updatedAt: '2019/07/17',
        values: [displayQuantity(fakeRd.invoiceAmount, Currency.USD), capitalize(fakeRd.invoiceType)]
      }
    ])
  })

  it('should correctly invoiceType changes in the right order', () => {
    fakeHistory.historyEntry.invoiceAmount = []
    fakeHistory.historyEntry.invoiceType = [
      { updatedAt: '2019-07-18T08:04:21.990Z', value: InvoiceType.Indicative },
      { updatedAt: '2019-07-18T08:51:31.249Z', value: InvoiceType.Provisional }
    ]

    expect(
      formatMergedInvoiceAmount(fakeHistory.historyEntry, { ...fakeRd, invoiceType: InvoiceType.Provisional })
    ).toEqual([
      {
        updatedAt: '2019/07/18',
        values: [displayQuantity(fakeRd.invoiceAmount, Currency.USD), capitalize(InvoiceType.Provisional)]
      },
      {
        updatedAt: '2019/07/18',
        values: [displayQuantity(fakeRd.invoiceAmount, Currency.USD), capitalize(InvoiceType.Indicative)]
      }
    ])
  })

  it('should correctly merge invoice amount and invoice type values, sorting the input and merging both values changed at the same time in 1', () => {
    fakeHistory.historyEntry.invoiceAmount = [
      { updatedAt: '2019-07-17T10:18:24.118Z', value: 33330 },
      { updatedAt: '2019-07-17T10:20:00.454Z', value: 44444 },
      { updatedAt: '2019-07-17T10:20:19.867Z', value: 66666 },
      { updatedAt: '2019-07-17T10:20:10.356Z', value: 55555 }
    ]
    fakeHistory.historyEntry.invoiceType = [
      { updatedAt: '2019-07-17T10:20:19.867Z', value: InvoiceType.Final },
      { updatedAt: '2019-07-17T10:18:24.118Z', value: InvoiceType.Indicative }
    ]

    expect(formatMergedInvoiceAmount(fakeHistory.historyEntry, fakeRd)).toEqual([
      {
        updatedAt: '2019/07/17',
        values: ['66,666 USD', 'Final']
      },
      {
        updatedAt: '2019/07/17',
        values: ['55,555 USD', 'Indicative']
      },
      {
        updatedAt: '2019/07/17',
        values: ['44,444 USD', 'Indicative']
      },
      {
        updatedAt: '2019/07/17',
        values: ['33,330 USD', 'Indicative']
      }
    ])
  })
})

describe('getHistoryEntry', () => {
  it('should get a single history entry', () => {
    const history = fakeRdApplicationHistory({ historyEntry: { invoiceAmount: [{ value: 1200 }, { value: 1400 }] } })
    expect(getHistoryEntry('invoiceAmount', history)).toEqual([
      {
        updatedAt: '2019-05-19T13:00:00Z',
        value: 1200
      },
      {
        updatedAt: '2019-05-20T14:00:00Z',
        value: 1400
      }
    ])
  })

  it('should get a nested history entry', () => {
    const mockFinancialInstrumentIssuerNameChanges = [
      {
        updatedAt: '2019-05-19T13:00:00Z',
        value: 'AA'
      },
      {
        updatedAt: '2019-05-20T14:00:00Z',
        value: 'BB'
      }
    ]
    const history = fakeRdApplicationHistory({
      historyEntry: {
        financialInstrumentInfo: {
          historyEntry: { financialInstrumentIssuerName: mockFinancialInstrumentIssuerNameChanges }
        }
      }
    })
    expect(getHistoryEntry('financialInstrumentInfo.financialInstrumentIssuerName', history)).toEqual(
      mockFinancialInstrumentIssuerNameChanges
    )
  })

  it('should return empty array on history', () => {
    const expectedResult = [
      {
        updatedAt: '2019-08-14T10:52:34.984Z',
        value: ['FINANCIAL_INSTRUMENT', 'PAYMENT_CONFIRMATION']
      },
      {
        updatedAt: '2019-08-14T09:32:44.666Z',
        value: []
      }
    ]
    const history = {
      id: 'd1b8a6bd-c03b-4e3a-984a-a918bc96e2ae',
      historyEntry: {
        supportingInstruments: [
          { updatedAt: '2019-08-14T10:52:34.984Z', value: ['FINANCIAL_INSTRUMENT', 'PAYMENT_CONFIRMATION'] },
          { updatedAt: '2019-08-14T09:32:44.666Z', value: [] }
        ]
      }
    }
    expect(getHistoryEntry('supportingInstruments', history)).toEqual(expectedResult)
  })

  it('should get empty array if there is not history for nested', () => {
    const history = fakeRdApplicationHistory()
    expect(getHistoryEntry('financialInstrumentInfo.financialInstrumentIssuerName', history)).toEqual([])
  })

  it('should get empty array if no part of the history', () => {
    const history = {
      id: 'd1b8a6bd-c03b-4e3a-984a-a918bc96e2ae',
      historyEntry: {
        supportingInstruments: [
          { updatedAt: '2019-08-14T10:52:34.984Z', value: ['FINANCIAL_INSTRUMENT', 'PAYMENT_CONFIRMATION'] },
          { updatedAt: '2019-08-14T09:32:44.666Z', value: [] }
        ]
      }
    }
    expect(getHistoryEntry('requestType', history)).toEqual([])
  })

  it('should get empty array if history is undefined', () => {
    expect(getHistoryEntry('financialInstrumentInfo.financialInstrumentIssuerName', undefined)).toEqual([])
  })

  it('should get empty array if historyEntry is undefined', () => {
    expect(getHistoryEntry('financialInstrumentInfo.financialInstrumentIssuerName', {})).toEqual([])
  })
})

describe('shouldShowHistory', () => {
  it('should return false for nested fiels not in the history', () => {
    const history = {
      id: 'd1b8a6bd-c03b-4e3a-984a-a918bc96e2ae',
      historyEntry: {
        supportingInstruments: [
          { updatedAt: '2019-08-14T10:52:34.984Z', value: ['FINANCIAL_INSTRUMENT', 'PAYMENT_CONFIRMATION'] },
          { updatedAt: '2019-08-14T09:32:44.666Z', value: [] }
        ]
      }
    }
    expect(
      shouldShowHistory('financialInstrumentInfo.financialInstrumentIssuerName', history as IHistory<
        IReceivablesDiscounting
      >)
    ).toBeFalsy()
  })

  it('should return true if it has history', () => {
    const history = {
      id: 'd1b8a6bd-c03b-4e3a-984a-a918bc96e2ae',
      historyEntry: {
        supportingInstruments: [
          { updatedAt: '2019-08-14T10:52:34.984Z', value: ['FINANCIAL_INSTRUMENT', 'PAYMENT_CONFIRMATION'] },
          { updatedAt: '2019-08-14T09:32:44.666Z', value: [] }
        ]
      }
    }
    expect(shouldShowHistory('supportingInstruments', history as IHistory<IReceivablesDiscounting>)).toBeTruthy()
  })

  it('should return false if history of field undefined', () => {
    const history = {
      id: 'd1b8a6bd-c03b-4e3a-984a-a918bc96e2ae',
      historyEntry: undefined
    }
    expect(shouldShowHistory('supportingInstruments', history as IHistory<IReceivablesDiscounting>)).toBeFalsy()
  })

  it('should return false if history undefined', () => {
    expect(shouldShowHistory('supportingInstruments', undefined)).toBeFalsy()
  })

  it('should return false if history empty', () => {
    expect(shouldShowHistory('supportingInstruments', {})).toBeFalsy()
  })

  it('should return false if no part of the history', () => {
    const history = {
      id: 'd1b8a6bd-c03b-4e3a-984a-a918bc96e2ae',
      historyEntry: {
        supportingInstruments: [
          { updatedAt: '2019-08-14T10:52:34.984Z', value: ['FINANCIAL_INSTRUMENT', 'PAYMENT_CONFIRMATION'] },
          { updatedAt: '2019-08-14T09:32:44.666Z', value: [] }
        ]
      }
    }
    expect(shouldShowHistory('requestType', history as IHistory<IReceivablesDiscounting>)).toBeFalsy()
  })
})

describe('formatFinancialInstrument', () => {
  it('should return empty if there is no history', () => {
    const history = fakeRdApplicationHistory()
    expect(formatFinancialInstrument(history.historyEntry[FINANCIAL_INSTRUMENT_INFO])).toEqual([])
  })

  it('should return normal history if there is no `Other` value', () => {
    const mockFinancialInstrumentChanges = [
      {
        updatedAt: '2019-05-19T13:00:00Z',
        value: FinancialInstrument.LC
      },
      {
        updatedAt: '2019-05-20T14:00:00Z',
        value: FinancialInstrument.SBLC
      }
    ]
    const history = fakeRdApplicationHistory({
      historyEntry: {
        financialInstrumentInfo: {
          historyEntry: { financialInstrument: mockFinancialInstrumentChanges }
        }
      }
    })
    expect(formatFinancialInstrument(history.historyEntry[FINANCIAL_INSTRUMENT_INFO])).toEqual([
      {
        updatedAt: '2019/05/20',
        values: ['Standby letter of credit']
      },
      {
        updatedAt: '2019/05/19',
        values: ['Letter of credit']
      }
    ])
  })

  it('should return normal history if there is no `Other` value', () => {
    const financialInstrumentInfoHistory: IHistory<IFinancialInstrumentInfo> = {
      historyEntry: {
        financialInstrument: [
          {
            updatedAt: '2019-08-09T13:15:33.368Z',
            value: FinancialInstrument.SBLC
          },
          {
            updatedAt: '2019-08-08T13:15:26.397Z',
            value: FinancialInstrument.LC
          },
          {
            updatedAt: '2019-08-06T12:48:56.812Z',
            value: FinancialInstrument.Other
          }
        ],
        financialInstrumentIfOther: [
          {
            updatedAt: '2019-08-07T12:49:42.319Z',
            value: 'BBB'
          },
          {
            updatedAt: '2019-08-06T12:48:56.812Z',
            value: 'AAA'
          }
        ]
      }
    }

    expect(formatFinancialInstrument(financialInstrumentInfoHistory)).toEqual([
      {
        updatedAt: '2019/08/09',
        values: ['Standby letter of credit']
      },
      {
        updatedAt: '2019/08/08',
        values: ['Letter of credit']
      },
      {
        updatedAt: '2019/08/07',
        values: ['BBB']
      },
      {
        updatedAt: '2019/08/06',
        values: ['AAA']
      }
    ])
  })

  it('should return normal history if there is only `Other` value', () => {
    const mockFinancialInstrumentChanges = [
      {
        updatedAt: '2019-08-08T12:49:42.319Z',
        value: 'AAA'
      },
      {
        updatedAt: '2019-08-09T12:48:56.812Z',
        value: 'BBB'
      }
    ]
    const history = fakeRdApplicationHistory({
      historyEntry: {
        financialInstrumentInfo: {
          historyEntry: { financialInstrumentIfOther: mockFinancialInstrumentChanges }
        }
      }
    })

    expect(formatFinancialInstrument(history.historyEntry[FINANCIAL_INSTRUMENT_INFO])).toEqual([
      {
        updatedAt: '2019/08/09',
        values: ['BBB']
      },
      {
        updatedAt: '2019/08/08',
        values: ['AAA']
      }
    ])
  })
})
