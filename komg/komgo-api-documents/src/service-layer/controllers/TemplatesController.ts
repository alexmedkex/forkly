import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils, validateRequest, HttpException } from '@komgo/microservice-config'
import { Body, Controller, Delete, Get, Patch, Path, Post, Route, Security, Tags, Response } from 'tsoa'

import TemplateDataAgent from '../../data-layer/data-agents/TemplateDataAgent'
import { ITemplate } from '../../data-layer/models/template'
import { MeterOutcome } from '../../infrastructure/metrics/metrics'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IClassType } from '../../utils'
import { CreateTemplateRequest, UpdateTemplateRequest } from '../request/template'
import { convertFullTemplate, convertTemplate } from '../responses/converters'
import { ITemplateResponse } from '../responses/template'
import { IFullTemplateResponse } from '../responses/template/IFullTemplateResponse'

import ControllerUtils from './utils'

/**
 * Templates controller.
 * @export
 * @class TemplatesController
 * @extends {Controller}
 */
@Tags('Templates')
@Route('products')
@provideSingleton(TemplatesController)
export class TemplatesController extends Controller {
  constructor(
    @inject(TYPES.TemplateDataAgent) private readonly templateDataAgent: TemplateDataAgent,
    @inject(TYPES.ControllerUtils) private readonly controllerUtils: ControllerUtils
  ) {
    super()
  }

  /**
   * Create new template
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param newTemplate Template definition to be created and stored
   */
  @MeterOutcome('templateCreated')
  @Response<HttpException>(400, 'Request body is malformed')
  @Response<HttpException>(409, 'Template already exists')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDocReqTemp'])
  @Post('{productId}/templates')
  public async CreateTemplate(
    @Path('productId') productId: string,
    @Body() newTemplate: CreateTemplateRequest
  ): Promise<ITemplateResponse> {
    await this.validateTemplateRequest(productId, newTemplate, CreateTemplateRequest)

    try {
      const createdTemplate = await this.templateDataAgent.create(productId, newTemplate as ITemplate)
      return convertTemplate(createdTemplate)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Retrieve a template by a given product ID and template ID
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param templateId Identifier of the template
   */
  @MeterOutcome('templateRetrieved')
  @Response<HttpException>(404, 'Requested template does not exist')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDocReqTemp'])
  @Get('{productId}/templates/{templateId}')
  public async GetTemplateById(
    @Path('productId') productId: string,
    @Path('templateId') templateId: string
  ): Promise<IFullTemplateResponse> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const template = await this.templateDataAgent.getById(productId, templateId)
    if (template != null) {
      return convertFullTemplate(template)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.ValidationHttpContent, 'Template not found')
    }
  }

  /**
   * Retrieve all templates for a given product
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   */
  @MeterOutcome('templatesRetrieved')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDocReqTemp'])
  @Get('{productId}/templates')
  public async GetTemplatesByProduct(@Path('productId') productId: string): Promise<IFullTemplateResponse[]> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    const templates = await this.templateDataAgent.getAllByProduct(productId)
    return templates.map(template => convertFullTemplate(template))
  }

  /**
   * Update an existing template with a new definition
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param update Update definition for an existing template
   */
  @MeterOutcome('templateUpdated')
  @Response<HttpException>(404, 'Requested template does not exist')
  @Response<HttpException>(409, 'Template already exists')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDocReqTemp'])
  @Patch('{productId}/templates')
  public async UpdateTemplate(
    @Path('productId') productId: string,
    @Body() update: UpdateTemplateRequest
  ): Promise<ITemplateResponse> {
    await this.validateTemplateRequest(productId, update, UpdateTemplateRequest)

    try {
      const updatedTemplate = await this.templateDataAgent.update(productId, update as ITemplate)
      return convertTemplate(updatedTemplate)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  /**
   * Delete a template given a product ID and template ID
   * @param productId Identifier of the product (e.g.: kyc, tradeFinance...)
   * @param templateId Identifier of the template
   */
  @MeterOutcome('templateDeleted')
  @Response<HttpException>(404, 'Requested template does not exist')
  @Response<HttpException>(422, 'Product ID does not exist')
  @Security('withPermission', ['kyc', 'manageDocReqTemp'])
  @Delete('{productId}/templates/{templateId}')
  public async DeleteTemplate(productId: string, templateId: string): Promise<void> {
    // throws 422 if product ID is unknown
    await this.controllerUtils.validateProductId(productId)
    try {
      await this.templateDataAgent.delete(productId, templateId)
    } catch (error) {
      // may throw 404 if entity was not found
      // may throw 409 if entity is duplicated
      // may throw 422 if entity was considered invalid
      this.controllerUtils.processDataLayerException(error)
    }
  }

  private async validateTemplateRequest(
    productId: string,
    request: CreateTemplateRequest | UpdateTemplateRequest,
    type: IClassType<CreateTemplateRequest> | IClassType<UpdateTemplateRequest>
  ) {
    await this.controllerUtils.validateProductId(productId)
    await validateRequest(type, request)
    await this.controllerUtils.validateDefaultTypes(productId, request.types)
  }
}
