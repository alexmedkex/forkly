import { cargoDiff, tradeDiff, letterOfCreditDiff, omitDeep } from './DiffUtils'
import { ICargo, ITrade, buildFakeCargo as fakeCargo, Grade } from '@komgo/types'

import { fakeTrade, fakeLetterOfCredit, fakeTradeAndCargoSnapshot, fakeParcel } from './faker'
import { ILetterOfCredit } from '../types/ILetterOfCredit'

describe('omitDeep', () => {
  it('omit', () => {
    expect(omitDeep({ foo: 'foo', bar: 'bar' }, ['foo'])).toEqual({ bar: 'bar' })
  })
})

describe('tradeDiff', () => {
  it('s defined', () => {
    expect(tradeDiff).toBeDefined()
  })

  it('returns a diff', () => {
    const oldTrade: ITrade = fakeTrade()
    const newTrade: ITrade = {
      ...oldTrade,
      minTolerance: 1.5,
      maxTolerance: 3
    }
    expect(tradeDiff(oldTrade, newTrade)).toEqual([
      { op: 'replace', path: '/maxTolerance', value: 3, oldValue: 1, type: 'ITrade' },
      { op: 'replace', path: '/minTolerance', value: 1.5, oldValue: 1, type: 'ITrade' }
    ])
  })

  it('returns a deep diff', () => {
    const oldTrade: ITrade = fakeTrade()
    const newTrade: ITrade = {
      ...oldTrade,
      deliveryPeriod: {
        startDate: '2020-12-1',
        endDate: '2021-1-31'
      }
    }
    expect(tradeDiff(oldTrade, newTrade)).toEqual([
      {
        op: 'replace',
        path: '/deliveryPeriod/endDate',
        value: '2021-1-31',
        oldValue: '2020-12-31',
        type: 'ITrade'
      }
    ])
  })

  describe('returns an empty diff', () => {
    it('undefined sources', () => {
      const oldTrade: ITrade = undefined
      const newTrade: ITrade = undefined
      expect(tradeDiff(oldTrade, newTrade)).toEqual([])
    })

    it('undefined old value', () => {
      const oldTrade: ITrade = undefined
      const newTrade: ITrade = fakeTrade()
      expect(tradeDiff(oldTrade, newTrade)).toEqual([])
    })

    describe('ignore black listed props', () => {
      let trade: ITrade
      beforeEach(() => {
        trade = fakeTrade()
      })
      it('_id', () => {
        expect(tradeDiff(trade, { ...trade, _id: '111' })).toEqual([])
      })
      it('__v', () => {
        expect(tradeDiff(trade, { ...trade, __v: '111' } as any)).toEqual([])
      })

      it('createdAt', () => {
        expect(tradeDiff(trade, { ...trade, createdAt: new Date().toISOString() })).toEqual([])
      })

      it('updatedAt', () => {
        expect(tradeDiff(trade, { ...trade, updatedAt: new Date().toISOString() })).toEqual([])
      })

      it('deletedAt', () => {
        expect(tradeDiff(trade, { ...trade, deletedAt: new Date().toISOString() })).toEqual([])
      })
    })
  })
})

