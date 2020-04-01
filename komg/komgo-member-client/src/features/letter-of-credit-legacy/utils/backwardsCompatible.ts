import { ILetterOfCredit } from '../types/ILetterOfCredit'
import { ICargo, ITrade } from '@komgo/types'

export const withTradeAndCargoSnapshotSourceIds = (letterOfCredit?: ILetterOfCredit): ILetterOfCredit =>
  letterOfCredit && {
    ...letterOfCredit,
    tradeAndCargoSnapshot: letterOfCredit.tradeAndCargoSnapshot && {
      ...letterOfCredit.tradeAndCargoSnapshot,
      trade: letterOfCredit.tradeAndCargoSnapshot.trade && withSourceId(letterOfCredit.tradeAndCargoSnapshot.trade),
      cargo: letterOfCredit.tradeAndCargoSnapshot.cargo && withSourceId(letterOfCredit.tradeAndCargoSnapshot.cargo)
    }
  }

interface VaktId {
  vaktId?: string
}

const withSourceId = <T extends ITrade | ICargo>({ vaktId, ...payload }: T & VaktId): T =>
  ({
    ...payload,
    sourceId: (payload as T).sourceId || vaktId
  } as T)
