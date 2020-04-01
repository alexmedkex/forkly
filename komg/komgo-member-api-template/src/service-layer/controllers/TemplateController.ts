import { validateMongoFilter } from '@komgo/data-access'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { HttpException, ErrorUtils } from '@komgo/microservice-config'
import { ITemplate, TEMPLATE_BASE_SCHEMA, TEMPLATE_EXTENDED_SCHEMA, ITemplateBase, TemplateOrigin } from '@komgo/types'
import * as Ajv from 'ajv'
import * as jwtDecoder from 'jsonwebtoken'
import { decompressFromBase64 } from 'lz-string'
import { parse } from 'qs'
import {
  Body,
  Controller,
  Get,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Response,
  Path,
  Put,
  Delete,
  Query,
  Header
} from 'tsoa'

import { ErrorNames, ContentNotFoundException } from '../../exceptions'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IPaginate } from '../responses/IPaginate'
import { TemplateService } from '../services/TemplateService'
import { generateHttpException } from '../utils/ErrorHandling'
import { HttpServerMessages } from '../utils/HttpConstants'
import { ITokenUser } from '../utils/ITokenUser'
import { toValidationErrors, ValidationError } from '../utils/validationErrors'

import { queryParser } from './queryParser'

const TEMPLATE_NOT_FOUND = 'Template not found'

@Tags('Template')
@Route('templates')
@provideSingleton(TemplateController)
export class TemplateController extends Controller {
  private readonly logger = getLogger('TemplateController')
  private readonly ajv = new Ajv({ allErrors: true })
    .addSchema(TEMPLATE_BASE_SCHEMA.valueOf())
    .addSchema(TEMPLATE_EXTENDED_SCHEMA.valueOf())

  constructor(@inject(TYPES.TemplateService) private templateService: TemplateService) {
    super()
  }

  @Response<HttpException>('422', 'Failed to validate template request data')
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['template', 'manageTemplates', 'crud'])
  @Post()
  @SuccessResponse(201, 'Created')
  public async create(@Header('Authorization') jwt: string, @Body() template: ITemplateBase): Promise<ITemplate> {
    this.logger.info('Creating template')
    const tokenUser: ITokenUser = this.decodeJwt(jwt)
    const valid = this.ajv.validate((TEMPLATE_BASE_SCHEMA.valueOf() as any).$id, template)
    if (!valid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateTemplateValidationError,
        'invalid Template',
        errors
      )
      throw generateHttpException(new ValidationError('Invalid Template', errors))
    }
    try {
      const createdTemplate = await this.templateService.createTemplate(template, tokenUser)
      this.setStatus(201)
      return createdTemplate
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['template', 'manageTemplates', 'crud'])
  @Put(`{staticId}`)
  @SuccessResponse(204, 'Updated')
  public async update(@Header('Authorization') jwt: string, @Path() staticId: string, @Body() template: ITemplateBase) {
    this.logger.info('updating template', { staticId })
    const tokenUser: ITokenUser = this.decodeJwt(jwt)

    const valid = this.ajv.validate((TEMPLATE_BASE_SCHEMA.valueOf() as any).$id, template)
    if (!valid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateTemplateValidationError,
        'invalid Template',
        errors
      )
      throw generateHttpException(new ValidationError('Invalid Template', errors))
    }
    try {
      await this.checkTemplateOrigin(staticId)

      const updatedTemplate = await this.templateService.updateTemplate(staticId, template, tokenUser)
      if (!updatedTemplate) {
        const message = `Template ${staticId} does not exist`
        this.logger.warn(ErrorCode.DatabaseMissingData, ErrorNames.TemplateControllerTemplateNotFound, message)
        throw generateHttpException(new ContentNotFoundException(TEMPLATE_NOT_FOUND))
      }
      this.setStatus(204)
      return updatedTemplate
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['template', 'manageTemplates', 'crud'])
  @Delete(`{staticId}`)
  @SuccessResponse(204, 'Updated')
  public async delete(@Path() staticId: string) {
    // TODO: Once api gateway is integrated @Header('Authorization') jwt: string
    this.logger.info('soft deleting template', { staticId })
    try {
      await this.checkTemplateOrigin(staticId)
      const deletedTemplate = await this.templateService.softDeleteTemplate(staticId)
      if (!deletedTemplate) {
        const message = `Template ${staticId} does not exist`
        this.logger.warn(ErrorCode.DatabaseMissingData, ErrorNames.TemplateControllerTemplateNotFound, message)
        throw generateHttpException(new ContentNotFoundException(TEMPLATE_NOT_FOUND))
      }
      this.setStatus(204)
      return deletedTemplate
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['template', 'manageTemplates', 'read'])
  @Get(`{staticId}`)
  public async get(@Path() staticId: string): Promise<ITemplate> {
    let result: ITemplate
    this.logger.info('getting Template', { staticId })
    try {
      result = await this.templateService.getTemplate(staticId)
    } catch (e) {
      throw generateHttpException(e)
    }

    if (!result) {
      const message = `Template ${staticId} does not exist`
      this.logger.warn(ErrorCode.DatabaseMissingData, ErrorNames.TemplateControllerTemplateNotFound, message)
      throw generateHttpException(new ContentNotFoundException(TEMPLATE_NOT_FOUND))
    }
    return result
  }

  @Security('withPermission', ['template', 'manageTemplates', 'read'])
  @Get()
  public async getAll(@Query('filter') filter = {}): Promise<IPaginate<ITemplate[]>> {
    let items: ITemplate[]
    const decompressed = Object.keys(filter).length === 0 ? filter : decompressFromBase64(filter)
    const { projection, options } = queryParser(parse(decompressed, { arrayLimit: 1000 }))
    const { limit, skip } = options
    this.logger.info('TemplateController find:', { projection, options })
    try {
      items = await this.templateService.getTemplates(projection, options)
      const total = await this.templateService.count()
      return {
        limit,
        skip,
        items,
        total
      }
    } catch (e) {
      throw generateHttpException(e)
    }
  }

  private async checkTemplateOrigin(staticId: string) {
    const template = await this.templateService.getTemplate(staticId)

    if (template && template.origin === TemplateOrigin.System) {
      this.logger.error(ErrorCode.ValidationInvalidOperation, ErrorNames.ModifyingSystemTemplate)
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationInvalidOperation,
        `Can't modify system template`
      )
    }
  }

  private decodeJwt(jwt: any): ITokenUser {
    const jwtDecoded = jwtDecoder.decode(jwt.replace('Bearer ', ''))
    return {
      name: jwtDecoded.name
    }
  }
}