describe('cargoDiff', () => {
  it('s defined', () => {
    expect(cargoDiff).toBeDefined()
  })

  it('returns a diff', () => {
    const oldCargo: ICargo = fakeCargo()
    const newCargo: ICargo = fakeCargo({
      grade: Grade.Forties
    })
    expect(cargoDiff(oldCargo, newCargo)).toEqual([
      { oldValue: Grade.Brent, op: 'replace', path: '/grade', value: 'FORTIES', type: 'ICargo' }
    ])
  })

  it('returns a deep diff', () => {
    const oldCargo: ICargo = fakeCargo({
      parcels: [
        {
          id: 'idparcel1',
          laycanPeriod: { startDate: '2018-09-01T00:00:00.000Z', endDate: '2018-09-30T00:00:00.000Z' },
          vesselIMO: 1,
          vesselName: 'Andrej',
          loadingPort: 'Banja luka',
          dischargeArea: 'Sarajevo',
          inspector: 'Kenan',
          deemedBLDate: '2018-09-01T00:00:00.000Z',
          quantity: 3
        }
      ]
    })
    const newCargo: ICargo = fakeCargo({
      parcels: [
        {
          id: 'idparcel1',
          laycanPeriod: { startDate: '2018-09-01T00:00:00.000Z', endDate: '2018-09-30T00:00:00.000Z' },
          vesselIMO: 1,
          vesselName: 'Andrej',
          loadingPort: 'Banja luka',
          dischargeArea: 'Sarajevo',
          inspector: 'Zaza',
          deemedBLDate: '2018-09-01T00:00:00.000Z',
          quantity: 3
        }
      ]
    })
    expect(cargoDiff(oldCargo, newCargo)).toEqual([
      {
        oldValue: 'Kenan',
        op: 'replace',
        path: '/parcels/0/inspector',
        value: 'Zaza',
        type: 'ICargo'
      }
    ])
  })

  it('ignore deep _id', () => {
    const cargo: ICargo = fakeCargo({
      parcels: [fakeParcel(), fakeParcel()]
    })
    const parcels = cargo.parcels.map(p => ({ ...p, _id: '0000' }))
    expect(cargoDiff(cargo, { ...cargo, parcels })).toEqual([])
  })
})

describe('letterOfCreditDiff', () => {
  it('returns a diff', () => {
    const tradeCargo = fakeTradeAndCargoSnapshot()
    const oldLetterOfCredit: ILetterOfCredit = fakeLetterOfCredit({ tradeAndCargoSnapshot: tradeCargo })
    const newLetterOfCredit: ILetterOfCredit = fakeLetterOfCredit({
      amount: 500,
      tradeAndCargoSnapshot: tradeCargo
    })
    expect(letterOfCreditDiff(oldLetterOfCredit, newLetterOfCredit)).toEqual([
      { oldValue: 1000000, op: 'replace', path: '/amount', value: 500, type: 'ILC' }
    ])
  })
  it('returns an empty diff when objects are the same', () => {
    const tradeCargo = fakeTradeAndCargoSnapshot()
    const oldLetterOfCredit: ILetterOfCredit = fakeLetterOfCredit({ tradeAndCargoSnapshot: tradeCargo })
    const newLetterOfCredit: ILetterOfCredit = fakeLetterOfCredit({
      tradeAndCargoSnapshot: tradeCargo
    })
    expect(letterOfCreditDiff(oldLetterOfCredit, newLetterOfCredit)).toEqual([])
    expect(letterOfCreditDiff(undefined, undefined)).toEqual([])
  })
  it('returns a full diff when an object goes from nothing to something', () => {
    const tradeCargo = fakeTradeAndCargoSnapshot()
    const lc: ILetterOfCredit = fakeLetterOfCredit({ tradeAndCargoSnapshot: tradeCargo })

    expect(letterOfCreditDiff(undefined, lc).length).toEqual(34)
  })
  it('returns a full diff when an object goes from something to nothing', () => {
    const tradeCargo = fakeTradeAndCargoSnapshot()
    const lc: ILetterOfCredit = fakeLetterOfCredit({ tradeAndCargoSnapshot: tradeCargo })

    expect(letterOfCreditDiff(lc, undefined).length).toEqual(34)
  })
  it('handles the case when a subobject is different', () => {
    const oldLetterOfCredit: ILetterOfCredit = fakeLetterOfCredit({
      tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '123' })
    })
    const newLetterOfCredit: ILetterOfCredit = fakeLetterOfCredit({
      tradeAndCargoSnapshot: fakeTradeAndCargoSnapshot({ sourceId: '234' })
    })

    expect(letterOfCreditDiff(oldLetterOfCredit, newLetterOfCredit)).toEqual([
      { oldValue: '123', op: 'replace', path: '/tradeAndCargoSnapshot/sourceId', value: '234', type: 'ILC' }
    ])
  })
})
