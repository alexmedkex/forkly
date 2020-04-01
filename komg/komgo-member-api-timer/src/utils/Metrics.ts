export enum TimerActionExecutionStatus {
  Success = 'success',
  Failed = 'fail'
}

export enum TimerActionStatus {
  Registered = 'registered',
  Canceled = 'canceled'
}

export enum TimerState {
  Active = 'active',
  Stopped = 'stopped'
}

export enum Metric {
  TimerActionExecution = 'timerActionExecution',
  TimerActionStatus = 'timerActionExecutionStatus',
  TimerState = 'timerState'
}
