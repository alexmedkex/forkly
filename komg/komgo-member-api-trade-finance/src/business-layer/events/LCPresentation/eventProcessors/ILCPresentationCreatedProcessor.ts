import { LCPresentationContractStatus } from '../LCPresentationContractStatus'
import { ILCPresentation } from '../../../../data-layer/models/ILCPresentation'
import { ILCPresentationActionPerformer } from './ILCPresentationActionPerformer'
import { ILC } from '../../../../data-layer/models/ILC'

export interface ILCPresentationCreatedProcessor {
  state: LCPresentationContractStatus
  processEvent(presentation: ILCPresentation, event, performer: ILCPresentationActionPerformer, lc: ILC)
}
