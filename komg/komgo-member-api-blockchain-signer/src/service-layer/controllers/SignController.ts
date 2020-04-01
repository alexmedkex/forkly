import { Encrypt, Sign } from '@komgo/cryptography-wrapper'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils, HttpException, IValidationErrors, validateRequest } from '@komgo/microservice-config'
import EthCrypto from 'eth-crypto'
import { Body, Controller, Get, Path, Post, Response, Route, Tags } from 'tsoa'

import CompanyKeyProvider from '../../business-layer/key-management/CompanyKeyProvider'
import { IETHKeyData } from '../../business-layer/key-management/models/IETHKeyData'
import OneTimeSigner from '../../business-layer/one-time-key/OneTimeSigner'
import TransactionManager from '../../business-layer/transactions/TransactionManager'
import Web3Utils from '../../business-layer/transactions/Web3Utils'
import TransactionDataAgent from '../../data-layer/data-agents/TransactionDataAgent'
import { ITransaction } from '../../data-layer/models/transaction'
import { inject, provideSingleton } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ACTIONS, ErrorName } from '../../middleware/common/Constants'
import { CryptographyFunction, CryptographyType, Metric } from '../../utils/Metrics'
import {
  IEncryptRequest,
  IPayloadRequest,
  IVerifyETHRequest,
  PostRawPrivateTransactionRequest,
  PostRawTransactionRequest
} from '../request/signer'
import { ITransactionStatus } from '../responses/transactions/ITransactionStatus'

enum ERROR_MESSAGES {
  FAIL_SIGN = 'Failed to sign',
  FAIL_VERIFY = 'Failed to verify',
  FAIL_ENCRYPT = 'Failed to encrypt',
  FAIL_DECRYPT = 'Failed to decrypt',
  FAIL_POST_TX = 'Failed to send transaction',
  FAIL_BUILD_TRANSACTION = 'Failed to build transaction',
  BAD_PARAMS = 'Invalid parameters'
}

/**
 * Sign using ETH key and execute transactions
 */
@Tags('Signer')
@Route('signer')
@provideSingleton(SignController)
export class SignController extends Controller {
  private readonly logger = getLogger('SignController')

  constructor(
    @inject(TYPES.CompanyKeyProvider) private readonly companyKeyProvider: CompanyKeyProvider,
    @inject(TYPES.TransactionManager) private readonly transactionManager: TransactionManager,
    @inject(TYPES.Web3Utils) private readonly web3Utils: Web3Utils,
    @inject(TYPES.OneTimeSigner) private readonly oneTimeSigner: OneTimeSigner,
    @inject(TYPES.TransactionDataAgent) private readonly txDataAgent: TransactionDataAgent
  ) {
    super()
  }

  /**
   * Fetches the status of a particular transaction. This method expects an id returned by
   * "send-tx" and "send-private-tx" methods.
   * @see #ITransactionStatus
   *
   * @param txId - an id of a transaction to fetch
   * @returns object with hash & status of the found transaction
   */
  @Response<HttpException>('404', 'If a transaction with the specified id was not found')
  @Get('tx-status/{txId}')
  public async txStatus(@Path('txId') txId: string): Promise<ITransactionStatus> {
    let tx: ITransaction
    try {
      tx = await this.txDataAgent.getTransaction(txId)
    } catch (err) {
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorName.TxStatus, 'Failed to get a status of a transaction', {
        txId,
        error: err.message
      })

      throw ErrorUtils.internalServerException(ErrorCode.ConnectionDatabase)
    }

