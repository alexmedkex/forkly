import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException } from '@komgo/microservice-config'
import { inject } from 'inversify'
import { Body, Controller, Get, Post, Route, Response, Tags, Query } from 'tsoa'

import ContentionManager from '../../business-layer/contention/ContentionManager'
import OneTimeSigner from '../../business-layer/one-time-key/OneTimeSigner'
import { provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { IPostPrivateTransaction } from '../request/one-time-signer'

/**
 * Codes for the errorCode field in error API responses
 */
enum ERROR_MESSAGES {
  FAIL_GENERATE_KEY = 'Failed to generate key',
  FAIL_POST_TX = 'Failed to post transaction'
}

/**
 * Generates one-time keys and executes private transactions.
 *
 * DEPRECATED. SignController should be used instead
 */
@Tags('One-time signer')
@Route('one-time-signer')
@provideSingleton(OneTimeSignController)
export class OneTimeSignController extends Controller {
  private readonly logger = getLogger('OneTimeSignController')

  constructor(
    @inject(TYPES.OneTimeSigner) private readonly oneTimeSigner: OneTimeSigner,
    @inject(TYPES.BlockchainContentionManager) private readonly contention: ContentionManager,
    private readonly contentionTimeout = 90 * 1000
  ) {
    super()
  }

  /**
   * Generate a one-time key to execute a private transaction.
   *
   * DEPRECATED. SignController should be used instead
   *
   * @returns a one-time key that can be used to execute a private transaction
   */
  @Response<HttpException>('500', 'If fails to generate a one-time key')
  @Get('key')
  public async getKey(): Promise<string> {
    try {
      return await this.contention.apply(() => this.oneTimeSigner.generateOnetimeKey(), this.contentionTimeout)
    } catch (error) {
      this.logger.error(ErrorCode.Configuration, ErrorName.OneTimeKeyGenFailed, ERROR_MESSAGES.FAIL_GENERATE_KEY, {
        error: ACTIONS.ETH_CREATE_NEW_ONETIME_KEY,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.Configuration)
    }
  }

  /**
   * Execute a private Ethereum transaction synchronously.
   *
   * DEPRECATED. SignController should be used instead
   *
   * @param req a transaction to execute
   * @returns a hash of an executed transaction
   */
  @Response<HttpException>('500', 'If fails to execute a transaction')
  @Post('transaction')
  public async postTransaction(@Body() req: IPostPrivateTransaction, @Query() returnFullReceipt = false) {
    try {
      return await this.contention.apply(
        () => this.oneTimeSigner.postTransaction(req, returnFullReceipt),
        this.contentionTimeout
      )
    } catch (error) {
      if (error.message === 'Returned error: nonce too low') {
        throw ErrorUtils.conflictException(ErrorCode.BlockchainTransaction, 'Account provided already used')
      }
      this.logger.error(ErrorCode.BlockchainTransaction, ErrorName.PostPrivateTxFailed, ERROR_MESSAGES.FAIL_POST_TX, {
        error: ACTIONS.SEND_TX,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.BlockchainTransaction)
    }
  }
}
