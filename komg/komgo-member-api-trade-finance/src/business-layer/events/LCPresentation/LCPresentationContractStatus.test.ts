import { LCPresentationContractStatus, getLCPresentationStatus } from './LCPresentationContractStatus'

describe('LCPresentationContractStatus', () => {
  it('shold get mappings for all statuses', () => {
    Object.keys(LCPresentationContractStatus).forEach(key =>
      getLCPresentationStatus(LCPresentationContractStatus[key] as LCPresentationContractStatus)
    )
  })
})
