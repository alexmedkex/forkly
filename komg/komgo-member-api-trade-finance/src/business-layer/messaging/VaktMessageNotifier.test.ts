import 'reflect-metadata'

import { VaktMessageNotifier } from './VaktMessageNotifier'
import { VaktMessagingFactoryManager } from './VaktMessagingFactoryManager'
import { sampleLC } from './mock-data/mock-lc'
import { ILC } from '../../data-layer/models/ILC'
import { LCMessageType } from './messageTypes'
import { LC_STATE } from '../events/LC/LCStates'
import { COMPANY_LC_ROLE } from '../CompanyRole'

const mockVaktMessagingManager: any = {
  notify: jest.fn()
}

const mockVaktMessagingFactoryManager = new VaktMessagingFactoryManager()

const mockCompanyRegistryService: any = {
  getMember: jest.fn(staticId => Promise.resolve({ data: [{ komgoMnid: 'mnid' + staticId }] }))
}

const verifySentMessage = (msg, lc: ILC, receiverKey: string, vaktMsgType?: LCMessageType) => {
  if (vaktMsgType) {
    expect(msg.payload.messageType).toBe(vaktMsgType)
  }

  expect(msg.payload.vaktId).toBe(lc.tradeAndCargoSnapshot.sourceId)
  expect(msg.headers).toMatchObject({
    recipientStaticId: lc[receiverKey + 'Id']
  })
}

describe('VaktMessageNotifier', () => {
  let notifier
  let logger

  beforeEach(() => {
    notifier = new VaktMessageNotifier(
      mockCompanyRegistryService,
      mockVaktMessagingManager,
      mockVaktMessagingFactoryManager
    )

    logger = (notifier as any).logger
    logger.info = jest.fn()
    logger.warn = jest.fn()
    logger.error = jest.fn()
  })

  it('should not send message for not registered state', async () => {
    const state = LC_STATE.ACKNOWLEDGED
    const role = COMPANY_LC_ROLE.AdvisingBank

    notifier.sendVaktMessage(null, state, role)
    expect(logger.info).toBeCalledWith(`No VAKT message to be sent for state ${state}`, expect.anything())
  })

  it('should not send message if no company data', async () => {
    mockCompanyRegistryService.getMember.mockImplementationOnce(() => Promise.resolve([]))

    await notifier.sendVaktMessage(sampleLC, LC_STATE.REQUESTED, COMPANY_LC_ROLE.Applicant)
    expect(logger.error).toHaveBeenCalled()
  })

  it('should not send message if company has no komgoMnid', async () => {
    mockCompanyRegistryService.getMember.mockImplementationOnce(() => Promise.resolve({ data: [{}] }))

    await notifier.sendVaktMessage(sampleLC, LC_STATE.REQUESTED, COMPANY_LC_ROLE.Applicant)
  })

  it('should not send message if not applicant/beneficiary', async () => {
    const state = LC_STATE.REQUESTED
    const role = COMPANY_LC_ROLE.AdvisingBank

    await notifier.sendVaktMessage(null, state, role)
    expect(logger.info).toBeCalledWith(`No VAKT message to be sent for state ${state} by ${role}`, expect.anything())
  })

  it('should not send message if not defined for current company role', async () => {
    const state = LC_STATE.REQUESTED
    const role = COMPANY_LC_ROLE.Beneficiary

    await notifier.sendVaktMessage(null, state, role)
    expect(logger.info).toBeCalledWith(`No VAKT message to be sent for state ${state} by ${role}`, expect.anything())
  })

  it('should not send message if trade source is KOMGO', async () => {
    const extendedSimpleLC = {
      ...sampleLC,
      tradeAndCargoSnapshot: {
        source: 'KOMGO'
      }
    }

    await notifier.sendVaktMessage(extendedSimpleLC, LC_STATE.REQUESTED, COMPANY_LC_ROLE.Applicant)
    expect(logger.info).toBeCalledWith(`No notification sent to VAKT because trade source is KOMGO`)
  })

  it('should send message', async () => {
    await notifier.sendVaktMessage(sampleLC, LC_STATE.REQUESTED, COMPANY_LC_ROLE.Applicant)

    const calls = mockVaktMessagingManager.notify.mock.calls

    verifySentMessage(calls[0][0], sampleLC, 'applicant', LCMessageType.LCRequested)
    verifySentMessage(calls[1][0], sampleLC, 'beneficiary', LCMessageType.LCRequested)
  })

  it('should send message all messages from applicant note', async () => {
    const lcStates = [LC_STATE.REQUESTED, LC_STATE.REQUEST_REJECTED, LC_STATE.ISSUED, LC_STATE.ISSUED_LC_REJECTED]

    for (const state of lcStates) {
      mockVaktMessagingManager.notify.mockClear()

      const lc = { ...sampleLC, status: state }

      await notifier.sendVaktMessage(lc, LC_STATE.REQUEST_REJECTED, COMPANY_LC_ROLE.Applicant)
      const calls = mockVaktMessagingManager.notify.mock.calls

      expect(mockVaktMessagingManager.notify).toHaveBeenCalled()

      verifySentMessage(calls[0][0], lc, 'applicant')
      verifySentMessage(calls[1][0], lc, 'beneficiary')
    }
  })
})
