import { injectable } from 'inversify'
import { ICounterpartyProfile } from '../models/profile/ICounterpartyProfile'
import { ICounterpartyProfileDataAgent } from './ICounterpartyProfileDataAgent'
import { CounterpartyProfile } from '../models/profile/CounterpartyProfile'

@injectable()
export default class CounterpartyProfileDataAgent implements ICounterpartyProfileDataAgent {
  async getByCounterpartyId(idCounterparty: string): Promise<any> {
    return CounterpartyProfile.findOne({ counterpartyId: idCounterparty })
  }

  async create(newProfile: ICounterpartyProfile): Promise<ICounterpartyProfile> {
    return CounterpartyProfile.create(newProfile)
  }

  async update(updatedProfile: ICounterpartyProfile): Promise<ICounterpartyProfile> {
    return CounterpartyProfile.findOneAndUpdate(
      { counterpartyId: updatedProfile.counterpartyId },
      { ...updatedProfile, $inc: { __v: 1 } },
      { new: true }
    )
  }
}
