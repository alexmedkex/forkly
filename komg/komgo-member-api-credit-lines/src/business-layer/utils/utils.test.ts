import { IInformationShared, ISharedCreditLine } from '@komgo/types'
import 'reflect-metadata'

import { PRODUCT_ID, SUB_PRODUCT_ID, NotificationType } from '../notifications'

import { isAppetiteShared, getValueToShare, getNotificationType } from './utils'
import { NotificationOperation } from '../notifications/NotificationOperation'

describe('utils', () => {
  describe('isAppetiteShared', () => {
    const creditLineData: ISharedCreditLine<IInformationShared> = {
      staticId: '1',
      counterpartyStaticId: '2',
      sharedWithStaticId: '3',
      creditLineStaticId: '4',
      data: null
    }

    it('should return false if null', () => {
      expect(isAppetiteShared(null)).toBeFalsy()
    })

    it('should return false if data null', () => {
      expect(isAppetiteShared(creditLineData)).toBeFalsy()
    })

    it('should return false if appetite null', () => {
      const data = { ...creditLineData, data: { appetite: null } }
      expect(isAppetiteShared(data)).toBeFalsy()
    })

    it('should return true if appetite shared', () => {
      const data = { ...creditLineData, data: { appetite: { shared: true } } }
      expect(isAppetiteShared(data)).toBeTruthy()
    })
  })

  describe('getValueToShare', () => {
    it('should return null if no data', () => {
      expect(getValueToShare(null, () => 1111)).toBeUndefined()
    })

    it('should return null if not shared data', () => {
      expect(getValueToShare({ shared: false }, () => 1111)).toBeUndefined()
    })

    it('should return value if shared', () => {
      const value = { shared: true, value: 1111 }
      expect(getValueToShare(value, d => d.value)).toBe(value.value)
    })
  })

  describe('getNotificationType', () => {
    it('should return notificationType', () => {
      expect(
        getNotificationType(
          {
            productId: PRODUCT_ID.TradeFinance,
            subProductId: SUB_PRODUCT_ID.RiskCover
          },
          NotificationOperation.Disclosed
        )
      ).toEqual(NotificationType.DisclosedRiskCover)
    })

    it('should throw error', () => {
      try {
        getNotificationType(
          {
            productId: 'productId',
            subProductId: 'subProductId'
          },
          NotificationOperation.Disclosed
        )
      } catch (err) {
        expect(err.message).toEqual('Notification type not found based on provided context')
      }
    })
  })
})
