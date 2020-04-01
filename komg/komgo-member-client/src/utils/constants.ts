import { Currency } from '@komgo/types'

export const JWT_VALIDITY_CHECK_INTERVAL = 10 // seconds
export const JWT_MIN_VALIDITY = 30 // seconds left on the token before it expires, if within this, then refreshed.

export const CURRENCY_SYMBOLS = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€'
}
