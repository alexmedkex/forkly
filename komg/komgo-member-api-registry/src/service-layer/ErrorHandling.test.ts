import 'reflect-metadata'
import { generateHttpException } from './ErrorHandling'
import { BlockchainConnectionException, ContentNotFoundException } from '../exceptions'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'

describe('generateHttpException', () => {
  it('should return the correct exception', () => {
    const exception = generateHttpException(new BlockchainConnectionException('test'))
    const exception2 = generateHttpException(new ContentNotFoundException('test'))

    expect(exception).toEqual(ErrorUtils.internalServerException(ErrorCode.BlockchainConnection))
    expect(exception2).toEqual(ErrorUtils.noContentException(ErrorCode.DatabaseMissingData, 'test'))
  })
})
