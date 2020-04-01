import { ErrorCode } from '@komgo/error-utilities'
import jwt from 'jsonwebtoken'

import { ErrorName } from '../utils/ErrorName'

export class UserAuthError extends Error {
  errorCode: ErrorCode
  errorName: string
  token: string
  constructor(errorCode: ErrorCode, errorName: string, token: string) {
    super()
    this.errorCode = errorCode
    this.errorName = errorName
    this.token = token
  }
}

export function getUserId(token: string): string {
  const data = jwt.decode(token)
  if (!data) {
    throw new UserAuthError(ErrorCode.Authorization, ErrorName.invalidJWTToken, token)
  }
  const userId = data.sub
  if (typeof userId !== 'string') {
    throw new UserAuthError(ErrorCode.Authorization, ErrorName.invalidSub, token)
  }
  return userId
}
