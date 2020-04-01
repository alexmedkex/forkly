import 'reflect-metadata'

// tslint:disable-next-line
import validator from 'validator'

import { IAction, buildFakeActionExtended, ActionType, ActionStatus } from '@komgo/types'
import { Action } from '../models/mongo/Action'
import { ActionDataAgent } from './ActionDataAgent'

const findMock = jest.fn()
const findOneMock = jest.fn()
const updateOneMock = jest.fn()
const createMock = jest.fn()

describe('ActionDataAgent', () => {
  let actionData: IAction

  let mockActionDocument: jest.Mocked<any>
  let actionDataAgent: ActionDataAgent
  beforeEach(() => {
    jest.resetAllMocks()
    Action.create = createMock
    Action.find = findMock
    Action.findOne = findOneMock
    Action.updateOne = updateOneMock
    actionDataAgent = new ActionDataAgent()
    actionData = buildFakeActionExtended(ActionType.Request, true)

    mockActionDocument = {
      // this is used in to pass back a pojo rather than the MongooseDocument
      toObject: jest.fn().mockImplementation(() => {
        return {
          ...actionData
        }
      })
    }
  })

  it('should return the saved object with a static ID', async () => {
    createMock.mockResolvedValue(mockActionDocument)

    const savedData = await actionDataAgent.create(actionData)
    expect(savedData).toEqual({ ...actionData })

    // check static ID was created
    const dataSaved = createMock.mock.calls[0][0]
    expect(validator.isUUID(dataSaved.staticId)).toBeTruthy()
  })

  it('should return action data for the given staticId', async () => {
    const mockQuery = { exec: jest.fn().mockResolvedValue(mockActionDocument) }
    findOneMock.mockReturnValue(mockQuery)

    const savedData = await actionDataAgent.findOneByStaticId('mockId')
    expect(savedData).toEqual({ ...actionData })
  })

  it('should return action data for the given RFPId and ActionType', async () => {
    findMock.mockReturnValue({ exec: async () => [mockActionDocument] })

    const savedData = await actionDataAgent.findByRFPIdAndActionType(actionData.rfpId, ActionType.Request)

    expect(savedData[0]).toEqual(actionData)
    expect(findMock).toBeCalledWith({ rfpId: actionData.rfpId, type: ActionType.Request })
  })

  it('should return an empty array if no actions found', async () => {
    findMock.mockReturnValue({ exec: async () => [mockActionDocument] })

    const savedData = await actionDataAgent.findByRFPIdAndActionType(actionData.rfpId, ActionType.Request)

    expect(savedData[0]).toEqual(actionData)
    expect(findMock).toBeCalledWith({ rfpId: actionData.rfpId, type: ActionType.Request })
  })

  it('should return action data for the given RFPId, ActionType, Status', async () => {
    findMock.mockReturnValue({ exec: async () => [mockActionDocument] })

    const savedData = await actionDataAgent.findByRFPIdAndActionType(
      actionData.rfpId,
      ActionType.Response,
      ActionStatus.Failed
    )

    expect(savedData[0]).toEqual(actionData)
    expect(findMock).toBeCalledWith({
      rfpId: actionData.rfpId,
      type: ActionType.Response,
      status: ActionStatus.Failed
    })
  })

  it('should return actions matching the RFP ID, ActionTypes and sender ID', async () => {
    findMock.mockReturnValue({ exec: async () => [mockActionDocument] })
    const senderId = 'senderStaticId'

    const savedData = await actionDataAgent.findActionsByRFPIdAndActionTypes(
      actionData.rfpId,
      [ActionType.Accept, ActionType.Decline],
      ActionStatus.Processed,
      senderId
    )

    expect(Action.find).toBeCalledWith({
      rfpId: actionData.rfpId,
      $or: [{ type: ActionType.Accept }, { type: ActionType.Decline }],
      status: ActionStatus.Processed,
      senderStaticID: senderId
    })
    expect(savedData).toEqual([actionData])
  })

  it('should update Action with status', async () => {
    const staticId = 'staticId'
    const sentAt = '2018-343'
    const mockQuery = { exec: jest.fn().mockResolvedValue(mockActionDocument) }
    updateOneMock.mockReturnValue(mockQuery)

    await actionDataAgent.updateStatus(staticId, ActionStatus.Failed, sentAt)

    expect(updateOneMock).toBeCalledWith({ staticId }, { $set: { status: ActionStatus.Failed, sentAt } })
  })
})
