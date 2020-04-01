// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { NotificationFactory } from '../../../notifications'
import { buildProcessorMocks, buildFakeSharedCreditLineMessage } from '../test-utils/testUtils'

import ShareEventProcessor from './ShareEventProcessor'

describe('ShareEventProcessor', () => {
  const { disclosedDataAgent, validationService, notificationClient, creditLineRequestService } = buildProcessorMocks(
    createMockInstance
  )

  function assertDislosedData(creatingNew: boolean, message: string, staticId: string) {
    expect(disclosedDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(creatingNew ? disclosedDataAgent.create : disclosedDataAgent.update).toHaveBeenCalledTimes(1)
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          disclosedCreditLineId: staticId
        }),
        message
      })
    )
  }

  const processor = new ShareEventProcessor(
    disclosedDataAgent,
    validationService,
    notificationClient,
    creditLineRequestService,
    new NotificationFactory()
  )
  const message = buildFakeSharedCreditLineMessage()
  beforeEach(() => {
    jest.clearAllMocks()
    disclosedDataAgent.findOne.mockClear()
    disclosedDataAgent.create.mockClear()
    disclosedDataAgent.update.mockClear()
  })

  it('should process new disclosed credit line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)

    await processor.processMessage(message)

    assertDislosedData(true, `Bank name has added risk cover information on Buyer name`, 'staticId')
  })

  it('should process new disclosed credit line with no data', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)
    const messageData = { ...message, data: undefined }

    await processor.processMessage(messageData)

    assertDislosedData(true, `Bank name has added risk cover information on Buyer name`, 'staticId')
  })

  it('should process existing disclosed credit line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: '1', appetite: false } as any)

    await processor.processMessage(message)

    assertDislosedData(false, `Bank name has added risk cover information on Buyer name`, 'staticId')
  })

  it('should process existing disclosed credit line with update', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId', appetite: true } as any)
    await processor.processMessage(message)
    assertDislosedData(false, `Bank name has updated risk cover information on Buyer name`, 'staticId')
  })
})
