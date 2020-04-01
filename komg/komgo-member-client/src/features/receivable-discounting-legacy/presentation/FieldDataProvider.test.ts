import { RequestType } from '@komgo/types'
import { rdDiscountingSchema } from '../utils/constants'
import { FieldDataProvider } from './FieldDataProvider'

describe('FieldDataProvider', () => {
  it('should return default title if doesnt have baseObject ', () => {
    const fieldDataProvider = new FieldDataProvider(rdDiscountingSchema)
    expect(fieldDataProvider.getTitle('invoiceAmount')).toBe('Invoice amount')
  })

  it('should return required title if required', () => {
    const fieldDataProvider = new FieldDataProvider(rdDiscountingSchema, {})
    expect(fieldDataProvider.getTitle('invoiceAmount')).toBe('Invoice amount *')
  })

  it('should return optional title if not required', () => {
    const fieldDataProvider = new FieldDataProvider(rdDiscountingSchema, { requestType: RequestType.RiskCover })
    expect(fieldDataProvider.getTitle('numberOfDaysDiscounting')).toBe('Expected days of discounting')
  })
})
