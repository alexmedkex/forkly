import {
  IRequestForProposal,
  IAction,
  ActionType,
  buildFakeRequestForProposalExtended,
  buildFakeActionExtended,
  ActionStatus
} from '@komgo/types'

import { ActionDataAgent } from '../../data-layer/data-agents/ActionDataAgent'
import { OUTBOUND_MESSAGE_VERSION } from '../messaging/constants'
import { IRFPActionMessage, IActionPayload } from '../messaging/types'

export const PRODUCT_NAME = 'Receivable Discounting'
export const COMPANY_NAME = 'Cardiff Bank Ltd'

declare const expect: any
export interface IMocks {
  rfp: IRequestForProposal
  action: IAction
  rfpMessage: IRFPActionMessage<IActionPayload>
}

export function createMocks(actionType: ActionType): IMocks {
  const mockRfp: IRequestForProposal = buildFakeRequestForProposalExtended(false)
  const mockAction: IAction = buildFakeActionExtended(actionType, false)
  mockAction.type = actionType
  delete mockRfp.createdAt
  delete mockAction.createdAt
  const mockRFPMessage: IRFPActionMessage<IActionPayload> = createRFPMessage(mockAction, mockRfp)

  return { action: mockAction, rfpMessage: mockRFPMessage, rfp: mockRfp }
}

function createRFPMessage(mockAction: IAction, mockRfp: IRequestForProposal) {
  const payload = createRFPPayload(mockRfp, mockAction)
  return {
    context: mockRfp.context,
    version: OUTBOUND_MESSAGE_VERSION,
    messageType: mockAction.type,
    data: { ...payload }
  }
}

function createRFPPayload(mockRfp: IRequestForProposal, mockAction: IAction): IActionPayload {
  const rfp = {
    actionId: mockAction.staticId,
    rfpId: mockRfp.staticId,
    recipientStaticID: mockAction.recipientStaticID,
    senderStaticID: mockAction.senderStaticID,
    sentAt: mockAction.sentAt
  }
  let payload
  if (mockAction.type === ActionType.Request) {
    payload = {
      rfp,
      productRequest: mockRfp.productRequest,
      documentIds: mockRfp.documentIds
    }
  } else if (mockAction.type === ActionType.Response || mockAction.type === ActionType.Reject || ActionType.Accept) {
    payload = {
      rfp,
      response: { data: 'mockData' }
    }
  }
  return payload
}

export function assertActionSavedAndStatusUpdated(actionDataAgent: ActionDataAgent, mocks: IMocks) {
  expect(actionDataAgent.updateCreate).toBeCalledTimes(1)
  expect(actionDataAgent.updateCreate).toBeCalledWith(expect.objectContaining(mocks.action))
  expect(actionDataAgent.updateStatus).toBeCalledWith(
    mocks.action.staticId,
    ActionStatus.Processed,
    mocks.action.sentAt
  )
}
