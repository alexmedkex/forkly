import { TaskType } from '../tasks/TaskType'

export interface IEmailConfig {
  subject: string
  taskTitle: string
  taskType: TaskType
}

export const getEmailsConfigs = (): IEmailConfig[] => {
  return [
    {
      subject: 'Credit Appetite Risk Cover Request',
      taskTitle: 'Review risk cover request (Credit appetite)',
      taskType: TaskType.RiskCover
    },
    {
      subject: 'Credit Appetite Bank Lines Request',
      taskTitle: 'Review bank lines request (Credit appetite)',
      taskType: TaskType.BankLines
    },
    {
      subject: 'Credit Appetite Deposit Request',
      taskTitle: 'Review deposit request (Credit appetite)',
      taskType: TaskType.Deposit
    },
    {
      subject: 'Credit Appetite Loan Request',
      taskTitle: 'Review Loan request (Credit appetite)',
      taskType: TaskType.Loan
    }
  ]
}
