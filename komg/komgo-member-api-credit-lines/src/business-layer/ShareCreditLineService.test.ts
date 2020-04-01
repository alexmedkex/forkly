import { buildFakeRiskCover, buildFakeRiskCoverSharedCreditLine } from '@komgo/types'
// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { CreditLineRequestService } from './CreditLineRequestService'
import { MessageType } from './messaging/MessageTypes'
import { RequestClient } from './messaging/RequestClient'
import { ShareCreditLineService } from './ShareCreditLineService'
import { buildFakeCreditLineRequest } from './testUtils'

describe('ShareCreditLineService', () => {
  let shareCreditLineService: ShareCreditLineService
  const mockedRequestClient = createMockInstance(RequestClient)
  mockedRequestClient.sendCommonRequest = jest.fn()

  const mockCreditLineRequestService = createMockInstance(CreditLineRequestService)

  const sharedCreditLine = buildFakeRiskCoverSharedCreditLine()
  const existingSharedCL = buildFakeRiskCoverSharedCreditLine()
  const creditLine = buildFakeRiskCover()
  const existingCreditLine = buildFakeRiskCover()

  beforeEach(() => {
    shareCreditLineService = new ShareCreditLineService(mockCreditLineRequestService, mockedRequestClient, 'company-id')
  })

  it('should not send message if appetite not shared', async () => {
    const notShared = { ...sharedCreditLine, data: { ...sharedCreditLine.data, appetite: { shared: false } } }
    const existingNotShared = { ...sharedCreditLine, data: { ...sharedCreditLine.data, appetite: { shared: false } } }

    await shareCreditLineService.process(notShared, existingNotShared, null, null)

    expect(mockedRequestClient.sendCommonRequest).not.toHaveBeenCalled()
  })

  describe('Revoke message', () => {
    it('should send revoke if appetite not disclosed on seller', async () => {
      const notShared = { ...sharedCreditLine, data: { ...sharedCreditLine.data, appetite: { shared: false } } }

      await shareCreditLineService.process(notShared, existingSharedCL, creditLine, existingCreditLine)

      expect(mockedRequestClient.sendCommonRequest).toHaveBeenCalledWith(
        MessageType.RevokeCreditLine,
        existingSharedCL.sharedWithStaticId,
        expect.anything()
      )
    })

    it('should send revoke if seller removed', async () => {
      await shareCreditLineService.process(null, existingSharedCL, creditLine, existingCreditLine)

      expect(mockedRequestClient.sendCommonRequest).toHaveBeenCalledWith(
        MessageType.RevokeCreditLine,
        existingSharedCL.sharedWithStaticId,
        expect.anything()
      )
    })

    it('should send revoke if data deleted', async () => {
      await shareCreditLineService.process(null, existingSharedCL, null, existingCreditLine)

      expect(mockedRequestClient.sendCommonRequest).toHaveBeenCalledWith(
        MessageType.RevokeCreditLine,
        existingSharedCL.sharedWithStaticId,
        expect.anything()
      )
    })

    it('should not send revoke if shared line removed, and not shared previously', async () => {
      const existingNotShared = { ...existingSharedCL, data: { ...existingSharedCL.data, appetite: { shared: false } } }

      await shareCreditLineService.process(null, existingNotShared, creditLine, existingCreditLine)

      expect(mockedRequestClient.sendCommonRequest).not.toHaveBeenCalledWith()
    })
  })

  describe('Share credit line', () => {
    it('should share if added shared credit line', async () => {
      await shareCreditLineService.process(sharedCreditLine, null, creditLine, existingCreditLine)

      expect(mockedRequestClient.sendCommonRequest).toHaveBeenCalledWith(
        MessageType.ShareCreditLine,
        sharedCreditLine.sharedWithStaticId,
        expect.anything()
      )
    })

    it('should share it added credit line', async () => {
      await shareCreditLineService.process(sharedCreditLine, null, creditLine, null)

      expect(mockedRequestClient.sendCommonRequest).toHaveBeenCalledWith(
        MessageType.ShareCreditLine,
        sharedCreditLine.sharedWithStaticId,
        expect.anything()
      )
    })

    it('should not share if no data has been changed', async () => {
      await shareCreditLineService.process(sharedCreditLine, sharedCreditLine, creditLine, creditLine)

      expect(mockedRequestClient.sendCommonRequest).not.toHaveBeenCalled()
    })

    it('should share if no data has been changed but request exists', async () => {
      const request = buildFakeCreditLineRequest()
      mockCreditLineRequestService.getPendingRequest.mockResolvedValueOnce(request)

      await shareCreditLineService.process(sharedCreditLine, sharedCreditLine, creditLine, creditLine)
      expect(mockedRequestClient.sendCommonRequest).toHaveBeenCalled()
    })
  })
})
