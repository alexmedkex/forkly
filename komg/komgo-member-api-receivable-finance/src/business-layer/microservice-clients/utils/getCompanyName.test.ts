import { getLogger } from '@komgo/logging'

import { getCompanyName } from './getCompanyName'

const mockCompanyDetails = {
  x500Name: {
    O: 'Company name'
  }
}

describe('getCompanyName', () => {
  const logger = getLogger('getCompanyNameTest')

  it('should return the company name successfully', async () => {
    const result = getCompanyName(mockCompanyDetails, logger)
    expect(result).toEqual(mockCompanyDetails.x500Name.O)
  })

  it('should return Unknown if company name is not found', async () => {
    const result = getCompanyName({}, logger)
    expect(result).toEqual('Unknown')
  })
})
