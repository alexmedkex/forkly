import { IStandbyLetterOfCredit, StandbyLetterOfCreditStatus } from '@komgo/types'
export const isRejectedStandbyLetterOfCredit = (letter: IStandbyLetterOfCredit) => {
  return (
    !!letter &&
    [StandbyLetterOfCreditStatus.RequestRejected, StandbyLetterOfCreditStatus.IssuedRejected].includes(letter.status)
  )
}
