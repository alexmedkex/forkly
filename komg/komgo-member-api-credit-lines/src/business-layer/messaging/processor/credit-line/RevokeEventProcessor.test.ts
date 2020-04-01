// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { NotificationFactory } from '../../../notifications'
import { buildProcessorMocks, buildFakeSharedCreditLineMessage } from '../test-utils/testUtils'

import RevokeEventProcessor from './RevokeEventProcessor'

describe('RevokeEventProcessor', () => {
  const { disclosedDataAgent, validationService, notificationClient, creditLineRequestService } = buildProcessorMocks(
    createMockInstance
  )

  function assertDislosedData(creatingNew: boolean, staticId: string) {
    expect(disclosedDataAgent.findOne).toHaveBeenCalledTimes(1)
    expect(creatingNew ? disclosedDataAgent.create : disclosedDataAgent.update).toHaveBeenCalledTimes(1)
    expect(notificationClient.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          disclosedCreditLineId: staticId
        }),
        message: `Bank name has updated risk cover information on Buyer name`
      })
    )
  }

  const processor = new RevokeEventProcessor(
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

    assertDislosedData(true, 'staticId')
  })

  it('should process new disclosed credit line with no data', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce(null)
    const messageData = { ...message, data: undefined }

    await processor.processMessage(messageData)

    assertDislosedData(true, 'staticId')
  })

  it('should process existing disclosed credit line', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: '1', appetite: false } as any)

    await processor.processMessage(message)

    assertDislosedData(false, 'staticId')
  })

  it('should process existing disclosed credit line with update', async () => {
    disclosedDataAgent.findOne.mockResolvedValueOnce({ staticId: 'staticId', appetite: true } as any)
    await processor.processMessage(message)
    assertDislosedData(false, 'staticId')
  })
})
