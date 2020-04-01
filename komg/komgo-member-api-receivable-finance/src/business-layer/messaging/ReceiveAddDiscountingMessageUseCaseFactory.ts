import { injectable, inject } from 'inversify'

import { TYPES } from '../../inversify'
import { ReceiveAddDiscountingRequestUseCase } from '../add-discounting'

import { AddDiscountingRequestType } from './types/AddDiscountingRequestType'

@injectable()
export class ReceiveAddDiscountingMessageUseCaseFactory {
  private useCases: object

  constructor(
    @inject(TYPES.ReceiveAddDiscountingRequestUseCase)
    receiveAddDiscountingRequestUseCase: ReceiveAddDiscountingRequestUseCase
  ) {
    this.useCases = {
      [AddDiscountingRequestType.Add]: receiveAddDiscountingRequestUseCase
    }
  }

  public getUseCase(addDiscountingMessageType: AddDiscountingRequestType) {
    return this.useCases[addDiscountingMessageType]
  }
}
