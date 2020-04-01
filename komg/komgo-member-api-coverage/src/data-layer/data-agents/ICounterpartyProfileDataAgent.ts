import { ICounterpartyProfile } from '../models/profile/ICounterpartyProfile'

export interface ICounterpartyProfileDataAgent {
  getByCounterpartyId(idCounterparty: string): Promise<any>
  create(newProfile: ICounterpartyProfile): Promise<ICounterpartyProfile>
  update(updatedProfile: ICounterpartyProfile): Promise<ICounterpartyProfile>
}
