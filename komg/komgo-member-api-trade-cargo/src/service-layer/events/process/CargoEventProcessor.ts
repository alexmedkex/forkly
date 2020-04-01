import { cargoDataMapper } from '../../../business-layer/data/request-messages/mapper/cargoDataMapper'
import { ICargoData } from '../../../business-layer/data/request-messages/ICargoData'
import { NotificationManager } from '@komgo/notification-publisher'
import { ICargoDataAgent } from '../../../data-layer/data-agents/ICargoDataAgent'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../inversify/types'
import { getLogger } from '@komgo/logging'
import { ICargoEventProcessor } from './ICargoEventProcessor'
import {
  getUpdatedCargoNotification,
  getCreatedCargoNotification
} from '../../../business-layer/messaging/notification-objects/notificationBuilder'
import { ITradeDataAgent } from '../../../data-layer/data-agents/ITradeDataAgent'
import { CRUD_ACTIONS } from '../../../data-layer/constants/CRUDActions'
import { ENTITY_TYPES } from '../../../data-layer/constants/EntityTypes'
import { IEventMessagePublisher } from '../IEventMessagePublisher'
import { ErrorCode } from '@komgo/error-utilities'
import { ErrorName } from '../../../utils/Constants'
import { Metric, MetricAction, MetricState } from '../../../utils/Metrics'
import { ICargo, ITrade, TradeSource } from '@komgo/types'

@injectable()
export class CargoEventProcessor implements ICargoEventProcessor {
  private readonly logger = getLogger('CargoEventProcessor')

  constructor(
    @inject(TYPES.CargoDataAgent) private cargoDataAgent: ICargoDataAgent,
    @inject(TYPES.TradeDataAgent) private tradeDataAgent: ITradeDataAgent,
    @inject(TYPES.NotificationClient) private notificationClient: NotificationManager,
    @inject('company-static-id') private readonly companyStaticId: string,
    @inject(TYPES.EventMessagePublisher) private readonly publisher: IEventMessagePublisher
  ) {}

  async processEvent(cargoData: ICargoData, source: TradeSource) {
    const cargo = cargoDataMapper(cargoData, source)
    const { vaktId, cargoId } = cargoData

    const existingCargoFilter = {
      sourceId: vaktId,
      cargoId
    }

    this.logger.info('Processing cargo', { vaktId, cargoId, source })
    this.logger.metric({
      [Metric.Action]: [MetricAction.CargoReceived],
      [Metric.State]: [MetricState.Success]
    })
    const existingCargo: ICargo = await this.cargoDataAgent.findOne(existingCargoFilter, TradeSource.Vakt)
    const trade: ITrade = await this.tradeDataAgent.findOne({ sourceId: vaktId }, TradeSource.Vakt)
    let tradeEtrmId: string = ''
    let tradeId: string = ''
    if (trade) {
      tradeEtrmId = this.companyStaticId === trade.buyer ? trade.buyerEtrmId : trade.sellerEtrmId
      tradeId = trade._id
    } else {
      this.logger.warn(
        ErrorCode.DatabaseMissingData,
        ErrorName.TradeForCargoNotFound,
        'Cargo processing though no trade was found',
        { vaktId, cargoId, source }
      )
    }
    if (existingCargo) {
      this.logger.info('Update cargo', {
        action: CRUD_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.CARGO,
        vaktId,
        cargoId,
        source
      })
      await this.cargoDataAgent.update(existingCargo.cargoId, cargo)
      await this.notificationClient.createNotification(getUpdatedCargoNotification(vaktId, tradeEtrmId, tradeId))
      await this.publisher.publishCargoUpdated(cargo)

      this.logger.info('Cargo updated', { vaktId, cargoId, source })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CargoUpdated],
        [Metric.State]: [MetricState.Success]
      })
    } else {
      this.logger.info('Create new cargo', {
        action: CRUD_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.CARGO,
        vaktId,
        cargoId,
        source
      })
      await this.cargoDataAgent.create(cargo)
      await this.notificationClient.createNotification(getCreatedCargoNotification(vaktId, tradeEtrmId, tradeId))
      this.logger.info('Cargo created', { vaktId, cargoId, source })
      this.logger.metric({
        [Metric.Action]: [MetricAction.CargoCreated],
        [Metric.State]: [MetricState.Success]
      })
    }
  }
}
