import { ILC } from '../../models/ILC'
import { LC_STATE } from '../../../business-layer/events/LC/LCStates'

export interface ILCCacheDataAgent {
  saveLC(LC: ILC): Promise<string>
  updateLcByReference(reference: string, lc: ILC)
  updateField(id: string, field: keyof ILC, value: any)
  updateStatus(id: string, status: LC_STATE, companyId: string): Promise<ILC>
  getLC(attributes: object): Promise<ILC>
  getLCs(query?: object, projection?: object, options?: object): Promise<ILC[]>
  getNonce(address: string): Promise<number>
  count(query?: object): Promise<number>
}
