import { getLogger } from '@komgo/logging'
import { IReceivablesDiscounting, IReceivablesDiscountingBase } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'
import {
  validateUpdateFields,
  RECEIVABLE_DISCOUNTING_UNEDITABLE_FIELDS,
  stripTradeReferenceDBFields,
  removeTimeFromDates
} from '../../../utils'
import { ReceivablesDiscountingValidator, AcceptedRDValidator } from '../../validation'

@injectable()
export class UpdateRDUseCase {
  private readonly logger = getLogger('UpdateRDUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingValidator) private readonly rdValidator: ReceivablesDiscountingValidator,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent,
    @inject(TYPES.AcceptedRDValidator) private readonly acceptedRDValidator: AcceptedRDValidator
  ) {}

  public async execute(id: string, updateRD: IReceivablesDiscountingBase): Promise<IReceivablesDiscounting> {
    this.logger.info('Updating RD', { rdId: id })

    const { rd } = await this.acceptedRDValidator.validateRDAccepted(id)
    this.rdValidator.validateFields(removeTimeFromDates(updateRD))
    validateUpdateFields(
      stripTradeReferenceDBFields(rd),
      updateRD,
      RECEIVABLE_DISCOUNTING_UNEDITABLE_FIELDS,
      this.logger
    )

    return this.rdDataAgent.update(id, updateRD)
  }
}
