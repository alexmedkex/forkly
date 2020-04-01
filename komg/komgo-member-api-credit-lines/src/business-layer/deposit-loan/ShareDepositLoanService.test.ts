import { buildFakeShareDepositLoan, buildFakeDepositLoan } from '@komgo/types'
// tslint:disable-next-line: no-implicit-dependencies
import createMockInstance from 'jest-create-mock-instance'
import 'reflect-metadata'

import { CreditLineRequestService } from '../CreditLineRequestService'
import { FeatureType } from '../enums/feature'
import { MessageType } from '../messaging/MessageTypes'
import { RequestClient } from '../messaging/RequestClient'

import { ShareDepositLoanService } from './ShareDepositLoanService'

describe('ShareDepositLoanService', () => {
  let shareDepositLoanService: ShareDepositLoanService

  const mockedRequestClient = createMockInstance(RequestClient)
  mockedRequestClient.sendCommonRequest = jest.fn()

  const mockCreditLineRequestService = createMockInstance(CreditLineRequestService)

  // default value is loan, with appetite shared
  const sharedDepositLoan = buildFakeShareDepositLoan()
  const existingSharedDepositLoan = buildFakeShareDepositLoan()
  const depositLoan = buildFakeDepositLoan()
  const existingDepositLoan = buildFakeDepositLoan()

  beforeEach(() => {
    shareDepositLoanService = new ShareDepositLoanService(
      mockCreditLineRequestService,
      mockedRequestClient,
      'company-id'
    )
  })

  describe('do not send message', () => {
    it('if appetite not shared for new data', async () => {
      const notSharedAppetite = { ...sharedDepositLoan, ...{ appetite: { shared: false } } }
      const existingNotShared = { ...existingSharedDepositLoan, ...{ appetite: { shared: false } } }

      await shareDepositLoanService.process(notSharedAppetite, existingNotShared, null, null)

      expect(mockedRequestClient.sendCommonRequest).not.toHaveBeenCalled()
    })

    it('if data is same', async () => {
      await shareDepositLoanService.process(sharedDepositLoan, sharedDepositLoan, depositLoan, depositLoan)

      expect(mockedRequestClient.sendCommonRequest).not.toHaveBeenCalled()
    })
  })

  const assertMessage = (
    requestClient,
    messageType: MessageType,
    recepient: string,
    feature: FeatureType,
    appetite: boolean,
    dataAssert?: jest.Expect
  ) => {
    dataAssert =
      dataAssert ||
      expect.objectContaining({
        appetite
      })
    expect(requestClient.sendCommonRequest).toHaveBeenCalledWith(
      messageType,
      recepient,
      expect.objectContaining({
        featureType: feature,
        payload: expect.objectContaining({
          data: dataAssert
        })
      })
    )
  }

  const assertRevokeMessage = (requestClient, recepient: string, feature: FeatureType) => {
    expect(requestClient.sendCommonRequest).toHaveBeenCalledWith(
      MessageType.RevokeCreditLine,
      recepient,
      expect.objectContaining({
        featureType: feature
      })
    )
  }

  describe('Share deposit / loan message', () => {
    it('should share if new shared data has appetite shared', async () => {
      await shareDepositLoanService.process(sharedDepositLoan, null, depositLoan, null)

      assertMessage(
        mockedRequestClient,
        MessageType.ShareCreditLine,
        sharedDepositLoan.sharedWithStaticId,
        FeatureType.Loan,
        true
      )
    })

    it('should share if data changed', async () => {
      const updated = {
        ...existingSharedDepositLoan,
        ...{
          pricing: {
            shared: true,
            pricing: 1.0101
          }
        }
      }
      await shareDepositLoanService.process(updated, existingSharedDepositLoan, depositLoan, depositLoan)

      assertMessage(
        mockedRequestClient,
        MessageType.ShareCreditLine,
        sharedDepositLoan.sharedWithStaticId,
        FeatureType.Loan,
        true
      )
    })

    it('should share if new previously appetite not shared', async () => {
      const existingNotShared = { ...existingSharedDepositLoan, ...{ appetite: { shared: false } } }

      await shareDepositLoanService.process(sharedDepositLoan, existingNotShared, depositLoan, existingDepositLoan)

      assertMessage(
        mockedRequestClient,
        MessageType.ShareCreditLine,
        sharedDepositLoan.sharedWithStaticId,
        FeatureType.Loan,
        true
      )
    })

    it('should share appetite false if appetite false and displosed for new item', async () => {
      const noAppetite = { ...depositLoan, ...{ appetite: false } }
      await shareDepositLoanService.process(sharedDepositLoan, null, noAppetite, null)

      assertMessage(
        mockedRequestClient,
        MessageType.ShareCreditLine,
        sharedDepositLoan.sharedWithStaticId,
        FeatureType.Loan,
        false
      )
    })

    it('should share undefined for not shared value', async () => {
      const updated = {
        ...existingSharedDepositLoan,
        ...{
          pricing: {
            shared: false
          }
        }
      }

      await shareDepositLoanService.process(updated, existingSharedDepositLoan, depositLoan, depositLoan)

      assertMessage(
        mockedRequestClient,
        MessageType.ShareCreditLine,
        sharedDepositLoan.sharedWithStaticId,
        FeatureType.Loan,
        true,
        expect.objectContaining({
          appetite: true,
          pricing: undefined
        })
      )
    })
  })

  describe('revoke deposit / loan message', () => {
    it('should send revoke message if shared with removed', async () => {
      await shareDepositLoanService.process(null, sharedDepositLoan, depositLoan, depositLoan)

      assertRevokeMessage(mockedRequestClient, sharedDepositLoan.sharedWithStaticId, FeatureType.Loan)
    })

    it('should send revoke message if all removed', async () => {
      await shareDepositLoanService.process(null, sharedDepositLoan, null, existingDepositLoan)

      assertRevokeMessage(mockedRequestClient, sharedDepositLoan.sharedWithStaticId, FeatureType.Loan)
    })

    it('should send revoke message if shared and appetite share revoked', async () => {
      const notSharedAppetite = { ...sharedDepositLoan, ...{ appetite: { shared: false } } }

      await shareDepositLoanService.process(
        notSharedAppetite,
        existingSharedDepositLoan,
        depositLoan,
        existingDepositLoan
      )

      assertRevokeMessage(mockedRequestClient, sharedDepositLoan.sharedWithStaticId, FeatureType.Loan)
    })
  })
})
