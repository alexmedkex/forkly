import { ILetterOfCreditWithData } from '../store/types'
import { LetterOfCreditStatus } from '@komgo/types'

export const isRejectedLetterOfCredit = (letter: ILetterOfCreditWithData) => {
  return (
    !!letter &&
    [
      LetterOfCreditStatus.RequestRejected,
      LetterOfCreditStatus.IssuedRejected,
      LetterOfCreditStatus.RequestRejected_Pending
    ].includes(letter.status)
  )
}
