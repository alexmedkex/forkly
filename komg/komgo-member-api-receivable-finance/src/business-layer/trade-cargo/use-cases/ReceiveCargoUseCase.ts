import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ICargoMessage } from '@komgo/messaging-types'
import { ICargo, ITradeSnapshot } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { TradeSnapshotDataAgent } from '../../../data-layer/data-agents'
import { ErrorName } from '../../../ErrorName'
import { TYPES } from '../../../inversify'
import { InvalidPayloadProcessingError } from '../../errors'
import { ShareTradeSnapshotUseCase } from '../../trade-snapshot/use-cases'
import { TradeSnapshotValidator } from '../../validation'
import { createCleanSnapshot } from '../utils'

const replaceCargo = (updatedCargo: ICargo) => (v: ICargo) => (v._id === updatedCargo._id ? updatedCargo : v)
const isSameCargo = (updatedCargo: ICargo) => (v: ICargo) => v._id === updatedCargo._id

@injectable()
export class ReceiveCargoUseCase {
  private logger = getLogger('ReceiveCargoUseCase')

  constructor(
    @inject(TYPES.TradeSnapshotDataAgent) private readonly tradeDataAgent: TradeSnapshotDataAgent,
    @inject(TYPES.TradeSnapshotValidator) private readonly tradeSnapshotValidator: TradeSnapshotValidator,
    @inject(TYPES.ShareTradeSnapshotUseCase) private readonly shareTradeSnapshotUseCase: ShareTradeSnapshotUseCase
  ) {}

  public async execute(message: ICargoMessage): Promise<void> {
    const updatedCargo: ICargo = message.cargo as ICargo
    const logContext = {
      sourceId: updatedCargo.sourceId,
      source: updatedCargo.source,
      cargo_id: updatedCargo._id
    }
    this.logger.info('Received Internal Cargo Updated message from api-trade-cargo', logContext)

    const currentTradeSnapshot = await this.tradeDataAgent.findByTradeSourceId(updatedCargo.sourceId)
    if (!currentTradeSnapshot) {
      this.logger.info('Ignore internal Cargo message as there is no previous Trade Snapshot to update', logContext)
      return
    }

    if (!this.isValidCargoUpdate(currentTradeSnapshot, updatedCargo)) {
      return
    }
    await this.tradeSnapshotValidator.validateAcceptedRD(updatedCargo.sourceId)

    if (!this.isAlreadyUpdated(currentTradeSnapshot, updatedCargo)) {
      const currentMovements: ICargo[] = currentTradeSnapshot.movements
      // update old one or add new one
      const shouldUpdateCargo = currentMovements.some(isSameCargo(updatedCargo))

      // update if is newer. if not, share only
      const updatedMovements: ICargo[] = shouldUpdateCargo
        ? currentTradeSnapshot.movements.map(replaceCargo(updatedCargo))
        : currentTradeSnapshot.movements.concat([updatedCargo])
      const updatedTradeSnapshot: ITradeSnapshot = createCleanSnapshot(currentTradeSnapshot, {
        movements: updatedMovements
      })
      await this.tradeDataAgent.update(updatedTradeSnapshot)
    } else {
      this.logger.info('Processing a duplicate, sharing TradeSnapshot update only', logContext)
    }

    await this.shareTradeSnapshotUseCase.execute(updatedCargo.sourceId)
    this.logger.info('Trade Snapshot updated and shared with bank')
  }

  private logAndThrowProcessingError(errorMsg: string, errorName: ErrorName, context?: any) {
    const msg = `Unable to process Cargo update from api-trade-cargo - ${errorMsg}`
    this.logger.error(ErrorCode.ValidationInternalAMQP, errorName, msg, context)
    throw new InvalidPayloadProcessingError(msg)
  }

  /**
   * Validate the ICargo update is valid: there is a cargo with same ID and the createdAt is newer
   */
  private isValidCargoUpdate(currentTradeSnapshot: ITradeSnapshot, updatedCargo: ICargo): boolean {
    const logContext = {
      sourceId: updatedCargo.sourceId,
      source: updatedCargo.source,
      cargo_id: updatedCargo._id
    }
    const relatedMovement: ICargo[] = currentTradeSnapshot.movements.filter(isSameCargo(updatedCargo))
    if (relatedMovement.length > 1) {
      this.logAndThrowProcessingError(
        `Invalid update. There are ${relatedMovement.length} movements to be updated with this Cargo _id`,
        ErrorName.ReceivedUpdatedCargoFailedMovementNotFound,
        {
          ...logContext,
          relatedMovementsCount: relatedMovement.length
        }
      )
    }
    if (relatedMovement.length > 0) {
      // if there is an older cargo, check the createdAt date of snapshot against updatedAt of ICargo
      const oldCargo: ICargo = relatedMovement[0]
      if (this.isUpdateBeforeSavedData(updatedCargo, oldCargo)) {
        this.logger.info('Ignore internal Cargo message as the received one is older than saved one', {
          ...logContext,
          latestSavedUpdate: oldCargo.updatedAt,
          latestSavedSnapshot: currentTradeSnapshot.createdAt,
          incomingUpdate: updatedCargo.updatedAt
        })
        return false
      }
    }
    return true
  }

  private isUpdateBeforeSavedData(updatedCargo: ICargo, oldCargo: ICargo) {
    return new Date(updatedCargo.updatedAt).getTime() < new Date(oldCargo.updatedAt).getTime()
  }

  private isAlreadyUpdated(currentTradeSnapshot: ITradeSnapshot, updatedCargo: ICargo): boolean {
    const existentCargo: ICargo[] = currentTradeSnapshot.movements.filter(isSameCargo(updatedCargo))
    if (existentCargo.length > 0 && updatedCargo.updatedAt && existentCargo[0].updatedAt) {
      return new Date(updatedCargo.updatedAt).getTime() === new Date(existentCargo[0].updatedAt).getTime()
    }
    return false
  }
}
