import { ILetterOfCredit } from '@komgo/types'
import ILetterOfCreditMetadata from '../ILetterOfCreditMetadata'

export default function getLetterOfCreditMetadata(letterOfCredit: ILetterOfCredit<{}>): ILetterOfCreditMetadata {
  return {
    LetterOfCredit: letterOfCredit && letterOfCredit.staticId ? letterOfCredit.staticId : null,
    LetterOfCreditAddress: letterOfCredit ? letterOfCredit.contractAddress : null
  }
}
