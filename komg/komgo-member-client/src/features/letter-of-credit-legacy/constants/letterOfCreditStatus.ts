import { ILetterOfCreditStatus } from '../types/ILetterOfCredit'

export const letterOfCreditStateStepsText = {
  [ILetterOfCreditStatus.INITIALISING]: 'LC Initialising',
  [ILetterOfCreditStatus.REQUESTED]: 'LC Requested',
  [ILetterOfCreditStatus.REQUEST_REJECTED]: 'LC Request rejected',
  [ILetterOfCreditStatus.ISSUED]: 'LC Issued',
  [ILetterOfCreditStatus.ADVISED]: 'LC Advised',
  [ILetterOfCreditStatus.ACKNOWLEDGED]: 'LC Acknowledged',
  [ILetterOfCreditStatus.COLLECTING]: 'LC Collecting',
  [ILetterOfCreditStatus.ISSUED_LC_REJECTED]: 'Issued LC rejected'
}
