import { getLogger } from '@komgo/logging'
import { ICreateRFPRequest, IReceivablesDiscounting, IRFPRequestResponse, ITradeSnapshot } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { PRODUCT_ID, SubProductId } from '../../../constants'
import { ReceivablesDiscountingDataAgent, RFPDataAgent, TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { IRFPRequest } from '../../../data-layer/models/rfp/IRFPRequestDocument'
import { TYPES } from '../../../inversify'
import { ReceivablesDiscountingRFPRequest } from '../../../service-layer/requests'
import { timestamp, ITimestamp } from '../../../utils/timestamp'
import { RFPClient, TradeCargoClient } from '../../microservice-clients'
import { RFPValidator } from '../../validation'

@injectable()
export class CreateRFPRequestUseCase {
  private readonly logger = getLogger('CreateRFPRequestUseCase')

  constructor(
    @inject(TYPES.RFPValidator) private readonly rfpValidator: RFPValidator,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.TradeCargoClient) private readonly tradeCargoClient: TradeCargoClient,
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeSnapshotDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.RFPClient) private readonly rfpClient: RFPClient,
    @inject(TYPES.RFPDataAgent) private readonly rfpDataAgent: RFPDataAgent
  ) {}

  /**
   * Creates a new RFP Request by validating the data, taking a snapshot of the trade and cargo and sending the request
   * to the RFP MS
   *
   * @param rfpRequest RFP request to process
   */
  public async execute(rfpRequest: ReceivablesDiscountingRFPRequest): Promise<IRFPRequestResponse> {
    this.logger.info('Validating RFP Request', { request: rfpRequest })
    await this.rfpValidator.validateRequest(rfpRequest)

    const rdApplication = await this.rdDataAgent.findByStaticId(rfpRequest.rdId)
    const { sourceId, source } = rdApplication.tradeReference

    this.logger.info('Creating trade and cargo snapshot', { sourceId, source })
    const trade = await this.tradeCargoClient.getTrade(sourceId, source)
    const movements = await this.tradeCargoClient.getMovements(trade._id)
    await this.tradeSnapshotDataAgent.updateCreate({
      source,
      sourceId,
      trade,
      movements
    })
    /**
     * Can't get the tradeSnapshot back from 'Model.updateOne'. It doesn't return it.
     * Using findOneAndUpdate or create returns it, but won't allow us use { timestamps: false }
     * And create also might fail if the tradeSnapshot has already been created.
     * Therefore, we updateCreate, and then findByTradeSourceId
     */
    const tradeSnapshot = await this.tradeSnapshotDataAgent.findByTradeSourceId(sourceId)

    this.logger.info('Creating RFP Request')
    const request = this.createRFPRequestQuery(rdApplication, tradeSnapshot, rfpRequest.participantStaticIds)
    const rfpResponse = await this.rfpClient.postRFPRequest(request)
    this.logger.info('RFP Request successfully created', { response: rfpResponse })

    this.logger.info('Saving RFP Request in Database')
    const rfpRequestCompleted = this.createRFPRequest(rfpResponse.staticId, rfpRequest, request.rfp.productRequest)
    await this.rfpDataAgent.create(rfpRequestCompleted)

    return rfpResponse
  }

  private createRFPRequestQuery(
    rd: IReceivablesDiscounting,
    tradeSnapshot: ITradeSnapshot,
    participantStaticIds: string[]
  ): ICreateRFPRequest {
    return {
      rfp: {
        context: {
          productId: PRODUCT_ID,
          subProductId: SubProductId.ReceivableDiscounting,
          rdId: rd.staticId
        },
        productRequest: timestamp({
          rd,
          trade: tradeSnapshot
        })
      },
      participantStaticIds
    }
  }

  private createRFPRequest(
    rfpId: string,
    request: ReceivablesDiscountingRFPRequest,
    timestamps: ITimestamp
  ): IRFPRequest {
    return {
      rfpId,
      rdId: request.rdId,
      participantStaticIds: request.participantStaticIds,
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt
    }
  }
}
