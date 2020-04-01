import { ICounterpartyProfile } from '../../data-layer/models/profile/ICounterpartyProfile'
import { CreateCounterpartyProfileRequest } from '../request/counterparty-profile/CreateCounterpartyProfileRequest'
import { UpdateCounterpartyProfileRequest } from '../request/counterparty-profile/UpdateCounterpartyProfileRequest'
import { RiskLevel } from '../../data-layer/models/profile/enums'
import { ICounterpartyProfileResponse } from '../responses/counterparty-profile/ICounterpartyProfileResponse'

export function convertCreateReqToCounterpartyProfile(
  newProfile: CreateCounterpartyProfileRequest
): ICounterpartyProfile {
  return {
    id: undefined,
    counterpartyId: newProfile.counterpartyId,
    riskLevel: newProfile.riskLevel as RiskLevel,
    renewalDate: newProfile.renewalDate,
    managedById: newProfile.managedById
  }
}
export function convertUpdateReqToCounterpartyProfile(
  updateProfile: UpdateCounterpartyProfileRequest,
  counterpartyId: string,
  profileId: string
): ICounterpartyProfile {
  return {
    id: profileId,
    counterpartyId,
    riskLevel: updateProfile.riskLevel as RiskLevel,
    renewalDate: updateProfile.renewalDate,
    managedById: updateProfile.managedById
  }
}

export function convertToCounterpartyProfileResponse(profile: ICounterpartyProfile): ICounterpartyProfileResponse {
  return {
    id: profile.id,
    counterpartyId: profile.counterpartyId,
    riskLevel: profile.riskLevel,
    renewalDate: profile.renewalDate,
    managedById: profile.managedById
  }
}
