import { ReferenceType, IReference } from '@komgo/types'

export interface ICounterService {
  calculateNewReferenceId(type: ReferenceType, staticId: string): Promise<string>
  calculateNewReferenceObject(type: ReferenceType, staticId: string): Promise<IReference>
}
