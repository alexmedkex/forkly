import { ErrorCode } from '@komgo/error-utilities'
import { validateRequest, ErrorUtils, HttpException } from '@komgo/microservice-config'
import { Body, Controller, Delete, Get, Patch, Post, Route, Security, Tags, Response } from 'tsoa'

import CategoryDataAgent from '../../data-layer/data-agents/CategoryDataAgent'
import { ICategory } from '../../data-layer/models/category'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IClassType } from '../../utils'
import { CategoryCreateRequest, CategoryUpdateRequest } from '../request/category'
import { ICategoryResponse } from '../responses/category'
import { IFullCategoryResponse } from '../responses/category/IFullCategoryResponse'
import { convertCategory, convertFullCategory } from '../responses/converters'

import ControllerUtils from './utils'

/**
 * Categories controller.
 * @export
 * @class CategoriesController
 * @extends {Controller}
 */
@Tags('Categories')
@Route('/products')
@provideSingleton(CategoriesController)
export class CategoriesController extends Controller {
  constructor(
    @inject(TYPES.CategoryDataAgent) private readonly categoryDataAgent: CategoryDataAgent,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils
  ) {
    super()
  }

  /**
   * Creates new category for a given product
   * @param productId Identifier of the product in each new category belongs to (e.g.: kyc, tradeFinance...)
   * @param newCategory Spec of the new category
   */
  @Response<HttpException>('404', 'Category ID does not exist')
  @Response<HttpException>('409', 'Category already exists')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Post('{productId}/categories')
  public async CreateNewCategory(
    productId: string,
    @Body() newCategory: CategoryCreateRequest
  ): Promise<ICategoryResponse> {
    await this.validateRequest(productId, CategoryCreateRequest, newCategory)
    try {
      const createdCategory = await this.categoryDataAgent.create(productId, newCategory as ICategory)
      return convertCategory(createdCategory)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Retrieves all information related to a category
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param categoryId Identifier of the category
   */
  @Response<HttpException>('404', 'Category ID does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('signedIn')
  @Get('{productId}/categories/{categoryId}')
  public async GetCategoryById(productId: string, categoryId: string): Promise<IFullCategoryResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const category = await this.categoryDataAgent.getById(productId, categoryId)
    if (category != null) {
      return convertFullCategory(category)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Category not found')
    }
  }

  /**
   * Retrieves all categories of a given product
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   */
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('signedIn')
  @Get('{productId}/categories')
  public async GetCategories(productId: string): Promise<IFullCategoryResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const categories = await this.categoryDataAgent.getAllByProduct(productId)
    return categories.map(convertFullCategory)
  }

  /**
   * Updates the name of the category
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param update Update object which should contain category id and the new category name
   */
  @Response<HttpException>('404', 'Category ID does not exist')
  @Response<HttpException>('409', 'Category already exists')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Patch('{productId}/categories')
  public async Update(productId: string, @Body() update: CategoryUpdateRequest): Promise<ICategoryResponse> {
    await this.validateRequest(productId, CategoryUpdateRequest, update)
    try {
      const updatedCategory = await this.categoryDataAgent.update(productId, update as ICategory)
      return convertCategory(updatedCategory)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Deletes a category by id from a given product
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param categoryId Identifier of the category
   */
  @Response<HttpException>('404', 'Category ID does not exist')
  @Response<HttpException>('422', 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Delete('{productId}/categories/{categoryId}')
  public async Delete(productId: string, categoryId: string): Promise<void> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      await this.categoryDataAgent.delete(productId, categoryId)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  private async validateRequest<T>(productId: string, type: IClassType<T>, category: T) {
    await this.controllerUtils.validateProductId(productId)
    await validateRequest(type, category)
  }
}
