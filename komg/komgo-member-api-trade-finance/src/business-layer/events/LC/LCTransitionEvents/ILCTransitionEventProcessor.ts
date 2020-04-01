import { LC_STATE } from '../LCStates'
import { ILCTransitionEvent } from './ILCTransitionEvent'
import { ILC } from '../../../../data-layer/models/ILC'

export interface ILCTransitionEventProcessor {
  state: LC_STATE
  processStateTransition(lc: ILC, event: ILCTransitionEvent): Promise<boolean>
}
