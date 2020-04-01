import { IStandbyLetterOfCredit } from '@komgo/types'
import ISBLCMetadata from '../ISBLCMetadata'

export default function getSBLCMetaData(sblc: IStandbyLetterOfCredit): ISBLCMetadata {
  return {
    SBLC: sblc && sblc.staticId ? sblc.staticId : null,
    SBLCAddress: sblc ? sblc.contractAddress : null
  }
}
