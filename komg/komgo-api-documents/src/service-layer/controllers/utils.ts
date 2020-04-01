import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { injectable } from 'inversify'

import { IncomingRequestService } from '../../business-layer/services/IncomingRequestService'
import DuplicatedItem from '../../data-layer/data-agents/exceptions/DuplicatedItem'
import InvalidItem from '../../data-layer/data-agents/exceptions/InvalidItem'
import InvalidOperation from '../../data-layer/data-agents/exceptions/InvalidOperation'
import ItemNotFound from '../../data-layer/data-agents/exceptions/ItemNotFound'
import ProductDataAgent from '../../data-layer/data-agents/ProductDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import { IIncomingRequest } from '../../data-layer/models/incoming-request'
import IUserProfile from '../../infrastructure/api-users/IUserProfile'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { forEachAsyncParallel } from '../../utils'
import { ErrorName } from '../../utils/ErrorName'

@injectable()
export default class ControllerUtils {
  private readonly logger = getLogger('Controller Utils')

  constructor(
    @inject(TYPES.ProductDataAgent) private readonly productDataAgent: ProductDataAgent,
    @inject(TYPES.TypeDataAgent) private readonly typeDataAgent: TypeDataAgent,
    @inject(TYPES.UsersRegistryClient) private readonly usersClient,
    @inject(TYPES.IncomingRequestService) private readonly incomingRequestService: IncomingRequestService
  ) {}

  /**
   * Convert an exception thrown by a data-layer class into an HTTP error code
   * @param e error thrown from the data-layer
   * @throws error with an HTTP error code and message
   */
  public processDataLayerException(e: Error) {
    if (e instanceof DuplicatedItem) {
      throw ErrorUtils.conflictException(ErrorCode.ValidationHttpContent, e.message)
    }
    if (e instanceof ItemNotFound) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, e.message)
    }
    if (e instanceof InvalidItem || e instanceof InvalidOperation) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, e.message)
    }

    throw e
  }

  /**
   * Ensure that a given product ID is valid, i.e.: exists in the database.
   * @param productId Product ID to be validated
   */
  public async validateProductId(productId: string) {
    const products = await this.productDataAgent.getAll()
    const isValidProductId = products.some(p => p.id === productId)
    if (!isValidProductId) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Invalid product id', {
        productId: ['Invalid product id']
      })
    }
  }

  /**
   *
   * @param productId
   * @param typeId
   */
  public async validateTypeId(productId: string, typeId: string) {
    const types = await this.typeDataAgent.getAllByProduct(productId)
    const isValidTypeId = types.some(p => p.id === typeId)
    if (!isValidTypeId) {
      throw ErrorUtils.unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Invalid type id', {
        typeId: ['Invalid type id']
      })
    }
  }

  /**
   *
   * @param productId
   * @param requestId
   */
  public async validateRequestId(productId: string, requestId: string): Promise<IIncomingRequest> {
    const request: IIncomingRequest = await this.incomingRequestService.getBareById(productId, requestId)
    if (!request) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `Incoming request not found for productId ${productId} and requestId ${requestId}`
      )
    }
    return request
  }

  public async validateDefaultTypes(productId: string, types: string[]): Promise<void> {
    await forEachAsyncParallel(types, async typeId => {
      const type = await this.typeDataAgent.getById(productId, typeId)
      if (!type) {
        throw ErrorUtils.unprocessableEntityException(
          ErrorCode.ValidationHttpContent,
          `Type with id '${typeId}' does not exist`,
          {
            typeId: ['Type with this id does not exist']
          }
        )
      }
    })
  }

  public parseJSONParam(value: string, paramName: string): object {
    if (value) {
      try {
        return JSON.parse(value)
      } catch (error) {
        throw ErrorUtils.unprocessableEntityException(
          ErrorCode.ValidationHttpContent,
          `${paramName} is not in correct format`
        )
      }
    }
  }

  public async fetchUserIdByJwt(jwt: string): Promise<string> {
    try {
      const profile: IUserProfile = await this.usersClient.getUserProfile(jwt)
      return profile.id
    } catch (ue) {
      this.logger.error(ErrorCode.ConnectionMicroservice, ErrorName.UsersError, 'Failed to fetch current user by id', {
        errorMessage: ue.message
      })
    }

    return undefined
  }
}
