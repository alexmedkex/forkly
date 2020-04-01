import { fromJS } from 'immutable'
import { productKYC, productLC } from '@komgo/products'

import { isLicenseEnabled, isLicenseEnabledForCompany } from './is-license-enabled'
import { User } from '../store/common/types'

const members = fromJS({
  byStaticId: {
    'company-1': { komgoProducts: [productKYC] },
    'company-2': { komgoProducts: [productLC] }
  }
})

describe('isLicenseEnabledForCompany', () => {
  it('returns false if it cannot find company by static id', () => {
    const result = isLicenseEnabledForCompany(productKYC, members, 'company-2')
    expect(result).toEqual(false)
  })

  it('returns true if product is enabled for a company', () => {
    const result = isLicenseEnabledForCompany(productLC, members, 'company-2')
    expect(result).toEqual(true)
  })
})

describe('isLicenseEnabled', () => {
  const user: User = {
    id: '1',
    username: 'Username',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'email',
    createdAt: 1,
    company: 'company-2'
  }
  it('returns false if it cannot find company by static id', () => {
    const result = isLicenseEnabled(productKYC, members, user)
    expect(result).toEqual(false)
  })

  it('returns true if product is enabled for a company', () => {
    const result = isLicenseEnabled(productLC, members, user)
    expect(result).toEqual(true)
  })
})
