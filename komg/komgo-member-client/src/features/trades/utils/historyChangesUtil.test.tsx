import { fakeITradeSnapshotHistory } from '../../receivable-discounting-legacy/utils/faker'
import { getTradeHistoryEntry, getCargoHistoryEntry, getHistoryEntry } from './historyChangesUtil'

describe('historyChangesUtil', () => {
  let tradeSnapshotHistory

  beforeEach(() => {
    tradeSnapshotHistory = fakeITradeSnapshotHistory()
  })

  it('getTradeHistoryEntry should return the trade historyEntry', () => {
    expect(getTradeHistoryEntry(tradeSnapshotHistory)).toEqual(tradeSnapshotHistory.historyEntry.trade.historyEntry)
  })

  it('getCargoHistoryEntry should return the cargo historyEntry', () => {
    expect(getCargoHistoryEntry(tradeSnapshotHistory)).toEqual(tradeSnapshotHistory.historyEntry.movements)
  })

  it('getHistoryChanges should return field historyEntry', () => {
    const tradeHistoryEntry = getTradeHistoryEntry(tradeSnapshotHistory)
    expect(getHistoryEntry('quantity', tradeHistoryEntry)).toEqual(
      tradeSnapshotHistory.historyEntry.trade.historyEntry.quantity
    )
  })

  it('getHistoryChanges should return a nested field historyEntry', () => {
    const cargoHistoryEntry = getCargoHistoryEntry(tradeSnapshotHistory)
    const parcelHistoryEntry = cargoHistoryEntry[0].historyEntry.parcels[0]

    expect(getHistoryEntry('laycanPeriod.startDate', parcelHistoryEntry)).toEqual(
      cargoHistoryEntry[0].historyEntry.parcels[0].laycanPeriod.historyEntry.startDate
    )
  })
})
