import { CreateCounterpartyProfileRequest } from './CreateCounterpartyProfileRequest'
import { RiskLevel } from '../../../data-layer/models/profile/enums'

describe('CreateCounterpartyProfileRequest', () => {
  it('validate correct object', async () => {
    const req: CreateCounterpartyProfileRequest = {
      counterpartyId: 'COUNTERPARTY_ID',
      riskLevel: RiskLevel.low,
      renewalDate: new Date(),
      managedById: 'USER_ID'
    }
  })
})
