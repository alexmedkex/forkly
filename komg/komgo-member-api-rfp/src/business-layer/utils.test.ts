import 'reflect-metadata'

import { MOCK_COMPANY_ENTRY } from '../../integration-tests/utils/mock-data'

import { getSenderCompanyName } from './utils'

describe('utils', () => {
  describe('getSenderCompanyName', () => {
    it('gets sender company name from company details', () => {
      const name = getSenderCompanyName(MOCK_COMPANY_ENTRY, MOCK_COMPANY_ENTRY.staticId)

      expect(name).toBe(MOCK_COMPANY_ENTRY.x500Name.O)
    })

    it('returns unknown company name if name not present', () => {
      const name = getSenderCompanyName(MOCK_COMPANY_ENTRY, 'invalidStaticId')

      expect(name).toBe(MOCK_COMPANY_ENTRY.x500Name.O)
    })
  })
})
