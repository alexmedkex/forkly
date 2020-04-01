import { NotificationManager } from '@komgo/notification-publisher'
import { ITradeDataAgent } from '../../../data-layer/data-agents/ITradeDataAgent'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { ITradeEventProcessor } from './ITradeEventProcessor'
import { Trade } from '../../../data-layer/models/Trade'
import {
  getCreatedTradeNotification,
  getUpdatedTradeNotification
} from '../../../business-layer/messaging/notification-objects/notificationBuilder'
import { ITradeMessageData } from '../../../business-layer/data/request-messages/ITradeMessageData'
import { IMemberClient } from '../../../data-layer/clients/IMemberClient'
import { ICounterpartyClient } from '../../../data-layer/clients/ICounterpartyClient'
import { CRUD_ACTIONS } from '../../../data-layer/constants/CRUDActions'
import { ENTITY_TYPES } from '../../../data-layer/constants/EntityTypes'
import { IEventMessagePublisher } from '../IEventMessagePublisher'
import {
  CreditRequirements,
  Currency,
  InvoiceQuantity,
  ITrade,
  PaymentTermsDayType,
  PaymentTermsTimeUnit,
  PaymentTermsWhen,
  PriceUnit,
  TradeSource
} from '@komgo/types'
import { Metric, MetricAction, MetricState } from '../../../utils/Metrics'
import { VALUES } from '../../../inversify/values'

@injectable()
export class TradeEventProcessor implements ITradeEventProcessor {
  private readonly logger = getLogger('TradeEventProcessor')

  constructor(
    @inject(TYPES.TradeDataAgent) private readonly tradeDataAgent: ITradeDataAgent,
    @inject(TYPES.NotificationClient) private readonly notificationClient: NotificationManager,
    @inject(TYPES.MemberClient) private readonly memberClient: IMemberClient,
    @inject(TYPES.CounterpartyClient) private readonly counterpartyClient: ICounterpartyClient,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string,
    @inject(TYPES.EventMessagePublisher) private readonly publisher: IEventMessagePublisher
  ) {}

  async processEvent(data: ITradeMessageData, source: TradeSource) {
    const pickStaticId = (members: any[] = []): string => {
      if (members.length === 0) {
        throw new Error(`counterparty ${buyer} or ${seller} not found`)
      }
      const [member, ...rest] = members
      return member.staticId
    }
    const {
      vaktId,
      buyer,
      seller,
      version,
      messageType,
      paymentTerms,
      currency,
      priceUnit,
      invoiceQuantity,
      creditRequirement,
      ...props
    } = data
    this.logger.info('lookup in members by vaktStaticIds:', { buyer, seller })
    const buyerStaticId = await this.memberClient.find({ vaktStaticId: `${buyer}` }).then(pickStaticId)
    const sellerStaticId = await this.memberClient.find({ vaktStaticId: `${seller}` }).then(pickStaticId)
    const companies = [buyerStaticId, sellerStaticId]

    this.logger.info('processEvent', { buyerStaticId, sellerStaticId, vaktId, buyer, seller })
    this.logger.metric({
      [Metric.Action]: [MetricAction.TradeReceived],
      [Metric.State]: [MetricState.Success]
    })

    // TODO LS extract as tradeDataModel This is the mapping between Vakt and Komgo data model

    const trade = new Trade(source, vaktId, this.companyStaticId, {
      ...props,
      paymentTerms: {
        eventBase: paymentTerms.eventBase,
        when: paymentTerms.when as any,
        time: paymentTerms.time,
        timeUnit: paymentTerms.timeUnit as any,
        dayType: paymentTerms.dayType as any
      },
      currency: currency as Currency,
      priceUnit: priceUnit as PriceUnit,
      creditRequirement: creditRequirement as CreditRequirements,
      commodity: 'BFOET', // TODO LS move to Commodity in komgo/types
      buyer: buyerStaticId,
      buyerEtrmId: data.buyerEtrmId,
      sellerEtrmId: data.sellerEtrmId,
      seller: sellerStaticId,
      invoiceQuantity: invoiceQuantity as InvoiceQuantity
    })
    if (!trade.creditRequirement) {
      trade.creditRequirement = CreditRequirements.DocumentaryLetterOfCredit
    }

    const existingTrades: ITrade[] = await this.tradeDataAgent.find({
      sourceId: vaktId,
      source
    })

    this.logger.info('Processing trade', { vaktId, source })
    const etrmId: string = this.companyStaticId === buyerStaticId ? data.buyerEtrmId : data.sellerEtrmId

    if (existingTrades && existingTrades[0]) {
      this.logger.info('Update trade', {
        action: CRUD_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.TRADE,
        vaktId,
        source
      })

      // TODO: Handle failures for each of these calls seperately, and implement the new error codes.
      await this.tradeDataAgent.update(existingTrades[0]._id, trade)
      await this.notificationClient.createNotification(
        getUpdatedTradeNotification(vaktId, etrmId, existingTrades[0]._id)
      )
      await this.publisher.publishTradeUpdated(trade)

      this.logger.info('Trade updated', { vaktId, source })
      this.logger.metric({
        [Metric.Action]: [MetricAction.TradeUpdated],
        [Metric.State]: [MetricState.Success]
      })
    } else {
      this.logger.info('Create new trade', {
        action: CRUD_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.TRADE,
        vaktId,
        source
      })

      const tradeId = await this.tradeDataAgent.create(trade)
      await this.counterpartyClient.autoAdd(companies.filter(x => x !== this.companyStaticId))
      await this.notificationClient.createNotification(getCreatedTradeNotification(vaktId, etrmId, tradeId))

      this.logger.info('Trade created', { vaktId, source })
      this.logger.metric({
        [Metric.Action]: [MetricAction.TradeCreated],
        [Metric.State]: [MetricState.Success]
      })
    }
  }
}
