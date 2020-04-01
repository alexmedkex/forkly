import { INotificationCreateRequest } from '@komgo/notification-publisher'
// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { IDisclosedCreditLineDataAgent } from '../../../../data-layer/data-agents/IDisclosedCreditLineDataAgent'
import { IDisclosedCreditLine } from '../../../../data-layer/models/IDisclosedCreditLine'
import { ICreditLineRequestService } from '../../../CreditLineRequestService'
import { ICreditLineValidationService } from '../../../CreditLineValidationService'
import InvalidDataError from '../../../errors/InvalidDataError'
import { INotificationFactory, NotificationFactory } from '../../../notifications'
import { NotificationOperation } from '../../../notifications/NotificationOperation'
import { NotificationClient } from '../../../notifications/notifications/NotificationClient'
import { getNotificationType } from '../../../utils/utils'
import { ISharedCreditLineMessage } from '../../messages/IShareCreditLineMessage'
import { MessageType } from '../../MessageTypes'
import { buildFakeSharedCreditLineMessage, buildProcessorMocks } from '../test-utils/testUtils'

import CreditLineEventProcessorBase from './CreditLineEventProcessorBase'

const dataBuildMock = jest.fn().mockReturnValue({
  appetite: true
})

class MockProcessor extends CreditLineEventProcessorBase {
  public messageType: MessageType.ShareCreditLine

  constructor(
    disclosedCreditLineDataAgent: IDisclosedCreditLineDataAgent,
    validationService: ICreditLineValidationService,
    notificationClient: NotificationClient,
    creditLineRequestService: ICreditLineRequestService,
    notificationFactory: INotificationFactory
  ) {
    super(
      disclosedCreditLineDataAgent,
      validationService,
      notificationClient,
      creditLineRequestService,
      notificationFactory,
      'logger'
    )
  }

  protected prepareDisclosedCreditLineData(messageData: ISharedCreditLineMessage): Partial<IDisclosedCreditLine> {
    return dataBuildMock()
  }

  protected getNotification(
    data: IDisclosedCreditLine,
    ownerCompanyName: string,
    counterpartyCompanyName: string,
    existing: IDisclosedCreditLine
  ): Promise<INotificationCreateRequest> {
    return Promise.resolve(
      this.notificationFactory.getNotification(
        getNotificationType(data.context, NotificationOperation.Disclosed),
        data,
        ownerCompanyName,
        counterpartyCompanyName
      )
    )
  }
}

describe('CreditLineEventProcessorBase', () => {
  const { disclosedDataAgent, validationService, notificationClient, creditLineRequestService } = buildProcessorMocks(
    createMockInstance
  )

  const processor = new MockProcessor(
    disclosedDataAgent,
    validationService,
    notificationClient,
    creditLineRequestService,
    new NotificationFactory()
  )

  const message = buildFakeSharedCreditLineMessage()

  beforeEach(() => {
    jest.clearAllMocks()
    disclosedDataAgent.findOne.mockReset()
  })

  it('should fail if invalid data owner', async () => {
    validationService.validateCreditLineOwner.mockImplementationOnce(() => {
      throw new InvalidDataError(`Company is not financial institution`)
    })

    await expect(processor.processMessage(message)).rejects.toThrowError(InvalidDataError)
  })

  it('should fail if invalid counterparty', async () => {
    validationService.validateCreditLineOwner.mockImplementationOnce(() => {
      throw new InvalidDataError(`Company with does not exist in registry`)
    })

    await expect(processor.processMessage(message)).rejects.toThrowError(InvalidDataError)
  })

  it('should process new disclosed line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)

    await processor.processMessage(message)

    expect(disclosedDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(disclosedDataAgent.create).toHaveBeenCalledTimes(1)
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          disclosedCreditLineId: message.staticId
        })
      })
    )
  })

  it('should process existing disclosed line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId' } as any)
    dataBuildMock.mockReturnValueOnce(null)

    await processor.processMessage(message)

    expect(disclosedDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(disclosedDataAgent.update).toHaveBeenCalledWith(expect.objectContaining({ staticId: 'staticId' }))
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          disclosedCreditLineId: message.staticId
        })
      })
    )
  })
})