    if (!tx) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorName.TxNotFound, {
        action: ACTIONS.TX_GET_STATUS,
        error: 'Transaction was not found',
        txId
      })

      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, ErrorName.TxNotFound)
    }

    return { hash: tx.hash, status: tx.status }
  }

  /**
   * Execute a public Ethereum transaction
   *
   * The executions follows the following process:
   *
   * 1) Generate raw transaction and persists it
   * 2) Returns the id of the raw transaction request
   * 3) Asynchronously posts the transaction to the blockchain
   *
   * @param req a transaction to execute
   * @returns a generated id of the submitted transaction
   */

  @Response<HttpException>('422', 'If a request is malformed')
  @Response<HttpException>('500', 'If fails to submit a transaction')
  @Post('send-tx')
  public async sendTx(@Body() req: PostRawTransactionRequest) {
    await validateRequest(PostRawTransactionRequest, req)

    try {
      const keyData = await this.companyKeyProvider.getETHKey()
      const memberAccount = keyData.address

      const rawTransaction = await this.web3Utils.buildRawTx(memberAccount, req.to, req.data, req.value, req.gas)
      const tx = await this.transactionManager.persistNewTx(rawTransaction, req.id, req.requestOrigin, req.context)

      this.logger.info('Blockchain transaction has been sent', { memberAccount, to: req.to, txId: tx.id })
      return tx.id as string
    } catch (error) {
      this.processTxBuildError(error, ErrorName.BuildPublicTxFailed)
    }
  }

  /**
   * Execute a private Ethereum transaction
   *
   * The executions follows the following process:
   *
   * 1) Generate raw transaction and persists it
   * 2) Returns the id of the raw transaction request
   * 3) Asynchronously posts the transaction to the blockchain
   *
   * @param req a transaction to execute
   * @returns a generated id of the submitted transaction
   */
  @Response<HttpException>('422', 'If a request is malformed')
  @Response<HttpException>('500', 'If fails to submit a transaction')
  @Post('send-private-tx')
  public async sendPrivateTx(@Body() req: PostRawPrivateTransactionRequest) {
    await validateRequest(PostRawPrivateTransactionRequest, req)

    try {
      const oneTimeAddress = await this.oneTimeSigner.generateOnetimeKey()
      const rawTransaction = await this.web3Utils.buildRawPrivateTx(
        oneTimeAddress,
        req.to,
        req.data,
        req.privateFor,
        undefined,
        req.gas
      )
      // TODO: extract persistNewTx to new class that would contain only business logic for
      // storing and reading blockchain transactions. "TransactionManger" should only
      // care about executing transactions
      const tx = await this.transactionManager.persistNewTx(rawTransaction, req.id, req.requestOrigin, req.context)

      this.logger.info('Private transaction has been sent', {
        oneTimeAddress,
        privateFor: req.privateFor,
        to: req.to,
        txId: tx.id
      })

      return tx.id as string
    } catch (error) {
      this.processTxBuildError(error, ErrorName.BuildPrivateTxFailed)
    }
  }

  /**
   * Signing
   *
   * @param req payload to be signed
   * @returns signed payload
   */
  @Response<HttpException>('500', 'If fails to sign a payload')
  @Post('sign')
  public async sign(@Body() req: IPayloadRequest): Promise<any> {
    try {
      const keyData: IETHKeyData = await this.companyKeyProvider.getETHKey('private')
      const signer = new Sign()
      const resp = signer.signMessage(JSON.stringify(req.payload), keyData.privateKey)
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Eth,
        [Metric.CryptographyFunction]: CryptographyFunction.Sign
      })
      return resp
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.ETHSignTxFailed, ERROR_MESSAGES.FAIL_SIGN, {
        action: ACTIONS.SIGN_TX,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Simple Signing
   *
   * @param req payload to be signed
   */
  @Response<HttpException>('500', 'If fails to sign a payload')
  @Post('simple-sign')
  public async simpleSign(@Body() req: IPayloadRequest): Promise<any> {
    try {
      const keyData: IETHKeyData = await this.companyKeyProvider.getETHKey('private')
      const resp = EthCrypto.sign(keyData.privateKey, req.payload)
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Eth,
        [Metric.CryptographyFunction]: CryptographyFunction.Sign
      })
      return resp
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.ETHSimpleSignTxFailed, ERROR_MESSAGES.FAIL_SIGN, {
        action: ACTIONS.ETH_SIGN,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Decrypts data with the company's ETH key
   *
   * @param req payload to decrypt
   * @returns decrypted payload
   */
  @Response<HttpException>('500', 'Internal server error')
  @Post('decrypt')
  public async decrypt(@Body() req: IPayloadRequest) {
    try {
      const keyData: IETHKeyData = await this.companyKeyProvider.getETHKey()
      const crypto = new Encrypt()
      const content = await crypto.decryptMessage(req.payload, keyData.privateKey)
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Eth,
        [Metric.CryptographyFunction]: CryptographyFunction.Decrypt
      })
      return JSON.parse(content)
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.ETHDecryptFailed, ERROR_MESSAGES.FAIL_DECRYPT, {
        action: ACTIONS.DECRYPT,
        message: error.message
      })
      throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
    }
  }

  /**
   * Encrypts a data with the provided key
   *
   * @param req payload to encrypt and a key to use
   * @returns encrypted payload
   */
  @Response<HttpException>('422', 'Invalid public key')
  @Post('encrypt')
  public async encrypt(@Body() req: IEncryptRequest) {
    try {
      const crypto = new Encrypt()
      const msgStr = JSON.stringify(req.payload)
      const resp = await crypto.encryptMessage(msgStr, req.publicKey)
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Eth,
        [Metric.CryptographyFunction]: CryptographyFunction.Encrypt
      })
      return resp
    } catch (error) {
      this.logger.error(ErrorCode.ValidationHttpContent, ErrorName.ETHEncryptFailed, ERROR_MESSAGES.FAIL_ENCRYPT, {
        action: ACTIONS.ENCRYPT,
        message: error.message
      })

      const validationError: IValidationErrors = {
        publicKey: ['Invalid public key']
      }
      throw ErrorUtils.badRequestException(
        ErrorCode.ValidationHttpContent,
        ERROR_MESSAGES.FAIL_ENCRYPT,
        validationError
      )
    }
  }

  /**
   * Verify content against a ETH Signature and ETH Address
   *
   * @param req Expects a payload(encrypted msg), address of the sender and a signature to verify
   * @returns a flag that signifies if a signature is valid
   */
  @Response<HttpException>('422', 'Invalid signature')
  @Post('verify')
  public async verify(@Body() req: IVerifyETHRequest) {
    try {
      const signer = new Sign()
      const result = signer.checkSignature(JSON.stringify(req.payload), req.signature, req.address)
      this.logger.metric({
        [Metric.CryptographyType]: CryptographyType.Eth,
        [Metric.CryptographyFunction]: CryptographyFunction.Verify
      })
      return { isValid: result }
    } catch (error) {
      this.logger.error(
        ErrorCode.ValidationHttpContent,
        ErrorName.ETHCheckSignatureFailed,
        ERROR_MESSAGES.FAIL_VERIFY,
        {
          action: ACTIONS.VERIFY_TX,
          signature: req.signature,
          address: req.address,
          message: error.message
        }
      )

      const validationError: IValidationErrors = {
        signature: ['Invalid signature']
      }
      throw ErrorUtils.badRequestException(ErrorCode.ValidationHttpContent, ERROR_MESSAGES.FAIL_VERIFY, validationError)
    }
  }

  private processTxBuildError(error: any, errorName: ErrorName) {
    this.logger.error(ErrorCode.BlockchainTransaction, errorName, ERROR_MESSAGES.FAIL_BUILD_TRANSACTION, {
      action: ACTIONS.SEND_TX,
      message: error.message
    })
    throw ErrorUtils.internalServerException(ErrorCode.ValidationHttpContent)
  }
}
