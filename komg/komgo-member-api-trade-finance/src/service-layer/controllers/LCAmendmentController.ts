import { getLogger } from '@komgo/logging'
import { Body, Controller, Get, Header, Path, Post, Query, Request, Route, Security, SuccessResponse } from 'tsoa'
import * as express from 'express'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import {
  ILCAmendment,
  ILCAmendmentRejection,
  ILCAmendmentBase,
  AMENDMENT_BASE_SCHEMA,
  AMENDMENT_EXTENDED_SCHEMA
} from '@komgo/types'
import IUser from '../../business-layer/IUser'
import getUser from '../../business-layer/util/getUser'
import decode from '../../middleware/utils/decode'
import { ILCAmendmentUseCase } from '../../business-layer/ILCAmendmentUseCase'
import { toValidationErrors, ValidationError } from '../../data-layer/data-agents/utils'
import { ILCAmendmentDataAgent } from '../../data-layer/data-agents'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { generateHttpException } from '../utils/ErrorHandling'
import { ErrorNames } from '../../exceptions/utils'
import { Metric, LCAmendmentControllerEndpoints } from '../../utils/Metrics'

const Ajv = require('ajv')
@Route('lc')
@provideSingleton(LCAmendmentController)
export class LCAmendmentController extends Controller {
  private logger = getLogger('LCAmendmentController')
  private ajv = new Ajv({ allErrors: true }).addSchema(AMENDMENT_BASE_SCHEMA).addSchema(AMENDMENT_EXTENDED_SCHEMA)

  constructor(
    @inject(TYPES.LCAmendmentUseCase)
    private lcAmendmentUseCase: ILCAmendmentUseCase,
    @inject(TYPES.LCAmendmentDataAgent)
    private lcAmendmentDataAgent: ILCAmendmentDataAgent
  ) {
    super()
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Post('{lcStaticId}/amendments')
  @SuccessResponse(201, 'Created')
  public async create(
    @Path() lcStaticId: string,
    @Body() amendment: ILCAmendmentBase,
    @Header('Authorization') jwt: string
  ): Promise<{ transactionHash: string; id: string }> {
    this.logger.metric({
      [Metric.APICallReceived]: LCAmendmentControllerEndpoints.Create
    })
    const user: IUser = getUser(decode(jwt))

    if (lcStaticId !== amendment.lcStaticId) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `LC id ${lcStaticId} mismatch between route and payload`,
        {
          lcStaticId: [
            `path /${lcStaticId}/amendments mismatch with lcStaticId ${amendment.lcStaticId} in the payload `
          ]
        }
      )
    }
    const valid = this.ajv.validate((AMENDMENT_BASE_SCHEMA as any).$id, amendment)
    if (!valid) {
      const errors = toValidationErrors(this.ajv.errors)
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorNames.LCAmendmentSchemaValidationFailed, errors)
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpSchema, 'Invalid LCAmendment', errors)
    }
    try {
      // TODO LS we should return only the staticId if we want to avoid for the transaction to be mined
      const [transactionHash, id] = await this.lcAmendmentUseCase.create(amendment, user)
      this.logger.metric({
        [Metric.APICallFinished]: LCAmendmentControllerEndpoints.Create
      })
      return { transactionHash, id }
    } catch (error) {
      this.logger.info({
        error: 'Create Amendment failed',
        errorObject: error,
        lcStaticId
      })
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Post('amendments/{lcAmendmentStaticId}/approve')
  @SuccessResponse(201, 'Created')
  public async approve(
    @Path() lcAmendmentStaticId: string,
    @Request() request: express.Request,
    @Header('Authorization') jwt: string
  ) {
    this.logger.metric({
      [Metric.APICallReceived]: LCAmendmentControllerEndpoints.Approve
    })
    const user: IUser = getUser(decode(jwt))
    try {
      await this.lcAmendmentUseCase.approve(lcAmendmentStaticId, request, user)
      this.logger.metric({
        [Metric.APICallFinished]: LCAmendmentControllerEndpoints.Approve
      })
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageLCRequest'])
  @Post('amendments/{lcAmendmentStaticId}/reject')
  @SuccessResponse(201, 'Created')
  public async reject(@Path() lcAmendmentStaticId: string, @Body() rejection: ILCAmendmentRejection) {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: LCAmendmentControllerEndpoints.Reject
      })
      await this.lcAmendmentUseCase.reject(lcAmendmentStaticId, rejection.comment)
      this.logger.metric({
        [Metric.APICallFinished]: LCAmendmentControllerEndpoints.Reject
      })
    } catch (error) {
      this.logger.info({
        error: 'Reject LCAmendment failed',
        errorObject: error,
        amendmentStaticId: lcAmendmentStaticId
      })
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['tradeFinance', 'manageCollection'])
  @Get('amendments/{id}')
  public async get(@Path() id: string): Promise<ILCAmendment> {
    this.logger.metric({
      [Metric.APICallReceived]: LCAmendmentControllerEndpoints.Get
    })
    let amendment: ILCAmendment
    try {
      amendment = await this.lcAmendmentDataAgent.get(id)
    } catch (error) {
      throw generateHttpException(error)
    }
    if (!amendment) {
      const message = `LCAmendment ${id} does not exist`
      this.logger.info({ error: 'Not found', message })
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, message)
    }
    this.logger.metric({
      [Metric.APICallFinished]: LCAmendmentControllerEndpoints.Get
    })
    return amendment
  }
}
