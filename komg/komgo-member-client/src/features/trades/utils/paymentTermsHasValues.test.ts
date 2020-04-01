import * as React from 'react'
import { buildFakeTrade } from '@komgo/types'
import { paymentTermsHasValues } from './paymentTermsHasValues'

describe('paymentTermsHasValues', () => {
  it('returns true when payment terms values are all set', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues(paymentTerms)).toEqual(true)
  })
  it('returns false when a payment terms eventbase is null', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues({ ...paymentTerms, eventBase: null })).toEqual(false)
  })
  it('returns false when a payment terms "when" is null', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues({ ...paymentTerms, when: null })).toEqual(false)
  })
  it('returns false when a payment terms "time" is null', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues({ ...paymentTerms, time: null })).toEqual(false)
  })
  it('returns true when a payment terms "time" is zero', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues({ ...paymentTerms, time: 0 })).toEqual(true)
  })
  it('returns false when a payment terms "timeUnit" is null', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues({ ...paymentTerms, timeUnit: null })).toEqual(false)
  })
  it('returns false when a payment terms "dayType" is null', () => {
    const { paymentTerms } = buildFakeTrade()

    expect(paymentTermsHasValues({ ...paymentTerms, dayType: null })).toEqual(false)
  })
  it('returns false when paymentTerms object is undefined', () => {
    expect(paymentTermsHasValues(undefined as any)).toEqual(false)
  })
})
