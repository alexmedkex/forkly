import { StandbyLetterOfCreditTaskType, ReplyType, DepositLoanType, LetterOfCreditTaskType } from '@komgo/types'
import { Notification } from '../../notifications/store/types'
import { RequestForProposalNotificationType } from '../../receivable-finance/entities/rfp/constants'
import { findFeature } from '../../credit-line/utils/creditAppetiteTypes'
import { CreditLineType } from '../../credit-line/store/types'
import { RDNotificationType } from '../../receivable-finance/entities/rd/constants'

const notificationHandlers = new Map<string, RedirectHandler>()

export type RedirectHandler = (notification: Notification, history: any) => void

export type RegisterFunc = (notificationType: string, handler: RedirectHandler) => void

export const registerNotificationHandler: RegisterFunc = (notificationType, handler) => {
  notificationHandlers.set(notificationType, handler)
}

export const getNotificationHandler = (notificationType: string): RedirectHandler | undefined => {
  return notificationHandlers.get(notificationType)
}

export const registerNotificationHandlers = (registerFunc: RegisterFunc = registerNotificationHandler) => {
  registerFunc('Counterparty.info', (notification: Notification, history: any) => {
    history.push({
      pathname: '/counterparties'
    })
  })

  registerFunc('LC.info', (notification: Notification, history: any) => {
    if (notification.context && notification.context.lcid) {
      history.push({
        pathname: `/financial-instruments/letters-of-credit/${notification.context.lcid}`
      })
    } else {
      history.push({
        pathname: '/financial-instruments'
      })
    }
  })

  registerFunc('LC.task', (notification: Notification, history: any) => {
    if (notification.context && notification.context.id) {
      history.push({
        pathname: `/trades/${notification.context.id}`
      })
    } else {
      history.push({
        pathname: '/trades'
      })
    }
  })

  registerFunc('LCPresentation.info', (notification: Notification, history: any) => {
    if (notification.context && notification.context.lcid && notification.context.presentationId) {
      history.push({
        pathname: `/financial-instruments/letters-of-credit/${notification.context.lcid}/presentations/${
          notification.context.presentationId
        }/history`
      })
    } else {
      history.push({
        pathname: '/financial-instruments'
      })
    }
  })

  registerStandbyLetterOfCreditNotificationHandlers(registerFunc)
  registerLetterOfCreditNotificationHandlers(registerFunc)
}

export const registerStandbyLetterOfCreditNotificationHandlers = (registerFunc: RegisterFunc) =>
  Object.values(StandbyLetterOfCreditTaskType).forEach(sblcTaskType => {
    registerFunc(sblcTaskType, (notification: Notification, history: any) => {
      if (notification.context && notification.context.sblcStaticId) {
        const url = `/financial-instruments/standby-letters-of-credit/${notification.context.sblcStaticId}`
        history.push(url)
      }
    })
  })

export const registerLetterOfCreditNotificationHandlers = (registerFunc: RegisterFunc) =>
  Object.values(LetterOfCreditTaskType).forEach(lcTaskType => {
    registerFunc(lcTaskType, (notification: Notification, history: any) => {
      if (notification.context && notification.context.staticId) {
        const url = `/letters-of-credit/${notification.context.staticId}`
        history.push(url)
      }
    })
  })

registerNotificationHandlers()

registerNotificationHandler(RequestForProposalNotificationType.RFPInfo, (notification: Notification, history: any) => {
  const context = notification.context
  let pathname = '/receivable-discounting/'
  if (context && context.rdId) {
    const rdId: string = context.rdId
    const replyType: ReplyType = context.replyType

    if (replyType === ReplyType.Submitted) {
      pathname = `/receivable-discounting/${rdId}/quotes`
    } else if (replyType === ReplyType.Declined || replyType === ReplyType.Accepted) {
      pathname = `/receivable-discounting/${rdId}`
    }
  }

  history.push({
    pathname
  })
})

registerNotificationHandler(RDNotificationType.Update, (notification: Notification, history: any) => {
  const context = notification.context
  let pathname = '/receivable-discounting/'
  if (context && context.rdId) {
    pathname = `/receivable-discounting/${context.rdId}?section=${context.updateType}`
  }

  history.push({
    pathname
  })
})

registerNotificationHandler(RDNotificationType.Document, (notification: Notification, history: any) => {
  const context = notification.context
  let pathname = '/receivable-discounting/'
  if (context && context.rdId) {
    pathname = `/receivable-discounting/${context.rdId}?section=Documents`
  }

  history.push({
    pathname
  })
})

registerNotificationHandler('CL.info', (notification: Notification, history: any) => {
  // Bank lines notification handler
  const handleBankLines = () => {
    if (notification.context.creditLineCounterpartyStaticId) {
      history.push({
        pathname: `/bank-lines/banks/${notification.context.creditLineCounterpartyStaticId}`,
        state: {
          highlightBank: notification.context.creditLineOwnerStaticId
        }
      })
    } else {
      history.push({
        pathname: '/bank-lines'
      })
    }
  }
  // Risk cover notification handler
  const handleRiskCover = () => {
    if (notification.context.creditLineCounterpartyStaticId) {
      history.push({
        pathname: `/risk-cover/buyers/${notification.context.creditLineCounterpartyStaticId}`,
        state: {
          highlightBank: notification.context.creditLineOwnerStaticId
        }
      })
    } else {
      history.push({
        pathname: '/risk-cover'
      })
    }
  }
  if (notification.context) {
    const feature = findFeature(notification.context)
    if (feature === CreditLineType.BankLine) {
      handleBankLines()
    } else {
      handleRiskCover()
    }
  } else {
    // Default handler
    history.push({
      pathname: '/risk-cover'
    })
  }
})

registerNotificationHandler('CL.DepositLoan.info', (notification: Notification, history: any) => {
  if (notification.context) {
    if (notification.context.operation === 'DeclineRequest') {
      return
    }

    let path = `${notification.context.currency}/${notification.context.period}`

    if (notification.context.periodDuration) {
      path += `/${notification.context.periodDuration}`
    }

    if (notification.context.type === DepositLoanType.Deposit) {
      path = `/deposits/currency-tenor/${path}`
    } else {
      path = `/loans/currency-tenor/${path}`
    }

    history.push({
      pathname: path,
      state: {
        highlightItem: notification.context.ownerStaticId
      }
    })
  } else {
    history.push({
      pathname: '/deposits'
    })
  }
})

registerNotificationHandler('TradeFinance.Document.share', ({ context }: Notification, history: any) => {
  if (context && context.documentId) {
    history.push({
      pathname: `/trade-documents/${context.documentId}`
    })
  }
})

registerNotificationHandler('Document.RequestCreated.info', ({ context }: Notification, history: any) => {
  if (context && context.requestId) {
    history.push({
      pathname: `/request-documents/review/${context.requestId}`
    })
  }
})
