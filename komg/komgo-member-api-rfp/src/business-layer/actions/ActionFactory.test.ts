import { IActionBase, ActionType, ActionStatus } from '@komgo/types'
import 'reflect-metadata'

import { ActionFactory } from './ActionFactory'

describe('ActionFactory', () => {
  const COMPANY_STATIC_ID = '123'
  const RFP_ID = 'rfp123'
  const RECIPIENT_ID = 'recipient123'

  let actionFactory: ActionFactory

  beforeEach(() => {
    actionFactory = new ActionFactory(COMPANY_STATIC_ID)
  })

  it('should create a request action', async () => {
    const action: IActionBase = actionFactory.createRequestActionBase(RFP_ID, RECIPIENT_ID)

    assertActionIsValid(action, ActionType.Request)
  })

  it('should create a response action', async () => {
    const mockResponseData = { data: 'mockdata' }

    const action: IActionBase = actionFactory.createActionBase(
      RFP_ID,
      ActionType.Response,
      RECIPIENT_ID,
      mockResponseData
    )

    assertActionIsValid(action, ActionType.Response, mockResponseData)
  })

  function assertActionIsValid(action: IActionBase, actionType: ActionType, data?: any) {
    expect(action.rfpId).toBe(RFP_ID)
    expect(action.recipientStaticID).toBe(RECIPIENT_ID)
    expect(action.senderStaticID).toBe(COMPANY_STATIC_ID)
    expect(action.status).toBe(ActionStatus.Created)
    expect(action.type).toBe(actionType)
    expect(action.data).toBe(data)
  }
})
