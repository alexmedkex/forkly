import { getLogger } from '@komgo/logging'
import { IMessagePublisher, MessagingFactory } from '@komgo/messaging-library'
import { SendTxResultMessage } from '@komgo/messaging-types/api-blockchain-signer'
import { exponentialDelay } from '@komgo/retry'
import { inject, injectable } from 'inversify'

import { TransactionStatus } from '../../data-layer/models/transaction/TransactionStatus'
import { TYPES } from '../../inversify/types'
import { INJECTED_VALUES } from '../../inversify/values'
import IService from '../../service-layer/services/IService'

import { ITransaction } from 'src/data-layer/models/transaction'

@injectable()
export default class MessagingClient implements IService {
  private readonly signerRKPrefix = 'KOMGO.SIGNER'
  private readonly publisher: IMessagePublisher

  private readonly logger = getLogger('MessagingClient')

  constructor(
    @inject(TYPES.MessagingFactory) messagingFactory: MessagingFactory,
    @inject(INJECTED_VALUES.PublisherId) publisherId: string
  ) {
    this.publisher = messagingFactory.createRetryPublisher(publisherId, {
      maxRetries: 3,
      delay: exponentialDelay(50)
    })
  }

  public async start() {
    this.logger.info('Starting MessagingClient')
  }

  public async stop() {
    this.logger.info('Stopping MessagingClient')
    await this.publisher.close()
  }

  public publishErrorMessage(tx: ITransaction, errorMsg: string, status: TransactionStatus): Promise<void> {
    const routingKey = this.buildFullRoutingKey('Error', tx.requestOrigin)

    return this.publishMessage(routingKey, {
      txId: tx.id,
      txHash: tx.hash,
      status,
      errorType: 'SendTransactionError',
      message: errorMsg,
      context: tx.context
    })
  }

  public publishSuccessMessage(tx: ITransaction): Promise<void> {
    const routingKey = this.buildFullRoutingKey('Success', tx.requestOrigin)

    return this.publishMessage(routingKey, {
      txId: tx.id,
      txHash: tx.hash,
      status: TransactionStatus.Confirmed,
      context: tx.context
    })
  }

  private async publishMessage(routingKey: string, txMessage: SendTxResultMessage): Promise<void> {
    this.logger.info('Publishing transaction execution message', {
      routingKey,
      message: txMessage
    })

    const publishResult = await this.publisher.publishCritical(routingKey, txMessage)

    this.logger.info('Published transaction execution message', {
      routingKey,
      message: txMessage,
      result: publishResult
    })
  }

  private buildFullRoutingKey(messageType: string, requestOrigin?: string): string {
    // Publish message on Internal MQ to notify MS of a transaction result
    const routingKey = `${this.signerRKPrefix}.SendTx.${messageType}`
    return requestOrigin ? `${routingKey}.${requestOrigin}` : routingKey
  }
}
