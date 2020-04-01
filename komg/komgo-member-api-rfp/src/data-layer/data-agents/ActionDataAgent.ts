import { getLogger } from '@komgo/logging'
import { IActionBase, IAction, ActionType, ActionStatus } from '@komgo/types'
import { injectable } from 'inversify'

import { Action } from '../models/mongo/Action'

import { logAndThrowMongoError, appendStaticId, toObject, toObjects } from './utils'

@injectable()
export class ActionDataAgent {
  private readonly logger = getLogger('ActionDataAgent')

  async create(actionBase: IActionBase): Promise<IAction> {
    try {
      const actionExtended = appendStaticId(actionBase) as IAction
      const action = await Action.create(actionExtended)
      return action ? action.toObject() : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async updateCreate(actionExtended: IAction): Promise<IAction> {
    try {
      const action = await Action.findOneAndUpdate({ staticId: actionExtended.staticId }, actionExtended, {
        upsert: true,
        new: true
      }).exec()
      return toObject(action)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async findOneByStaticId(staticId: string): Promise<IAction> {
    try {
      const action = await Action.findOne({ staticId }).exec()
      return toObject(action)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async findByRFPIdAndActionType(rfpId: string, type: ActionType, status?: ActionStatus): Promise<IAction[]> {
    try {
      const query: object = this.createFindQuery({ rfpId, type }, status)
      const actionDocuments = await Action.find(query).exec()
      return toObjects(actionDocuments)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async findLatestByRFPIdAndActionType(
    rfpId: string,
    type: ActionType,
    status?: ActionStatus,
    senderStaticID?: string,
    recipientStaticID?: string
  ): Promise<IAction> {
    try {
      const query: object = this.createFindQuery({ rfpId, type }, status, senderStaticID, recipientStaticID)
      const actionDocuments = await Action.find(query)
        .limit(1)
        .sort({ createdAt: -1 })
        .exec()
      return actionDocuments.length > 0 ? actionDocuments[0].toObject() : null
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async findActionsByRFPIdAndActionTypes(
    rfpId: string,
    actionTypes: ActionType[],
    status?: ActionStatus,
    senderStaticID?: string
  ): Promise<IAction[]> {
    const baseQuery = {
      rfpId,
      $or: this.createActionTypesQueryArray(actionTypes)
    }
    try {
      const query: object = this.createFindQuery(baseQuery, status, senderStaticID)
      const actionDocuments = await Action.find(query).exec()
      return toObjects(actionDocuments)
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  async updateStatus(staticId: string, status: ActionStatus, sentAt: string) {
    try {
      return await Action.updateOne({ staticId }, { $set: { status, sentAt } }).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error)
    }
  }

  private createActionTypesQueryArray(actionTypes: ActionType[]) {
    const actionTypeArr = []
    for (const actionType of actionTypes) {
      const actionTypeQuery = { type: actionType }
      actionTypeArr.push(actionTypeQuery)
    }
    return actionTypeArr
  }

  private createFindQuery(
    baseQuery: object,
    status?: ActionStatus,
    senderStaticID?: string,
    recipientStaticID?: string
  ) {
    let query = { ...baseQuery }
    if (status) {
      query = {
        ...query,
        status
      }
    }
    if (senderStaticID) {
      query = {
        ...query,
        senderStaticID
      }
    }
    if (recipientStaticID) {
      query = {
        ...query,
        recipientStaticID
      }
    }
    return query
  }
}
