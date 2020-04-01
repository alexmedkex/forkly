import { LCPresentationStatus } from '@komgo/types'
import { ILCPresentation } from '../../../../data-layer/models/ILCPresentation'
import { ILCPresentationActionPerformer } from './ILCPresentationActionPerformer'
import { ILC } from '../../../../data-layer/models/ILC'

export interface ILCPresentationStateEvent {
  state: LCPresentationStatus
  processEvent(presentation: ILCPresentation, event, performer: ILCPresentationActionPerformer, lc: ILC)
}
