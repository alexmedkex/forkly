import { getTaskHandler, registerTaskHandler, ITaskHandler, RedirectHandler } from './taskHandlerProvider'
import { Task } from '../store/types'
import { LCAmendmentTaskType } from '@komgo/types'
import { RequestForProposalTaskType } from '../../receivable-finance/entities/rfp/constants'

describe('taskHandlerProvider', () => {
  const mockTask: any = {
    context: {
      id: 1
    }
  }

  const mockHistory = {
    push: jest.fn(),
    replace: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns registered provider', () => {
    const handlerKey = 'some_handler'
    registerTaskHandler(handlerKey, (task: Task, history: any, replace?: boolean) => ({}), 'handler')

    const handler = getTaskHandler(handlerKey) as ITaskHandler

    expect(handler.mode).toBe('handler')
  })

  it('process ReviewLCApplication without replace', () => {
    const handlerKey = 'LC.ReviewLCApplication'
    const handler = getTaskHandler(handlerKey) as ITaskHandler
    ;(handler.handler as RedirectHandler)(mockTask, mockHistory, false)

    expect(mockHistory.push).toHaveBeenCalled()
  })

  it('process ReviewLCApplication with replace', () => {
    const handlerKey = 'LC.ReviewLCApplication'
    const handler = getTaskHandler(handlerKey) as ITaskHandler
    ;(handler.handler as RedirectHandler)(mockTask, mockHistory, true)

    expect(mockHistory.replace).toHaveBeenCalled()
  })

  it(`processes ${LCAmendmentTaskType.ReviewTrade} without replace`, () => {
    const handler = getTaskHandler(LCAmendmentTaskType.ReviewTrade) as ITaskHandler
    ;(handler.handler as RedirectHandler)(mockTask, mockHistory, false)

    expect(mockHistory.push).toHaveBeenCalled()
  })

  it(`processes ${LCAmendmentTaskType.ReviewTrade} with replace`, () => {
    const handler = getTaskHandler(LCAmendmentTaskType.ReviewTrade) as ITaskHandler
    ;(handler.handler as RedirectHandler)(mockTask, mockHistory, true)

    expect(mockHistory.replace).toHaveBeenCalled()
  })

  it(`processes ${RequestForProposalTaskType.ReviewRequest} without replace if subProductId is rd`, () => {
    const handler = getTaskHandler(RequestForProposalTaskType.ReviewRequest) as ITaskHandler
    const testTask = {
      ...mockTask,
      _id: 12,
      context: { ...mockTask.context, rdId: 'test-rd-id', subProductId: 'rd' }
    }
    ;(handler.handler as RedirectHandler)(testTask, mockHistory, false)

    expect(mockHistory.push).toHaveBeenCalledWith(`/receivable-discounting/test-rd-id?taskId=12`)
  })
})
