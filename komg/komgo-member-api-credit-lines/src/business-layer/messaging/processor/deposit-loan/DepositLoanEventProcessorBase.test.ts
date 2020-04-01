import { INotificationCreateRequest } from '@komgo/notification-publisher'
import { IDisclosedDepositLoan, DepositLoanType } from '@komgo/types'
// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import DisclosedDepositLoanDataAgent from '../../../../data-layer/data-agents/DisclosedDepositLoanDataAgent'
import { IDisclosedDepositLoanDataAgent } from '../../../../data-layer/data-agents/IDisclosedDepositLoanDataAgent'
import { ICreditLineValidationService, CreditLineValidationService } from '../../../CreditLineValidationService'
import { FeatureType } from '../../../enums/feature'
import InvalidDataError from '../../../errors/InvalidDataError'
import { DepositLoanNotificationFactory } from '../../../notifications/DepositLoanNotificationFactory'
import { NotificationOperation } from '../../../notifications/NotificationOperation'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { ISharedDepositLoanMessage } from '../../messages/IShareDepositLoanMessage'
import { MessageType } from '../../MessageTypes'
import { buildFakeSharedDepositLoanMessage, getValidationServiceMock } from '../test-utils/testUtils'

import DepositLoanEventProcessorBase from './DepositLoanEventProcessorBase'
import {
  IDepositLoanValidationService,
  DepositLoanValidationService
} from '../../../deposit-loan/DepositLoanValidationService'

const dataBuildMock = jest.fn().mockReturnValue({
  appetite: true
})

class MockProcessor extends DepositLoanEventProcessorBase {
  public messageType: MessageType = MessageType.CreditLineRequest

  constructor(
    disclosedCreditLineDataAgent: IDisclosedDepositLoanDataAgent,
    validationService: ICreditLineValidationService,
    notificationClient: NotificationClient,
    notificationFactory: DepositLoanNotificationFactory,
    depositLoanValidationService: IDepositLoanValidationService
  ) {
    super(
      disclosedCreditLineDataAgent,
      validationService,
      notificationClient,
      notificationFactory,
      depositLoanValidationService,
      'logger'
    )
  }

  protected prepareDisclosedDepositLoanData(messageData: ISharedDepositLoanMessage): Partial<IDisclosedDepositLoan> {
    return dataBuildMock()
  }

  protected getNotification(
    data: IDisclosedDepositLoan,
    ownerCompanyName: string,
    existing: IDisclosedDepositLoan
  ): Promise<INotificationCreateRequest> {
    return Promise.resolve(
      this.notificationFactory.getNotification(NotificationOperation.Disclosed, data, ownerCompanyName)
    )
  }
}

describe('DepositLoanEventProcessor', () => {
  let processor: MockProcessor
  let disclosedCreditLineDataAgent: jest.Mocked<IDisclosedDepositLoanDataAgent>
  let validationService: jest.Mocked<CreditLineValidationService>
  let notificationClient: jest.Mocked<NotificationClient>
  let depositLoanValidationService: jest.Mocked<IDepositLoanValidationService>

  const message = buildFakeSharedDepositLoanMessage()

  beforeEach(() => {
    disclosedCreditLineDataAgent = createMockInstance(DisclosedDepositLoanDataAgent)
    disclosedCreditLineDataAgent.create.mockResolvedValue('staticId')

    validationService = getValidationServiceMock(createMockInstance)
    notificationClient = createMockInstance(NotificationClient)
    depositLoanValidationService = createMockInstance(DepositLoanValidationService)

    processor = new MockProcessor(
      disclosedCreditLineDataAgent,
      validationService,
      notificationClient,
      new DepositLoanNotificationFactory(),
      depositLoanValidationService
    )
  })

  it('should process only deposit/loan message', async () => {
    validationService.validateCreditLineOwner.mockImplementationOnce(() => {
      throw new InvalidDataError(`Company is not financial institution`)
    })

    const messages = [
      {
        message: {
          messageType: MessageType.CreditLineRequest,
          featureType: FeatureType.Loan
        },
        shouldProcess: true
      },
      {
        message: {
          messageType: MessageType.CreditLineRequest,
          featureType: FeatureType.Deposit
        },
        shouldProcess: true
      },
      {
        message: {
          messageType: MessageType.CreditLineRequest,
          featureType: FeatureType.BankLine
        },
        shouldProcess: false
      },
      {
        message: {
          messageType: MessageType.CreditLineRequest,
          featureType: FeatureType.RiskCover
        },
        shouldProcess: false
      },
      {
        message: {
          messageType: MessageType.RevokeCreditLine, // not one from MockProcessor
          featureType: FeatureType.RiskCover
        },
        shouldProcess: false
      }
    ]

    messages.forEach(m => {
      expect(processor.shouldProcess(m.message as any)).toBe(m.shouldProcess)
    })
  })

  it('should fail if invalid data owner', async () => {
    validationService.validateCreditLineOwner.mockImplementationOnce(() => {
      throw new InvalidDataError(`Company is not financial institution`)
    })

    await expect(processor.processMessage(message)).rejects.toThrowError(InvalidDataError)
  })

  it('should process new disclosed line', async () => {
    disclosedCreditLineDataAgent.findOne.mockResolvedValueOnce(null)

    await processor.processMessage(message)

    expect(disclosedCreditLineDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(disclosedCreditLineDataAgent.create).toHaveBeenCalledTimes(1)
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          type: DepositLoanType.Deposit
        })
      })
    )
  })

  it('should process existing disclosed line', async () => {
    disclosedCreditLineDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId' } as any)
    dataBuildMock.mockReturnValueOnce(null)

    await processor.processMessage(message)

    expect(disclosedCreditLineDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(disclosedCreditLineDataAgent.update).toHaveBeenCalledWith(expect.objectContaining({ staticId: 'staticId' }))
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          type: DepositLoanType.Deposit
        })
      })
    )
  })
})
