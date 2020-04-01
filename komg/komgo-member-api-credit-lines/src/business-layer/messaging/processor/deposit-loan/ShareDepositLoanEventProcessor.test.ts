// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import DisclosedDepositLoanDataAgent from '../../../../data-layer/data-agents/DisclosedDepositLoanDataAgent'
import { IDisclosedDepositLoanDataAgent } from '../../../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { CreditLineValidationService } from '../../../CreditLineValidationService'
import { DepositLoanNotificationFactory } from '../../../notifications/DepositLoanNotificationFactory'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { buildFakeSharedDepositLoanMessage, getValidationServiceMock } from '../test-utils/testUtils'

import ShareDepositLoanEventProcessor from './ShareDepositLoanEventProcessor'
import { DepositLoanType } from '@komgo/types'
import { DepositLoanValidationService } from '../../../deposit-loan/DepositLoanValidationService'

describe('ShareDepositLoanEventProcessor.test', () => {
  let processor: ShareDepositLoanEventProcessor
  let disclosedDataAgent: jest.Mocked<IDisclosedDepositLoanDataAgent>
  let validationService: jest.Mocked<CreditLineValidationService>
  let notificationClient: jest.Mocked<NotificationClient>
  let depositLoanValidationService: jest.Mocked<DepositLoanValidationService>

  const message = buildFakeSharedDepositLoanMessage()

  beforeEach(() => {
    disclosedDataAgent = createMockInstance(DisclosedDepositLoanDataAgent)
    depositLoanValidationService = createMockInstance(DepositLoanValidationService)
    disclosedDataAgent.create.mockResolvedValue('staticId')

    validationService = getValidationServiceMock(createMockInstance)
    notificationClient = createMockInstance(NotificationClient)

    processor = new ShareDepositLoanEventProcessor(
      disclosedDataAgent,
      validationService,
      notificationClient,
      new DepositLoanNotificationFactory(),
      depositLoanValidationService
    )
  })

  function assertDislosedData(creatingNew: boolean, messageData: string, staticId: string) {
    expect(disclosedDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(creatingNew ? disclosedDataAgent.create : disclosedDataAgent.update).toHaveBeenCalledTimes(1)
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          type: DepositLoanType.Deposit
        }),
        message: messageData
      })
    )
  }

  it('should process new disclosed deposit / loan', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)

    await processor.processMessage(message)

    assertDislosedData(true, `Bank name has added Deposit information on USD 3 months`, 'staticId')
  })

  it('should process new disclosed deposit / loan with no data', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)
    const messageData = { ...message, data: undefined }

    await processor.processMessage(messageData)

    assertDislosedData(true, `Bank name has added Deposit information on USD 3 months`, 'staticId')
  })

  it('should process existing disclosed deposit / loan', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId', appetite: false } as any)

    await processor.processMessage(message)

    assertDislosedData(false, `Bank name has added Deposit information on USD 3 months`, 'staticId')
  })

  it('should process existing disclosed deposit / loan with update', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId', appetite: true } as any)
    await processor.processMessage(message)
    assertDislosedData(false, `Bank name has updated Deposit information on USD 3 months`, 'staticId')
  })
})
