import { LC_STATE } from '../LCStates'
import { getActionPerformer } from './getActionPerformer'

describe('getActionPerformer', () => {
  const LC: any = {
    applicantId: 'applicantId',
    beneficiaryId: 'beneficiaryId',
    issuingBankId: 'issuingBankId'
  }

  const nonDirectLC = {
    ...LC,
    beneficiaryBankId: 'beneficiaryBankId'
  }

  const states = [
    LC_STATE.REQUESTED,
    LC_STATE.REQUEST_REJECTED,
    LC_STATE.ISSUED_LC_REJECTED,
    LC_STATE.ISSUED,
    LC_STATE.ACKNOWLEDGED
  ]

  const onDirectLCStates = [...states, LC_STATE.ADVISED]

  it('directLC -> should return value for all relevant states', () => {
    for (const state of states) {
      expect(getActionPerformer(LC, state)).toBeDefined()
    }
  })

  it('non-directLC -> should return value for all relevant states', () => {
    for (const state of states) {
      expect(getActionPerformer(nonDirectLC, state)).toBeDefined()
    }
  })
})
