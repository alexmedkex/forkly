import { buildFakeReceivablesDiscountingExtended } from '@komgo/types'
import { RD_DEFAULT_VERSION } from './constants'

import { decorateRDForInitialValues } from './edit-utils'

describe('validate update RD', () => {
  describe('decorateRDForInitialValues', () => {
    it('removes _id, tradeReference._id, staticId, createdAt and updatedAt from existing rd', () => {
      const fakeRd = buildFakeReceivablesDiscountingExtended() as any

      fakeRd._id = 'test_id'
      fakeRd.tradeReference._id = 'test_id'
      fakeRd.createdAt = 'test_created_at'
      fakeRd.updatedAt = 'test_updated_at'
      fakeRd.staticId = 'test_static_id'

      expect((decorateRDForInitialValues(fakeRd) as any)._id).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).tradeReference._id).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).updatedAt).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).createdAt).not.toBeDefined()
      expect((decorateRDForInitialValues(fakeRd) as any).staticId).not.toBeDefined()
    })

    it('reformats dates', () => {
      const fakeRd = {
        ...buildFakeReceivablesDiscountingExtended(),
        dateOfPerformance: '2019-03-24T18:26:22.561Z',
        discountingDate: '2019-03-24T18:26:22.561Z'
      }

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          dateOfPerformance: '2019-03-24',
          discountingDate: '2019-03-24'
        })
      )
    })

    it('reformats dates only if they are present', () => {
      const fakeRd = {
        ...buildFakeReceivablesDiscountingExtended(),
        discountingDate: '2019-03-24T18:26:22.561Z'
      }
      delete fakeRd.dateOfPerformance

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          dateOfPerformance: undefined,
          discountingDate: '2019-03-24'
        })
      )
    })

    it('adds default version', () => {
      const fakeRd = buildFakeReceivablesDiscountingExtended()
      fakeRd.version = undefined

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          version: RD_DEFAULT_VERSION
        })
      )
    })

    it('does not override existing version', () => {
      const fakeRd = buildFakeReceivablesDiscountingExtended()
      fakeRd.version = 10

      expect(decorateRDForInitialValues(fakeRd)).toEqual(
        expect.objectContaining({
          version: 10
        })
      )
    })
  })
})
