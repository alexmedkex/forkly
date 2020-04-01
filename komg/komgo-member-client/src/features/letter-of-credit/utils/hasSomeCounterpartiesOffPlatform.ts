import { IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'

export const hasSomeCounterpartiesOffPlatform = (letter: ILetterOfCredit<IDataLetterOfCredit>) => {
  const {
    data: { applicant, beneficiary, issuingBank }
  } = letter.templateInstance
  return [applicant, beneficiary, issuingBank].some(counterparty => !counterparty.isMember)
}
