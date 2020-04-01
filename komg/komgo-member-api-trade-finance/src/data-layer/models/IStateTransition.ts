export interface IStateTransition {
  fromState?: string
  toState: string
  performer: string // static ID of the company triggering the state transition
  date: Date
}
