import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { injectable } from 'inversify'
import * as uuid from 'uuidv4'

import { ISessionUpdateMongo } from '../../service-layer/requests/session'
import { ISessionResponse } from '../../service-layer/responses/session'
import { Session } from '../models/Session'

const { notFoundException } = ErrorUtils

export interface ISessionDataAgent {
  createSession(staticId: string): Promise<ISessionResponse>
  getSession(sessionId: string): Promise<ISessionResponse>
  updateSession(sessionId: string, sessionData: ISessionUpdateMongo): Promise<ISessionResponse>
  putSession(staticId: string, sessionId: string, sessionData: ISessionUpdateMongo): Promise<ISessionResponse>
}

@injectable()
export default class SessionDataAgent implements ISessionDataAgent {
  async createSession(staticId: string): Promise<ISessionResponse> {
    return Session.create({ staticId, sessionId: uuid() })
  }

  async getSession(sessionId: string): Promise<ISessionResponse> {
    const session = await Session.findOne({ sessionId })
    if (!session) {
      throw notFoundException(ErrorCode.ValidationHttpContent, 'Session not found')
    }
    return session
  }

  async updateSession(sessionId: string, sessionData: ISessionUpdateMongo): Promise<ISessionResponse> {
    const session = await Session.findOne({ sessionId })
    if (!session) {
      throw notFoundException(ErrorCode.ValidationHttpContent, 'Session not found')
    }
    return Session.findOneAndUpdate({ sessionId }, { $set: sessionData }, { new: true })
  }

  async putSession(staticId: string, sessionId: string, sessionData: ISessionUpdateMongo): Promise<ISessionResponse> {
    return Session.findOneAndUpdate({ sessionId }, { $set: { staticId, sessionId, ...sessionData } }, { upsert: true })
  }
}
