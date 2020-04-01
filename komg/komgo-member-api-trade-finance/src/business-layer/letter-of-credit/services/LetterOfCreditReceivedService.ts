import { injectable, inject } from 'inversify'

import { ILetterOfCredit, LetterOfCreditStatus, IDataLetterOfCredit } from '@komgo/types'
import { getLogger } from '@komgo/logging'
import { ErrorCode } from '@komgo/error-utilities'

import { ErrorNames } from '../../../exceptions/utils'
import { TYPES } from '../../../inversify'
import { ILetterOfCreditDataAgent } from '../../../data-layer/data-agents'

import { soliditySha3 } from '../../common/HashFunctions'

import { ILetterOfCreditReceivedService } from './ILetterOfCreditReceivedService'
import { ILetterOfCreditPartyActionProcessor } from '../processors/ILetterOfCreditPartyActionProcessor'
import { removeNullsAndUndefined } from '../../util'

@injectable()
export class LetterOfCreditReceivedService implements ILetterOfCreditReceivedService {
  private readonly logger = getLogger('LetterOfCreditDataProcessor')
  private readonly letterOfCreditDataAgent: ILetterOfCreditDataAgent
  private readonly letterOfCreditPartyActionsProcessor: ILetterOfCreditPartyActionProcessor

  constructor(
    @inject(TYPES.LetterOfCreditDataAgent) letterOfCreditDataAgent: ILetterOfCreditDataAgent,
    @inject(TYPES.LetterOfCreditPartyActionProcessor)
    letterOfCreditPartyActionsProcessor: ILetterOfCreditPartyActionProcessor
  ) {
    this.letterOfCreditDataAgent = letterOfCreditDataAgent
    this.letterOfCreditPartyActionsProcessor = letterOfCreditPartyActionsProcessor
  }

  async executeIssuedFlow(letterOfCreditFromRabbitMQMessage: ILetterOfCredit<IDataLetterOfCredit>) {
    const letterOfCreditFromLocalCache: ILetterOfCredit<
      IDataLetterOfCredit
    > = await this.letterOfCreditDataAgent.getByContractAddress(letterOfCreditFromRabbitMQMessage.contractAddress)

    const staticId = letterOfCreditFromRabbitMQMessage.staticId

    if (letterOfCreditFromLocalCache.status === LetterOfCreditStatus.Requested) {
      letterOfCreditFromRabbitMQMessage.status = LetterOfCreditStatus.Issued_Verification_Pending
    } else if (letterOfCreditFromLocalCache.status === LetterOfCreditStatus.Issued_Verification_Pending) {
      // TODO Hash validation -> We need to store the Hash of the Issued LOC document
      letterOfCreditFromRabbitMQMessage.status = LetterOfCreditStatus.Issued
    }

    // keep this data
    letterOfCreditFromRabbitMQMessage.templateInstance.data.issueDueDate =
      letterOfCreditFromLocalCache.templateInstance.data.issueDueDate

    await this.letterOfCreditDataAgent.update({ staticId }, letterOfCreditFromRabbitMQMessage)

    if (letterOfCreditFromRabbitMQMessage.status === LetterOfCreditStatus.Issued) {
      await this.letterOfCreditPartyActionsProcessor.executePartyActions(letterOfCreditFromRabbitMQMessage)
    }
  }

