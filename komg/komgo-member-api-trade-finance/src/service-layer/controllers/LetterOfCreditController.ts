import {
  Controller,
  Tags,
  Route,
  Body,
  Post,
  Query,
  Response,
  SuccessResponse,
  Request,
  Get,
  Path,
  Header,
  Security
} from 'tsoa'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { LetterOfCreditService } from '../../business-layer/letter-of-credit/services/LetterOfCreditService'
import {
  ILetterOfCredit,
  LETTER_OF_CREDIT_BASE_SCHEMA,
  LetterOfCreditType,
  IDataLetterOfCredit,
  IDataLetterOfCreditBase,
  TEMPLATE_INSTANCE_SCHEMA,
  DATA_LETTER_OF_CREDIT_BASE_SCHEMA_DEFINITION,
  ILetterOfCreditBase,
  LetterOfCreditStatus,
  DATA_LETTER_OF_CREDIT_ISSUANCE_SCHEMA,
  DATA_LETTER_OF_CREDIT_BASE_SCHEMA,
  DATA_LETTER_OF_CREDIT_TEMPLATE_SCHEMA,
  templateIsValid
} from '@komgo/types'
import { HttpException, toValidationErrors } from '@komgo/microservice-config'
import { HttpServerMessages } from '../utils/HttpConstants'
import { generateHttpException } from '../utils/ErrorHandling'
import * as Ajv from 'ajv'
import { ValidationError } from '../../data-layer/data-agents/utils'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'
import { getLogger } from '@komgo/logging'
import * as express from 'express'
import getUser from '../../business-layer/util/getUser'
import decode from '../../middleware/utils/decode'
import Uploader from '../utils/Uploader'
import IUser from '../../business-layer/IUser'
import { IFile } from '../../business-layer/types/IFile'
import { IPaginate } from '../responses/IPaginate'
import { queryStringParser } from './queryParser'

@Tags('LetterOfCredit')
@Route('letterofcredit')
@provideSingleton(LetterOfCreditController)
export class LetterOfCreditController extends Controller {
  private readonly logger = getLogger('LetterOfCreditController')
  private readonly ajv = new Ajv({ allErrors: true })
    .addSchema(LETTER_OF_CREDIT_BASE_SCHEMA.valueOf())
    .addSchema(TEMPLATE_INSTANCE_SCHEMA.valueOf())
    .addSchema(DATA_LETTER_OF_CREDIT_BASE_SCHEMA_DEFINITION.valueOf())

  constructor(
    @inject(TYPES.LetterOfCreditService) private readonly letterOfCreditService: LetterOfCreditService,
    @inject(TYPES.Uploader) private readonly uploader: Uploader
  ) {
    super()
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Post()
  @SuccessResponse(201, 'Created')
  public async create(
    @Body() letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase>
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    const valid = this.ajv.validate(LETTER_OF_CREDIT_BASE_SCHEMA.valueOf(), letterOfCredit)
    if (!valid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateLetterOfCreditValidationError,
        'Invalid Letter of Credit',
        errors
      )
      throw generateHttpException(new ValidationError('Invalid LetterOfCredit', errors))
    }
    const dataValid = this.ajv.validate(
      DATA_LETTER_OF_CREDIT_BASE_SCHEMA_DEFINITION.valueOf(),
      letterOfCredit.templateInstance.data
    )
    if (!dataValid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateLetterOfCreditValidationError,
        'Invalid Letter of Credit Data',
        errors
      )
      throw generateHttpException(new ValidationError('Invalid LetterOfCredit data', errors))
    }

    if (!templateIsValid(letterOfCredit.templateInstance.template, DATA_LETTER_OF_CREDIT_TEMPLATE_SCHEMA)) {
      throw generateHttpException(new ValidationError('Invalid template'))
    }

