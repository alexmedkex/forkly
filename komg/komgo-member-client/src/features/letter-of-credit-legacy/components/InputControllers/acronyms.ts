import { Currency, PaymentTermsEventBase, DeliveryTerms } from '@komgo/types'

export const domainSpecificCasingOverrides = [
  ...Object.values(Currency),
  'komgo',
  'UCP',
  'BBL',
  'BFOET',
  PaymentTermsEventBase.BL,
  PaymentTermsEventBase.ITT,
  'LOI',
  'LC',
  'T&C',
  'New York',
  ...Object.values(DeliveryTerms).filter(d => d !== DeliveryTerms.Other)
]
