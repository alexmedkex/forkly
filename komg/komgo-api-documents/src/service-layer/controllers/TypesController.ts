import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, validateRequest, HttpException } from '@komgo/microservice-config'
import { Body, Controller, Delete, Get, Patch, Post, Query, Route, Security, Tags, Response } from 'tsoa'

import CategoryDataAgent from '../../data-layer/data-agents/CategoryDataAgent'
import TypeDataAgent from '../../data-layer/data-agents/TypeDataAgent'
import { IType } from '../../data-layer/models/type'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { TypeCreateRequest, TypeUpdateRequest } from '../request/type'
import { convertFullType, convertFullTypes, convertType } from '../responses/converters'
import { ITypeResponse } from '../responses/type'
import { IFullTypeResponse } from '../responses/type/IFullTypeResponse'

import ControllerUtils from './utils'

/**
 * Types controller.
 * @export
 * @class TypesController
 * @extends {Controller}
 */
@Tags('Types')
@Route('/products')
@provideSingleton(TypesController)
export class TypesController extends Controller {
  constructor(
    @inject(TYPES.CategoryDataAgent) private readonly categoryDataAgent: CategoryDataAgent,
    @inject(TYPES.TypeDataAgent) private readonly typeDataAgent: TypeDataAgent,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils
  ) {
    super()
  }

  /**
   * Creates a new type of document
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param newTypeRequest New type definition
   */
  @Response<HttpException>('409', 'Type already exists')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Post('{productId}/types')
  public async CreateNewType(productId: string, @Body() newTypeRequest: TypeCreateRequest): Promise<ITypeResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    await validateRequest(TypeCreateRequest, newTypeRequest)
    try {
      const newType = this.convertToModel(productId, newTypeRequest)
      const createdType = await this.typeDataAgent.create(productId, newType)
      return convertType(createdType)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Retrieve a type definition by type ID
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param typeId Identifier of the type (unique)
   */
  @Response<HttpException>('404', 'Type does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('signedIn')
  @Get('{productId}/types/{typeId}')
  public async GetTypeById(productId: string, typeId: string): Promise<IFullTypeResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const type = await this.typeDataAgent.getById(productId, typeId)
    if (type != null) {
      return convertFullType(type)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Type not found')
    }
  }

  /**
   * Retrieve types from a given category
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param categoryId Category identifier
   */
  @Response<HttpException>('404', 'Category ID does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('signedIn')
  @Get('{productId}/types')
  public async GetTypesInCategory(
    productId: string,
    @Query('category-id') categoryId?: string
  ): Promise<IFullTypeResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)

    if (!categoryId) {
      const allTypes = await this.typeDataAgent.getAllByProduct(productId)
      return convertFullTypes(allTypes)
    }

    // throws 404 if category does not exist
    await this.verifyCategoryExists(productId, categoryId)

    const types = await this.typeDataAgent.getAllInCategory(productId, categoryId)
    return convertFullTypes(types)
  }

  /**
   * Updates a type definition
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param update Update definition
   */
  @Response<HttpException>(404, 'Type does not exist')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Patch('{productId}/types')
  public async Update(productId: string, @Body() update: TypeUpdateRequest): Promise<ITypeResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    await validateRequest(TypeUpdateRequest, update)
    try {
      const updatedType = await this.typeDataAgent.update(productId, update as IType)
      return convertType(updatedType)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Deletes a type by type identifier
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param typeId Identifier of the type
   */
  @Response<HttpException>(404, 'Type does not exist')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Delete('{productId}/types/{typeId}')
  public async Delete(productId: string, typeId: string): Promise<void> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      await this.typeDataAgent.delete(productId, typeId)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  private convertToModel(productId: string, request: TypeCreateRequest): IType {
    const type = {
      id: undefined,
      productId,
      categoryId: request.categoryId,
      name: request.name,
      fields: request.fields ? request.fields.map(f => f) : request.fields,
      predefined: false
    }

    return type as IType
  }

  private async verifyCategoryExists(productId: string, categoryId: string) {
    const category = await this.categoryDataAgent.getById(productId, categoryId)
    if (!category) {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Category not found')
    }
  }
}
