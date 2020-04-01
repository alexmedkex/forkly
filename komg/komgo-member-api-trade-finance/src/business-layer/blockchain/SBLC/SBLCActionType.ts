export enum SBLCAction {
  issue = 'issue',
  requestReject = 'requestReject',
  issuedSBLCRejectByBeneficiary = 'issuedSBLCRejectByBeneficiary',
  issuedSBLCRejectByAdvisingBank = 'issuedSBLCRejectByAdvisingBank',
  advise = 'advise',
  acknowledge = 'acknowledge'
}

export type SBLCActionType = keyof typeof SBLCAction
