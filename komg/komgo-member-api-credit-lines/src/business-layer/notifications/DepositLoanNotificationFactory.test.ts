import { buildFakeDisclosedDepositLoan, DepositLoanType, IDisclosedDepositLoan } from '@komgo/types'
import 'reflect-metadata'

import { getCurrencyAndTenorInfo } from '../utils/utils'

import { DepositLoanNotificationFactory } from './DepositLoanNotificationFactory'
import { NotificationOperation } from './NotificationOperation'

describe('DepositLoanNotificationFactory', () => {
  const factory: DepositLoanNotificationFactory = new DepositLoanNotificationFactory()

  describe('Deposit', () => {
    const deposit = buildFakeDisclosedDepositLoan({ type: DepositLoanType.Deposit })

    const bankName = '[Bank Name]'
    it('should get proper message for Disclosed', () => {
      const message = factory.getNotification(NotificationOperation.Disclosed, deposit, bankName)
      expect(message).toMatchObject({
        message: `${bankName} has added Deposit information on ${getCurrencyAndTenorInfo(deposit)}`,
        context: contextBuilder(deposit)
      })
    })

    it('should get proper message for Updated', () => {
      const message = factory.getNotification(NotificationOperation.UpdateDisclosed, deposit, bankName)
      expect(message).toMatchObject({
        message: `${bankName} has updated Deposit information on ${getCurrencyAndTenorInfo(deposit)}`,
        context: contextBuilder(deposit)
      })
    })

    it('should get proper message for Revoked', () => {
      const message = factory.getNotification(NotificationOperation.RevokeDisclosed, deposit, bankName)
      expect(message).toMatchObject({
        message: `${bankName} has updated Deposit information on ${getCurrencyAndTenorInfo(deposit)}`,
        context: contextBuilder(deposit)
      })
    })
  })

  describe('Loan', () => {
    const deposit = buildFakeDisclosedDepositLoan({ type: DepositLoanType.Loan })

    const bankName = '[Bank Name]'
    it('should get proper message for Disclosed', () => {
      const message = factory.getNotification(NotificationOperation.Disclosed, deposit, bankName)
      expect(message).toMatchObject({
        message: `${bankName} has added Loan information on ${getCurrencyAndTenorInfo(deposit)}`,
        context: contextBuilder(deposit)
      })
    })

    it('should get proper message for Updated', () => {
      const message = factory.getNotification(NotificationOperation.UpdateDisclosed, deposit, bankName)
      expect(message).toMatchObject({
        message: `${bankName} has updated Loan information on ${getCurrencyAndTenorInfo(deposit)}`,
        context: contextBuilder(deposit)
      })
    })

    it('should get proper message for Revoked', () => {
      const message = factory.getNotification(NotificationOperation.RevokeDisclosed, deposit, bankName)
      expect(message).toMatchObject({
        message: `${bankName} has updated Loan information on ${getCurrencyAndTenorInfo(deposit)}`,
        context: contextBuilder(deposit)
      })
    })
  })
})

const contextBuilder = (data: IDisclosedDepositLoan) => {
  return {
    ownerStaticId: data.ownerStaticId,
    type: data.type,
    currency: data.currency,
    period: data.period,
    periodDuration: data.periodDuration
  }
}
