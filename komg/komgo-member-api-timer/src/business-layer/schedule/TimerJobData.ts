export interface ITimerJobData {
  timerStaticId: string
  time: Date
  context?: object
  timerId?: string
  payload: object
}