    try {
      const createdLetterOfCredit = await this.letterOfCreditService.create(letterOfCredit)
      this.setStatus(201)
      return createdLetterOfCredit
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'readWrite'])
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Post(`{staticId}/issue`)
  public async issue(
    @Path() staticId: string,
    @Header('Authorization') jwt: string,
    @Request() request: express.Request
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    this.logger.info(`Issuing lc`, staticId)
    const user: IUser = getUser(decode(jwt))
    const formData = await this.uploader.resolveMultipartData<ILetterOfCreditBase<IDataLetterOfCreditBase>>(
      request,
      'extraData'
    )
    const letterOfCreditBase = formData.data

    const validLetterOfCreditBase = this.ajv.validate(LETTER_OF_CREDIT_BASE_SCHEMA.valueOf(), letterOfCreditBase)
    let errors = this.ajv.errors ? this.ajv.errors : []

    if (!validLetterOfCreditBase) {
      const validationErrors = toValidationErrors(errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateLetterOfCreditValidationError,
        'Invalid Letter of Credit',
        validationErrors
      )
      throw generateHttpException(new ValidationError('Invalid LetterOfCredit', validationErrors))
    }

    if (!templateIsValid(letterOfCreditBase.templateInstance.template, DATA_LETTER_OF_CREDIT_TEMPLATE_SCHEMA)) {
      throw generateHttpException(new ValidationError('Invalid template'))
    }

    const validLetterOfCreditData = this.ajv.validate(
      DATA_LETTER_OF_CREDIT_BASE_SCHEMA,
      letterOfCreditBase.templateInstance.data
    )
    errors = this.ajv.errors ? [...errors, ...this.ajv.errors] : errors

    const validIssuanceData = this.ajv.validate(
      DATA_LETTER_OF_CREDIT_ISSUANCE_SCHEMA,
      letterOfCreditBase.templateInstance.data
    )
    errors = this.ajv.errors ? [...errors, ...this.ajv.errors] : errors

    if (!validIssuanceData || !validLetterOfCreditData) {
      const validationErrors = toValidationErrors(errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateLetterOfCreditValidationError,
        'Invalid Letter of Credit data',
        validationErrors
      )
      throw generateHttpException(new ValidationError('Invalid LetterOfCredit data', validationErrors))
    }
    try {
      const file: IFile = formData.file
      const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = await this.letterOfCreditService.issue(
        staticId,
        letterOfCreditBase,
        file,
        user
      )
      return letterOfCredit
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'readWrite'])
  @Response<HttpException>('400', HttpServerMessages.BadRequest)
  @Response<HttpException>('500', HttpServerMessages.InternalServerError)
  @Post(`{staticId}/rejectrequest`)
  public async rejectRequest(
    @Path() staticId: string,
    @Body() letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>
  ): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    this.logger.info(`Rejecting request lc`, staticId)
    const valid = this.ajv.validate(LETTER_OF_CREDIT_BASE_SCHEMA.valueOf(), letterOfCreditBase)
    if (!valid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.warn(
        ErrorCode.ValidationHttpSchema,
        ErrorNames.CreateLetterOfCreditValidationError,
        'Invalid Letter of Credit',
        errors
      )
      throw generateHttpException(new ValidationError('Invalid LetterOfCredit', errors))
    }
    try {
      const letterOfCredit: ILetterOfCredit<IDataLetterOfCredit> = await this.letterOfCreditService.rejectRequest(
        staticId,
        letterOfCreditBase
      )
      return letterOfCredit
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Get(`{staticId}`)
  public async get(@Path() staticId: string): Promise<ILetterOfCredit<IDataLetterOfCredit>> {
    try {
      const letterOfCredit = await this.letterOfCreditService.get(staticId)
      return letterOfCredit
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  @Get(`type/{type}`)
  public async getAll(@Path() type: string): Promise<Array<ILetterOfCredit<IDataLetterOfCredit>>> {
    try {
      if (
        !Object.keys(LetterOfCreditType)
          .map(key => key.toUpperCase())
          .includes(type.toUpperCase())
      ) {
        throw new ValidationError(`Provided letter of credit type is not valid: ${type}`, {})
      }
      const letterOfCreditType = this.findLcTypeByString(type)
      const lettersOfCredit: Array<ILetterOfCredit<IDataLetterOfCredit>> = await this.letterOfCreditService.getAll(
        letterOfCreditType
      )
      return lettersOfCredit
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Get()
  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Security('withPermission', ['tradeFinance', 'reviewLCApplication', 'read'])
  @Security('withPermission', ['tradeFinance', 'reviewIssuedLC', 'read'])
  public async find(
    @Query('filter') filter = {},
    @Request() request: express.Request
  ): Promise<IPaginate<Array<ILetterOfCredit<IDataLetterOfCredit>>>> {
    const { query, projection, options } = queryStringParser(request)
    options.skip = options.skip || 0
    options.limit = options.limit || 200
    const { limit, skip } = options
    this.logger.info('LetterOfCreditController find:', { query, projection, options })
    try {
      // TODO LS decide what kind of restrictions
      // await validateMongoFilter(JSON.stringify(query), SBLCRequest, { tradeId: { sourceId: ['$in'] } })
      const items: Array<ILetterOfCredit<IDataLetterOfCredit>> = await this.letterOfCreditService.find(
        query,
        projection,
        options
      )
      const total: number = await this.letterOfCreditService.count(query)

      return {
        limit,
        skip,
        items: items.filter(i => ![LetterOfCreditStatus.Requested_Verification_Pending].includes(i.status)),
        total
      }
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  private findLcTypeByString(type: string): LetterOfCreditType {
    const keyFound = Object.keys(LetterOfCreditType).find(key => {
      return key.toUpperCase() === type.toUpperCase()
    })
    if (keyFound) {
      return LetterOfCreditType[keyFound]
    }
    return undefined
  }
}
