import { PaymentTermsEventBase, PaymentTermsWhen, PaymentTermsTimeUnit, PaymentTermsDayType } from '@komgo/types'

export const paymentTermsHasValues = (paymentTerms: {
  eventBase: PaymentTermsEventBase | string
  when: PaymentTermsWhen
  time: number
  timeUnit: PaymentTermsTimeUnit
  dayType: PaymentTermsDayType
}): boolean => {
  if (
    !paymentTerms ||
    !paymentTerms.eventBase ||
    !paymentTerms.when ||
    (!paymentTerms.time && typeof paymentTerms.time !== 'number') ||
    !paymentTerms.timeUnit ||
    !paymentTerms.dayType
  ) {
    return false
  }
  return true
}
