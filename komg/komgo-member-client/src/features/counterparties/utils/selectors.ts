import { TaskWithUser } from '../../tasks/store/types'
import * as _ from 'lodash'
import { Counterparty } from '../store/types'
import { IMember } from '../../members/store/types'

export const findTaskByCounterpartyStaticId = (
  tasks: TaskWithUser[] = [],
  counterpartyStaticId: string | undefined | number
): TaskWithUser | undefined => {
  return _.find(tasks, task => task.task.counterpartyStaticId === counterpartyStaticId)
}

export const getCompanyName = (company: IMember | Counterparty, defaultName: string = '-') => {
  if (company && company.x500Name && company.x500Name.CN) {
    return company.x500Name.CN
  }
  return defaultName
}
