import { ErrorCode } from '@komgo/error-utilities'
import { decode } from 'jsonwebtoken'

import { ErrorName } from './ErrorName'

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

const getUserId = (authHeader: string): string => {
  const token = authHeader.substring('Bearer '.length)
  const data = decode(token)
  if (!data) {
    throw new UserAuthError(ErrorCode.Authorization, ErrorName.InvalidJWTToken, token)
  }
  const userId = data.sub
  if (typeof userId !== 'string') {
    throw new UserAuthError(ErrorCode.Authorization, ErrorName.InvalidSub, token)
  }
  return userId
}

export default getUserId
