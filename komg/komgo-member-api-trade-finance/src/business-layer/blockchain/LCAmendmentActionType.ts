export enum LCAmendmentAction {
  approveIssuingBank = 'approveIssuingBank',
  rejectIssuingBank = 'rejectIssuingBank'
}

export type LCAmendmentActionType = keyof typeof LCAmendmentAction
