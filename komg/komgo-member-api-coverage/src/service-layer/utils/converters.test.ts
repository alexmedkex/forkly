import {
  convertCreateReqToCounterpartyProfile,
  convertUpdateReqToCounterpartyProfile,
  convertToCounterpartyProfileResponse
} from './converters'
import { ICounterpartyProfile } from '../../data-layer/models/profile/ICounterpartyProfile'
import { CreateCounterpartyProfileRequest } from '../request/counterparty-profile/CreateCounterpartyProfileRequest'
import { UpdateCounterpartyProfileRequest } from '../request/counterparty-profile/UpdateCounterpartyProfileRequest'
import { RiskLevel } from '../../data-layer/models/profile/enums'

const mockDate: Date = new Date()
const counterpartyId: string = 'counterpartyID'
const profileId: string = 'profileID'
const managedById: string = 'ABC'

describe('converters for CounterpartyProfile', () => {
  it('convertCreateReqToCounterpartyProfile converter works as expected', async () => {
    const req: CreateCounterpartyProfileRequest = {
      counterpartyId,
      riskLevel: RiskLevel.low,
      renewalDate: mockDate,
      managedById
    }
    const profile = convertCreateReqToCounterpartyProfile(req)
    expect(profile.counterpartyId).toEqual(req.counterpartyId)
    expect(profile.managedById).toEqual(req.managedById)
    expect(profile.renewalDate).toEqual(req.renewalDate)
    expect(profile.riskLevel).toEqual(req.riskLevel)
  })

  it('convertUpdateReqToCounterpartyProfile converter works as expected', async () => {
    const req: UpdateCounterpartyProfileRequest = {
      riskLevel: RiskLevel.low,
      renewalDate: mockDate,
      managedById
    }
    const profile = convertUpdateReqToCounterpartyProfile(req, counterpartyId, profileId)
    expect(profile.counterpartyId).toEqual(counterpartyId)
    expect(profile.id).toEqual(profileId)
    expect(profile.managedById).toEqual(req.managedById)
    expect(profile.renewalDate).toEqual(req.renewalDate)
    expect(profile.riskLevel).toEqual(req.riskLevel)
  })

  it('convertToCounterpartyProfileResponse converter works as expected', async () => {
    const profile: ICounterpartyProfile = {
      id: profileId,
      counterpartyId,
      riskLevel: RiskLevel.low,
      renewalDate: mockDate,
      managedById
    }
    const convertedProfile = convertToCounterpartyProfileResponse(profile)
    expect(convertedProfile.counterpartyId).toEqual(counterpartyId)
    expect(convertedProfile.id).toEqual(profileId)
    expect(convertedProfile.managedById).toEqual(profile.managedById)
    expect(convertedProfile.renewalDate).toEqual(profile.renewalDate)
    expect(convertedProfile.riskLevel).toEqual(profile.riskLevel)
  })
})
