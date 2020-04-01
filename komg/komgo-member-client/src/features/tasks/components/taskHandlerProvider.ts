import {
  LCAmendmentTaskType,
  StandbyLetterOfCreditTaskType,
  DepositLoanType,
  LetterOfCreditTaskType
} from '@komgo/types'
import RequestCounterpartyContainer from '../../counterparties/containers/RequestCounterpartyContainer'
import { STEP } from '../../letter-of-credit-legacy/constants'
import { LetterOfCreditTaskType as LetterOfCreditTaskTypeLegacy } from '../../letter-of-credit-legacy/constants/taskType'
import { RequestForProposalTaskType } from '../../receivable-finance/entities/rfp/constants'
import { Task } from '../store/types'
import { TaskComponent } from '../types'
import { findFeature } from '../../credit-line/utils/creditAppetiteTypes'
import { CreditLineType } from '../../credit-line/store/types'

type taskHandleMode = 'modal' | 'handler' | 'task' | 'globalModal'
export interface ITaskHandler {
  mode: taskHandleMode
  handler: taskHandlerType
}

export type RedirectHandler = (task: Task, history: any, replace?: boolean) => void

export type TaskViewComponentType = React.ComponentType<{ task: any; actionCallback: (status: boolean) => void }>
type taskHandlerType =
  | React.ComponentType<{ task: any; actionCallback: (status: boolean) => void }>
  | React.FC<TaskComponent>
  | RedirectHandler

const taskHandlers = new Map<string, ITaskHandler>()
const letterOfCreditActions = [
  LetterOfCreditTaskTypeLegacy.REVIEW_APPLICATION_REFUSAL,
  LetterOfCreditTaskTypeLegacy.REVIEW_APPLICATION,
  LetterOfCreditTaskTypeLegacy.REVIEW_ISSUED,
  LetterOfCreditTaskTypeLegacy.REVIEW_ISSUED_REFUSAL,
  LetterOfCreditTaskTypeLegacy.MANAGE_PRESENTATION
]

export const registerTaskHandler = (taskType: string, handler: taskHandlerType, mode: taskHandleMode) => {
  taskHandlers.set(taskType, { handler, mode })
}

export const getTaskHandler = (taskType: string): ITaskHandler | undefined => {
  return taskHandlers.get(taskType)
}

// TODO - move handlers registration to related feature
registerTaskHandler(
  LetterOfCreditTaskTypeLegacy.VIEW_PRESENTED_DOCUMENTS,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/financial-instruments/letters-of-credit/${task.context.lcid}?step=${STEP.LC_DOCUMENTS}`
    if (!replace) {
      history.push(url)
    } else {
      history.replace(url)
    }
  },
  'handler'
)
registerTaskHandler('Counterparty.task', RequestCounterpartyContainer, 'modal')

registerTaskHandler(LetterOfCreditTaskTypeLegacy.REVIEW_PRESENTATION_DISCREPANCIES, null, 'globalModal')

registerTaskHandler(
  'KYC.ReviewDocuments',
  (task: Task, history: any, replace?: boolean) => {
    if (!replace) {
      history.push({
        pathname: '/review',
        state: { requestId: task.context.receivedDocumentsId }
      })
    } else {
      history.replace({
        pathname: '/review',
        state: { requestId: task.context.receivedDocumentsId }
      })
    }
  },
  'handler'
)

registerTaskHandler(
  'KYC.DocRequest',
  (task: Task, history: any, replace?: boolean) => {
    if (!replace) {
      history.push(`/document-request/${task.context.requestId}`)
    } else {
      history.replace(`/document-request/${task.context.requestId}`)
    }
  },
  'handler'
)

letterOfCreditActions.forEach((taskType: string) => {
  registerTaskHandler(
    taskType,
    (task: Task, history: any, replace?: boolean) => {
      let url = `/financial-instruments/letters-of-credit/${task.context.lcid}?taskId=${task._id}`
      if (task.taskType === LetterOfCreditTaskTypeLegacy.MANAGE_PRESENTATION) {
        url = `/financial-instruments/letters-of-credit/${task.context.lcid}/presentations`
      }
      if (!replace) {
        history.push(url)
      } else {
        history.replace(url)
      }
    },
    'handler'
  )
})

registerTaskHandler(
  LetterOfCreditTaskTypeLegacy.REVIEW_PRESENTATION,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/financial-instruments/letters-of-credit/${task.context.lcid}/presentations/${
      task.context.lcPresentationStaticId
    }`
    if (!replace) {
      history.push(url)
    } else {
      history.replace(url)
    }
  },
  'handler'
)

