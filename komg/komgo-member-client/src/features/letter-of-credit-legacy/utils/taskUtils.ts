import { LetterOfCreditTaskType } from '../constants/taskType'
import * as _ from 'lodash'
import { STEP } from '../constants'
import { Task, TaskContextType } from '../../tasks/store/types'

const taskTypesIncluded = [
  LetterOfCreditTaskType.REVIEW_APPLICATION,
  LetterOfCreditTaskType.REVIEW_APPLICATION_REFUSAL,
  LetterOfCreditTaskType.REVIEW_ISSUED,
  LetterOfCreditTaskType.REVIEW_ISSUED_REFUSAL,
  LetterOfCreditTaskType.MANAGE_PRESENTATION,
  LetterOfCreditTaskType.REVIEW_PRESENTATION,
  LetterOfCreditTaskType.REVIEW_DISCREPANT_PRESENTATION
]
type LetterOfCreditTaskToLabel = { [key in LetterOfCreditTaskType]?: string }
const LetterOfCreditTaskTypeText: LetterOfCreditTaskToLabel = {
  [LetterOfCreditTaskType.REVIEW_APPLICATION]: 'Review LC application',
  [LetterOfCreditTaskType.REVIEW_APPLICATION_REFUSAL]: 'Review LC application refusal',
  [LetterOfCreditTaskType.REVIEW_ISSUED]: 'Review issued LC',
  [LetterOfCreditTaskType.REVIEW_ISSUED_REFUSAL]: 'Review issued LC refusal',
  [LetterOfCreditTaskType.MANAGE_PRESENTATION]: 'Present documents',
  [LetterOfCreditTaskType.REVIEW_PRESENTATION]: 'Review presentation',
  [LetterOfCreditTaskType.REVIEW_DISCREPANT_PRESENTATION]: 'Review discrepant presentation'
}

const tasksInGlobalModal = [LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES]

export const resolveTaskTitle = (taskType: string): string => {
  return LetterOfCreditTaskTypeText[taskType as LetterOfCreditTaskType] || taskType
}

export const resolveTaskLink = (task: Task, taskId: string, letterId?: string): string => {
  switch (task.taskType) {
    case LetterOfCreditTaskType.MANAGE_PRESENTATION:
      return `/financial-instruments/letters-of-credit/${letterId}/presentations`
    case LetterOfCreditTaskType.REVIEW_PRESENTATION:
      return `/financial-instruments/letters-of-credit/${letterId}/presentations/${task.context.lcPresentationStaticId}`
    case LetterOfCreditTaskType.REVIEW_DISCREPANT_PRESENTATION:
      return `/financial-instruments/letters-of-credit/${letterId}/presentations/${
        task.context.lcPresentationStaticId
      }/review`
    default:
      return `/financial-instruments/letters-of-credit/${letterId}?taskId=${taskId}`
  }
}

export const shouldBeHandle = (taskType: string): LetterOfCreditTaskType | undefined => {
  return _.find(taskTypesIncluded, t => t === taskType)
}

export const shouldHandleInModal = (taskType: string): LetterOfCreditTaskType | undefined => {
  return _.find(tasksInGlobalModal, t => t === taskType)
}

export const resolveTaskTitleForLCPresentation = (tasks: Task[], task: Task) => {
  switch (task.taskType) {
    case LetterOfCreditTaskType.REVIEW_PRESENTATION: {
      // This is hot fix for now and it is going to be changed to use staticId
      return 'Review presentation'
    }
    case LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES:
      return 'Review discrepancies'
    default:
      return LetterOfCreditTaskTypeText[task.taskType as LetterOfCreditTaskType] || task.taskType
  }
}
