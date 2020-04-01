import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IRFPMessage, IRFPRequestPayload } from '@komgo/messaging-types'
import { tradeFinanceManager } from '@komgo/permissions'
import { IReceivablesDiscounting } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent, RFPDataAgent, TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { IRFPRequest } from '../../../data-layer/models/rfp/IRFPRequestDocument'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify/types'
import { InvalidPayloadProcessingError } from '../../errors'
import { TaskClient, CompanyRegistryClient } from '../../microservice-clients'
import { TaskType, IProductRequest } from '../../types'

import { IReceiveMessageUseCase } from './IReceiveMessageUseCase'

@injectable()
export class ReceiveRequestMessageUseCase implements IReceiveMessageUseCase {
  private readonly logger = getLogger('ReceiveRequestMessageUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingDataAgent)
    private readonly receivablesDiscountingDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeSnapshotDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.RFPDataAgent) private readonly rfpDataAgent: RFPDataAgent,
    @inject(TYPES.TaskClient) private readonly taskClient: TaskClient,
    @inject(TYPES.CompanyRegistryClient) private readonly companyRegistryClient: CompanyRegistryClient
  ) {}

  /**
   * @throws InvalidPayloadProcessingError if the payload is invalid and can't be processed
   */
  public async execute(message: IRFPMessage<IRFPRequestPayload<IProductRequest>>) {
    this.logger.info('Processing received Request message', {
      message: { version: message.version, context: message.context, senderStaticId: message.data.senderStaticID }
    })

    const productRequest = message.data.productRequest

    await this.validateRFPRequest(productRequest.rd)
    await this.receivablesDiscountingDataAgent.updateCreate(productRequest.rd)
    await this.tradeSnapshotDataAgent.updateCreate(productRequest.trade)
    const rfpRequest: IRFPRequest = {
      rfpId: message.data.rfpId,
      rdId: productRequest.rd.staticId,
      participantStaticIds: [], // empty as we are the recipient bank,
      senderStaticId: message.data.senderStaticID,
      createdAt: productRequest.createdAt,
      updatedAt: productRequest.updatedAt
    }
    await this.rfpDataAgent.updateCreate(rfpRequest)

    this.logger.info('Successfully processed message from RFP for a Request', {
      rfpRequest
    })

    await this.sendTask(message.context, message.data.senderStaticID)
  }

  private async validateRFPRequest(rd: IReceivablesDiscounting) {
    const savedRD = await this.receivablesDiscountingDataAgent.findByStaticId(rd.staticId)
    if (savedRD && new Date(savedRD.createdAt).getTime() !== new Date(rd.createdAt).getTime()) {
      this.logger.error(ErrorCode.ValidationInternalAMQP, ErrorName.DuplicateRFPError, {
        savedRD,
        receivedRD: rd
      })
      throw new InvalidPayloadProcessingError('RFP Request message was already processed')
    }
  }

  private async sendTask(context: any, senderStaticId: string) {
    const taskSummary = 'Receivable discounting request received'
    const senderName = await this.companyRegistryClient.getCompanyNameFromStaticId(senderStaticId)
    const notifMsg = `${taskSummary} from ${senderName}`
    const emailData = this.taskClient.resolveTaskEmail(notifMsg)

    const task = this.taskClient.createTaskRequest(
      TaskType.RequestTaskType,
      taskSummary,
      senderStaticId,
      tradeFinanceManager.canReadRDRequests.action,
      context,
      emailData
    )
    await this.taskClient.sendTask(task, notifMsg)
  }
}
