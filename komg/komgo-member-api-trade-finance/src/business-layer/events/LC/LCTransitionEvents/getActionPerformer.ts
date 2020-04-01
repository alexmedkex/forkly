import { ILC } from '../../../../data-layer/models/ILC'
import { LC_STATE } from '../LCStates'

export const getActionPerformer = (lc: ILC, state: LC_STATE) => {
  switch (state) {
    case LC_STATE.REQUESTED:
      return lc.applicantId
    case LC_STATE.REQUEST_REJECTED:
      return lc.issuingBankId
    case LC_STATE.ISSUED_LC_REJECTED:
      return lc.direct ? lc.beneficiaryId : lc.status === LC_STATE.ISSUED ? lc.beneficiaryBankId : lc.beneficiaryId
    case LC_STATE.ISSUED:
      return lc.issuingBankId
    case LC_STATE.ADVISED:
      return lc.beneficiaryBankId

    case LC_STATE.ACKNOWLEDGED:
      return lc.beneficiaryId
    default:
      return null
  }
}
