import { injectable, inject } from 'inversify'
import { IMessageEventProcessor } from '../message-processing/IMessageEventProcessor'
import { LCAmendmentTaskType, ITrade, ICargo, TradeSource } from '@komgo/types'
import { getLogger } from '@komgo/logging'
import { TradeMessageType } from '../messaging/messageTypes'
import { IMessageReceived } from '@komgo/messaging-library'
import { TYPES } from '../../inversify/types'
import { TaskManager, ITaskCreateRequest } from '@komgo/notification-publisher'
import { TRADE_FINANCE_PRODUCT_ID, TRADE_FINANCE_ACTION } from '../tasks/permissions'
import { ILCCacheDataAgent } from '../../data-layer/data-agents'
import { LC_STATE } from '../events/LC/LCStates'
import { CONFIG } from '../../inversify/config'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorNames } from '../../exceptions/utils'

interface ITradeEventProcessorMessage extends IMessageReceived {
  content: ITradeMessage | ICargoMessage
}

export interface ITradeMessage {
  trade: ITrade
}

export interface ICargoMessage {
  cargo: ICargo
}

@injectable()
export class TradeEventProcessor implements IMessageEventProcessor {
  protected logger = getLogger('TradeEventProcessor')
  constructor(
    @inject(TYPES.TaskManagerClient) private readonly taskManager: TaskManager,
    @inject(CONFIG.CompanyStaticId) private readonly companyId: string,
    @inject(TYPES.LCCacheDataAgent) private readonly lcCacheDataAgent: ILCCacheDataAgent
  ) {}

  async getKeysToProcess() {
    return Object.values(TradeMessageType)
  }

  async processEvent({ routingKey, content, options }: ITradeEventProcessorMessage) {
    this.logger.info(`Message received with routingKey ${routingKey}`)

    let sourceId: string

    switch (routingKey) {
      case TradeMessageType.TradeUpdated:
        const { trade } = content as ITradeMessage
        if (!trade) {
          this.logger.warn(
            ErrorCode.ValidationInternalAMQP,
            ErrorNames.TradeEventTradeNotFound,
            `${routingKey} message with id ${options.messageId} did not contain a trade.`
          )
          return
        }
        if (trade.source !== TradeSource.Vakt) {
          this.logger.warn(
            ErrorCode.ValidationInternalAMQP,
            ErrorNames.TradeEventTradeNotSupported,
            `${routingKey} message with id ${options.messageId} is not a supported source.`
          )
          return
        }
        /**
         * Yes I know... but sourceId will be in the response from api-trade-cargo to replace vaktId
         * However, we cannot update the types until the rest of this MS is ready.
         */
        sourceId = (trade as any).sourceId
        break
      case TradeMessageType.CargoUpdated:
        const { cargo } = content as ICargoMessage
        if (!cargo) {
          this.logger.warn(
            ErrorCode.ValidationInternalAMQP,
            ErrorNames.TradeEventCargoNotFound,
            `${routingKey} message with id ${options.messageId} did not contain a cargo.`
          )
          return
        }

        if (cargo.source !== TradeSource.Vakt) {
          this.logger.warn(
            ErrorCode.ValidationInternalAMQP,
            ErrorNames.TradeEventCargoNotSupported,
            `${routingKey} message with id ${options.messageId} is not a supported source.`
          )
          return
        }
        /**
         * Yes I know... but sourceId will be in the response from api-trade-cargo to replace vaktId
         * However, we cannot update the types until the rest of this MS is ready.
         */
        sourceId = (cargo as any).sourceId
        break
      default:
        this.logger.warn(
          ErrorCode.ValidationInternalAMQP,
          ErrorNames.TradeEventUnexpectedRoutingKey,
          `Unexpected routingKey ${routingKey}.`
        )
        return
    }

    const lcs = await this.lcCacheDataAgent.getLCs({
      'tradeAndCargoSnapshot.sourceId': { $eq: sourceId },
      status: { $nin: [LC_STATE.REQUEST_REJECTED, LC_STATE.ISSUED_LC_REJECTED] }
    })

    this.logger.info(`${lcs.length} matching LCs found for trade sourceId ${sourceId}`)

    for (const lc of lcs) {
      if (lc.applicantId === this.companyId) {
        const tradeMessage = `Trade ${
          lc.tradeAndCargoSnapshot.trade.buyerEtrmId
        } has been changed, request an amendment to ${lc.reference}`
        const task: ITaskCreateRequest = {
          summary: tradeMessage,
          taskType: LCAmendmentTaskType.ReviewTrade,
          context: {
            lcId: `${lc._id}`,
            messageId: options.messageId
          },
          requiredPermission: {
            productId: TRADE_FINANCE_PRODUCT_ID,
            actionId: TRADE_FINANCE_ACTION.ManageLCRequest
          }
        }
        this.logger.info(`Sending task for LC ${lc._id}`)

        try {
          await this.taskManager.createTask(task, tradeMessage)
        } catch (err) {
          this.logger.info(`task manager create task error ${err}`)
          throw err
        }
      }
      // future todo else if (lc.beneficiary === this.companyId) raise notification
    }
  }
}
