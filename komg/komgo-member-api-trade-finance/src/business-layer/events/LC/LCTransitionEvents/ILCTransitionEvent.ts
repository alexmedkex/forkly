import { LC_STATE } from '../LCStates'

export interface ILCTransitionEvent {
  stateId: LC_STATE
  blockNumber: number
  performerId: string
}
