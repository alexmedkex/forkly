import { getLogger } from '@komgo/logging'
import { IReceivablesDiscountingBase, IReceivablesDiscountingCreated } from '@komgo/types'
import { injectable, inject } from 'inversify'

import { ReceivablesDiscountingDataAgent } from '../../../data-layer/data-agents'
import { TYPES } from '../../../inversify'
import { ReceivablesDiscountingValidator } from '../../validation'

@injectable()
export class CreateRDUseCase {
  private readonly logger = getLogger('CreateRDUseCase')

  constructor(
    @inject(TYPES.ReceivablesDiscountingValidator) private readonly rdValidator: ReceivablesDiscountingValidator,
    @inject(TYPES.ReceivablesDiscountingDataAgent) private readonly rdDataAgent: ReceivablesDiscountingDataAgent
  ) {}

  /**
   * Creates a new RD application by validating the data and saving it in DB
   *
   * @param rdBase RD data to save
   */
  public async execute(rdBase: IReceivablesDiscountingBase): Promise<IReceivablesDiscountingCreated> {
    this.logger.info('Validating Receivable discounting application')
    await this.rdValidator.validate(rdBase)

    const rdApplication = await this.rdDataAgent.create(rdBase)
    this.logger.info('Saved Receivables discounting application', {
      staticId: rdApplication.staticId,
      sellerEtrmId: rdApplication.tradeReference.sellerEtrmId
    })

    return { staticId: rdApplication.staticId }
  }
}
