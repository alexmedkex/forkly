/**
 * @tsoaModel
 */
export interface ITimerExecutionLog {
  id?: string
  payload?: any
  executionTime?: Date
  scheduledTime?: Date
  context?: any
  success?: boolean
}