  async executeRequestRejectedFlow(letterOfCreditFromRabbitMQMessage: ILetterOfCredit<IDataLetterOfCredit>) {
    const letterOfCreditFromLocalCache: ILetterOfCredit<
      IDataLetterOfCredit
    > = await this.letterOfCreditDataAgent.getByContractAddress(letterOfCreditFromRabbitMQMessage.contractAddress)

    const staticId = letterOfCreditFromRabbitMQMessage.staticId

    if (letterOfCreditFromLocalCache.status === LetterOfCreditStatus.Requested) {
      letterOfCreditFromRabbitMQMessage.status = LetterOfCreditStatus.RequestRejected_Pending
    } else if (letterOfCreditFromLocalCache.status === LetterOfCreditStatus.RequestRejected_Pending) {
      letterOfCreditFromRabbitMQMessage.status = LetterOfCreditStatus.RequestRejected
    }

    // keep this data
    letterOfCreditFromRabbitMQMessage.templateInstance.data.issueDueDate =
      letterOfCreditFromLocalCache.templateInstance.data.issueDueDate

    await this.letterOfCreditDataAgent.update({ staticId }, letterOfCreditFromRabbitMQMessage)

    if (letterOfCreditFromRabbitMQMessage.status === LetterOfCreditStatus.RequestRejected) {
      await this.letterOfCreditPartyActionsProcessor.executePartyActions(letterOfCreditFromRabbitMQMessage)
    }
  }

  async processEvent(message: ILetterOfCredit<IDataLetterOfCredit>): Promise<boolean> {
    const letterOfCreditFromRabbitMQMessage = message

    if (letterOfCreditFromRabbitMQMessage.status === LetterOfCreditStatus.Issued) {
      await this.executeIssuedFlow(letterOfCreditFromRabbitMQMessage)
      return Promise.resolve(true)
    }

    if (letterOfCreditFromRabbitMQMessage.status === LetterOfCreditStatus.RequestRejected) {
      await this.executeRequestRejectedFlow(letterOfCreditFromRabbitMQMessage)
      return Promise.resolve(true)
    }

    const transactionHash = message.transactionHash
    try {
      const letterOfCredit: ILetterOfCredit<
        IDataLetterOfCredit
      > = await this.letterOfCreditDataAgent.getByTransactionHash(transactionHash)
      const hasLetterOfCredit = letterOfCredit ? true : false

      if (hasLetterOfCredit) {
        const hasContractAddress = letterOfCredit.contractAddress ? true : false
        if (!hasContractAddress) {
          throw new Error('Existing letter of credit does not have contract address')
        }
        if (this.isDataHashValid(message, letterOfCredit.hashedData)) {
          const newLetterOfCredit = {
            ...message,
            status: LetterOfCreditStatus.Requested
          }
          await this.letterOfCreditDataAgent.update({ transactionHash }, newLetterOfCredit)

          // await this.letterOfCreditDataAgent.save(newLetterOfCredit)
          await this.letterOfCreditPartyActionsProcessor.executePartyActions(letterOfCredit)
        } else {
          this.logger.warn(
            ErrorCode.ValidationKomgoInboundAMQP,
            ErrorNames.LetterOfCreditMessageHashInvalid,
            'Letter of credit message content hash did not match.'
          )
          await this.letterOfCreditDataAgent.update(
            { transactionHash },
            {
              status: LetterOfCreditStatus.Requested_Verification_Failed
            }
          )
        }
      } else {
        const newLetterOfCredit = {
          ...message,
          status: LetterOfCreditStatus.Requested_Verification_Pending
        }
        await this.letterOfCreditDataAgent.save(newLetterOfCredit)
      }
    } catch (error) {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.LetterOfCreditDataProcessorDatabaseConnection, {
        stackTrace: new Error().stack
      })
      throw error
    }
    return Promise.resolve(true)
  }

  isDataHashValid(letterOfCreditFromMessage, hashedDataFieldFromDB) {
    const copyOfletterOfCreditFromMessage = { ...letterOfCreditFromMessage }
    delete copyOfletterOfCreditFromMessage.messageType
    delete copyOfletterOfCreditFromMessage.transactionHash
    delete copyOfletterOfCreditFromMessage.status
    const hashOfDataFromMessage = soliditySha3(JSON.stringify(removeNullsAndUndefined(copyOfletterOfCreditFromMessage)))
    return hashOfDataFromMessage === hashedDataFieldFromDB
  }
}
