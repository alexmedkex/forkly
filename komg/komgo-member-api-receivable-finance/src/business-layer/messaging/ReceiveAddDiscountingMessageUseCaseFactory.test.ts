import createMockInstance from 'jest-create-mock-instance'

import { ReceiveAddDiscountingRequestUseCase } from '../add-discounting'

import { ReceiveAddDiscountingMessageUseCaseFactory } from './ReceiveAddDiscountingMessageUseCaseFactory'
import { AddDiscountingRequestType } from './types/AddDiscountingRequestType'

describe('ReceiveAddDiscountingMessageUseCaseFactory', () => {
  let mockReceiveAddDiscountingMessageUseCaseFactory: ReceiveAddDiscountingMessageUseCaseFactory
  let mockReceiveAddDiscountingRequestUseCase: jest.Mocked<ReceiveAddDiscountingRequestUseCase>

  beforeEach(() => {
    mockReceiveAddDiscountingRequestUseCase = createMockInstance(ReceiveAddDiscountingRequestUseCase)
    mockReceiveAddDiscountingMessageUseCaseFactory = new ReceiveAddDiscountingMessageUseCaseFactory(
      mockReceiveAddDiscountingRequestUseCase
    )
  })

  it('should return the ReceiveAddDiscountingRequestUseCase for the AddDiscountingRequestType.Add ', () => {
    expect(mockReceiveAddDiscountingMessageUseCaseFactory.getUseCase(AddDiscountingRequestType.Add)).toEqual(
      mockReceiveAddDiscountingRequestUseCase
    )
  })
})
