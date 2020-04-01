export enum LetterOfCreditAction {
  issue = 'issue',
  requestReject = 'requestReject'
}

export type LetterOfCreditActionType = keyof typeof LetterOfCreditAction