registerTaskHandler(
  LCAmendmentTaskType.ReviewTrade,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/financial-instruments/letters-of-credit/${task.context.lcId}/amendments/new?taskId=${task._id}`
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)

registerTaskHandler(
  LetterOfCreditTaskTypeLegacy.REVIEW_DISCREPANT_PRESENTATION,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/financial-instruments/letters-of-credit/${task.context.lcid}/presentations/${
      task.context.lcPresentationStaticId
    }/review`
    if (!replace) {
      history.push(url)
    } else {
      history.replace(url)
    }
  },
  'handler'
)

registerTaskHandler(
  LCAmendmentTaskType.ReviewAmendment,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/amendments/${task.context.lcAmendmentId}?taskId=${task._id}`
    replace ? history.replace(url) : history.push(url)
    if (!replace) {
      history.push(url)
    } else {
      history.replace(url)
    }
  },
  'handler'
)

registerTaskHandler(
  RequestForProposalTaskType.ReviewRequest,
  (task: Task, history: any, replace?: boolean) => {
    let url
    if (task.context.subProductId === 'rd') {
      url = `/receivable-discounting/${task.context.rdId}?taskId=${task._id}`
    }

    if (url) {
      if (!replace) {
        history.push(url)
      } else {
        history.replace(url)
      }
    }
  },
  'handler'
)

registerTaskHandler(
  RequestForProposalTaskType.ReviewResponse,
  (task: Task, history: any, replace?: boolean) => {
    let url
    if (task.context.subProductId === 'rd') {
      url = `/receivable-discounting/${task.context.rdId}/quotes?taskId=${task._id}`
    }

    if (url) {
      if (!replace) {
        history.push(url)
      } else {
        history.replace(url)
      }
    }
  },
  'handler'
)

registerTaskHandler(
  StandbyLetterOfCreditTaskType.ReviewRequested,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/financial-instruments/standby-letters-of-credit/${task.context.sblcStaticId}`
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)

registerTaskHandler(
  StandbyLetterOfCreditTaskType.ReviewIssued,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/financial-instruments/standby-letters-of-credit/${task.context.sblcStaticId}`
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)

registerTaskHandler(
  'CL.ReviewRequest',
  (task: Task, history: any, replace?: boolean) => {
    const feature = findFeature(task.context)
    let url = `/risk-cover/request-information/${task.context.counterpartyStaticId}`
    if (feature === CreditLineType.BankLine) {
      url = `/bank-lines/request-information/${task.context.counterpartyStaticId}`
    }
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)

registerTaskHandler(
  'CL.DepositLoan.ReviewRequest',
  (task: Task, history: any, replace?: boolean) => {
    let url = `${task.context.currency}/${task.context.period}`

    if (task.context.periodDuration) {
      url += `/${task.context.periodDuration}`
    }

    if (task.context.type === DepositLoanType.Deposit) {
      url = `/deposits/request-information/${url}`
    } else {
      url = `/loans/request-information/${url}`
    }
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)

registerTaskHandler(
  LetterOfCreditTaskType.ReviewRequested,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/letters-of-credit/${task.context.staticId}`
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)

registerTaskHandler(
  LetterOfCreditTaskType.ReviewIssued,
  (task: Task, history: any, replace?: boolean) => {
    const url = `/letters-of-credit/${task.context.staticId}`
    replace ? history.replace(url) : history.push(url)
  },
  'handler'
)
