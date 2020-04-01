export enum LCAction {
  initialise = 'initialise',
  request = 'request',
  issue = 'issue',
  requestReject = 'requestReject',
  issuedLCRejectByBeneficiary = 'issuedLCRejectByBeneficiary',
  issuedLCRejectByAdvisingBank = 'issuedLCRejectByAdvisingBank',
  advise = 'advise',
  acknowledge = 'acknowledge'
}

export type LCActionType = keyof typeof LCAction
