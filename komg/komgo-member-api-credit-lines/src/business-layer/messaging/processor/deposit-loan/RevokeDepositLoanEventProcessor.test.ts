// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import DisclosedDepositLoanDataAgent from '../../../../data-layer/data-agents/DisclosedDepositLoanDataAgent'
import { IDisclosedDepositLoanDataAgent } from '../../../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { CreditLineValidationService } from '../../../CreditLineValidationService'
import { DepositLoanNotificationFactory } from '../../../notifications/DepositLoanNotificationFactory'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { buildFakeSharedDepositLoanMessage, getValidationServiceMock } from '../test-utils/testUtils'

import RevokeDepositLoanEventProcessor from './RevokeDepositLoanEventProcessor'
import { DepositLoanType } from '@komgo/types'
import { DepositLoanValidationService } from '../../../deposit-loan/DepositLoanValidationService'

describe('RevokeDepositLoanEventProcessor', () => {
  let processor: RevokeDepositLoanEventProcessor
  let disclosedDataAgent: jest.Mocked<IDisclosedDepositLoanDataAgent>
  let validationService: jest.Mocked<CreditLineValidationService>
  let notificationClient: jest.Mocked<NotificationClient>
  let depositLoanValidationService: jest.Mocked<DepositLoanValidationService>

  const message = buildFakeSharedDepositLoanMessage()

  function assertDislosedData(creatingNew: boolean, staticId: string) {
    expect(disclosedDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(creatingNew ? disclosedDataAgent.create : disclosedDataAgent.update).toHaveBeenCalledTimes(1)
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          type: DepositLoanType.Deposit
        }),
        message: `Bank name has updated Deposit information on USD 3 months`
      })
    )
  }

  beforeEach(() => {
    disclosedDataAgent = createMockInstance(DisclosedDepositLoanDataAgent)
    depositLoanValidationService = createMockInstance(DepositLoanValidationService)
    disclosedDataAgent.create.mockResolvedValue('staticId')

    validationService = getValidationServiceMock(createMockInstance)
    notificationClient = createMockInstance(NotificationClient)

    processor = new RevokeDepositLoanEventProcessor(
      disclosedDataAgent,
      validationService,
      notificationClient,
      new DepositLoanNotificationFactory(),
      depositLoanValidationService
    )
  })

  it('should process new disclosed credit line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)

    await processor.processMessage(message)

    assertDislosedData(true, 'staticId')
  })

  it('should process new disclosed credit line with no data', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)
    const messageData = { ...message, data: undefined }

    await processor.processMessage(messageData)

    assertDislosedData(true, 'staticId')
  })

  it('should process existing disclosed credit line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId', appetite: false } as any)

    await processor.processMessage(message)

    assertDislosedData(false, 'staticId')
  })

  it('should process existing disclosed credit line with update', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId', appetite: true } as any)
    await processor.processMessage(message)
    assertDislosedData(false, 'staticId')
  })
})
