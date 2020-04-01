import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { injectable } from 'inversify'

import { Jti } from '../models/Jti'

const { forbiddenException } = ErrorUtils

export interface IJtiDataAgent {
  createJti(jti: string): Promise<void>
}

@injectable()
export default class JtiDataAgent implements IJtiDataAgent {
  async createJti(jti: string): Promise<void> {
    try {
      await Jti.create({ jti })
    } catch (e) {
      throw forbiddenException(ErrorCode.ValidationHttpContent, 'Duplicate JTI claim')
    }
  }
}
