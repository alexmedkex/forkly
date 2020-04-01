import { ILetterOfCredit, ILetterOfCreditStatus } from '../types/ILetterOfCredit'

export const isRejectedLetterOfCredit = (letter: ILetterOfCredit) => {
  return (
    !!letter &&
    [ILetterOfCreditStatus.REQUEST_REJECTED, ILetterOfCreditStatus.ISSUED_LC_REJECTED].includes(
      letter.status as ILetterOfCreditStatus
    )
  )
}
