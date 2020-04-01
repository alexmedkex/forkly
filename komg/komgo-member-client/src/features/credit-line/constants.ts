// Sonar needs this
export const CREDIT_LIMIT_AMOUNT_FIELD = 'creditLimit'
export const AVAILABILITY_AMOUNT_FIELD = 'availabilityAmount'
export const FEE_FIELD = 'data.fee'
export const MAXIMUM_TENOR_FIELD = 'data.maximumTenor'
export const MARGIN_FIELD = 'data.margin'
export const AVAILABILITY_RESERVED_AMOUNT_FIELD = 'data.availabilityReserved'
export const SHARED_STATIC_ID_FIELD = 'sharedWithStaticId'
export const SHARED_APPETITE_FIELD = 'data.appetite.shared'
export const SHARED_FEE_SHARED = 'data.fee.shared'
export const SHARED_FEE_AMOUNT = 'data.fee.fee'
export const SHARED_AVAILABILITY_SHARED_FIELD = 'data.availability.shared'
export const SHARED_MARGIN_SHARED = 'data.margin.shared'
export const SHARED_MARGIN_AMOUNT = 'data.margin.margin'
export const SHARED_AVAILABILITY_AMOUNT_SHARED_FIELD = 'data.availabilityAmount.shared'
export const SHARED_CREDIT_LIMIT_FIELD = 'data.creditLimit.shared'
export const SHARED_MAX_TENOR_SHARED = 'data.maximumTenor.shared'
export const SHARED_MAX_TENOR_AMOUNT = 'data.maximumTenor.maximumTenor'

export const defaultShared = {
  sharedWithStaticId: '',
  counterpartyStaticId: '',
  data: {
    appetite: { shared: false },
    availability: { shared: false },
    availabilityAmount: { shared: false },
    creditLimit: { shared: false },
    fee: { shared: false, fee: null },
    margin: { shared: false, margin: null },
    maximumTenor: { shared: false, maximumTenor: null }
  }
}
