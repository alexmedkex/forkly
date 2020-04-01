import {
  getNotificationHandler,
  registerNotificationHandler,
  RedirectHandler,
  registerStandbyLetterOfCreditNotificationHandlers,
  registerLetterOfCreditNotificationHandlers
} from './notificationHandlerProvider'
import { StandbyLetterOfCreditTaskType, LetterOfCreditTaskType } from '@komgo/types'
import { buildFakeNotification } from '../utils/faker'
import uuid from 'uuid'
import { RDNotificationType } from '../../receivable-finance/entities/rd/constants'

describe('notificationHandlerProvider', () => {
  const mockNotificationLCTask: any = {
    type: 'LC.task',
    context: {
      id: 1
    }
  }

  const mockNotificationLCInfo: any = {
    type: 'LC.info',
    context: {
      lcid: 1
    }
  }

  const mockNotificationCounterpartyInfo: any = {
    type: 'Counterparty.info'
  }

  const mockNotificationRDUpdate: any = {
    type: RDNotificationType.Update,
    context: {
      rdId: 1
    }
  }

  const mockHistory = {
    push: jest.fn()
  }

  const mockNotificationDocumentShare: any = {
    type: 'TradeFinance.Document.share',
    context: {
      documentId: 1
    }
  }

  it('returns registered provider', () => {
    const handlerKey = 'some_handler'
    registerNotificationHandler(handlerKey, (mockNotificationCounterpartyInfo, mockHistory) => ({}))

    const handler = getNotificationHandler(handlerKey) as RedirectHandler

    expect(handler).toBeDefined()
  })

  it('process LC.task', () => {
    const handlerKey = 'LC.task'
    const notificationHandler = getNotificationHandler(handlerKey) as RedirectHandler
    ;(notificationHandler as RedirectHandler)(mockNotificationLCTask, mockHistory)

    expect(mockHistory.push).toHaveBeenCalled()
  })

  it('process LC.info', () => {
    const handlerKey = 'LC.info'
    const notificationHandler = getNotificationHandler(handlerKey) as RedirectHandler
    ;(notificationHandler as RedirectHandler)(mockNotificationLCInfo, mockHistory)

    expect(mockHistory.push).toHaveBeenCalled()
  })

  it('process Counterparty.info', () => {
    const handlerKey = 'Counterparty.info'
    const notificationHandler = getNotificationHandler(handlerKey) as RedirectHandler
    ;(notificationHandler as RedirectHandler)(mockNotificationCounterpartyInfo, mockHistory)

    expect(mockHistory.push).toHaveBeenCalled()
  })

  it('process RD.Update', () => {
    const notificationHandler = getNotificationHandler(RDNotificationType.Update) as RedirectHandler
    ;(notificationHandler as RedirectHandler)(mockNotificationRDUpdate, mockHistory)

    expect(mockHistory.push).toHaveBeenCalled()
  })

  it('process TradeFinance.Document.share', () => {
    const handlerKey = 'TradeFinance.Document.share'
    const notificationHandler = getNotificationHandler(handlerKey) as RedirectHandler
    ;(notificationHandler as RedirectHandler)(mockNotificationDocumentShare, mockHistory)

    expect(mockHistory.push).toHaveBeenCalled()
  })
})

describe('registerStandbyLetterOfCreditNotificationHandlers', () => {
  const registerFunc = jest.fn()
  beforeAll(() => {
    registerStandbyLetterOfCreditNotificationHandlers(registerFunc)
  })
  it('calls registerFunc once with StandbyLetterOfCreditTaskType.ReviewIssued as first argument', () => {
    expect(registerFunc.mock.calls[0][0]).toEqual(StandbyLetterOfCreditTaskType.ReviewIssued)
  })
  it('calls registerFunc once with StandbyLetterOfCreditTaskType.ReviewRequested as first argument', () => {
    expect(registerFunc.mock.calls[1][0]).toEqual(StandbyLetterOfCreditTaskType.ReviewRequested)
  })
  it('adds a handler as a second argument which exhibits correct behaviour', () => {
    const reviewIssuedHandler: RedirectHandler = registerFunc.mock.calls[0][1]

    const sblcStaticId = uuid.v4()
    const matchingNotification = buildFakeNotification({
      type: StandbyLetterOfCreditTaskType.ReviewIssued,
      context: {
        type: 'IStandbyLetterOfCredit',
        sblcStaticId
      }
    })

    const history = {
      push: jest.fn()
    }
    reviewIssuedHandler(matchingNotification, history)

    expect(history.push).toHaveBeenCalledWith(`/financial-instruments/standby-letters-of-credit/${sblcStaticId}`)
  })
})

describe('registerLetterOfCreditNotificationHandlers', () => {
  const registerFunc = jest.fn()
  beforeAll(() => {
    registerLetterOfCreditNotificationHandlers(registerFunc)
  })
  it('calls registerFunc once with LetterOfCreditTaskType.ReviewIssued as first argument', () => {
    expect(registerFunc.mock.calls[0][0]).toEqual(LetterOfCreditTaskType.ReviewIssued)
  })
  it('calls registerFunc once with LetterOfCreditTaskType.ReviewRequested as first argument', () => {
    expect(registerFunc.mock.calls[1][0]).toEqual(LetterOfCreditTaskType.ReviewRequested)
  })
  it('adds a handler as a second argument which exhibits correct behaviour', () => {
    const reviewIssuedHandler: RedirectHandler = registerFunc.mock.calls[0][1]

    const staticId = uuid.v4()
    const matchingNotification = buildFakeNotification({
      type: LetterOfCreditTaskType.ReviewRequested,
      context: {
        type: 'ILetterOfCredit',
        staticId
      }
    })

    const history = {
      push: jest.fn()
    }

    reviewIssuedHandler(matchingNotification, history)

    expect(history.push).toHaveBeenCalledWith(`/letters-of-credit/${staticId}`)
  })
})
