import { getCompanyDisplayName } from './utils'
describe('getCompanyDisplayName', () => {
  it('should get "-" if null', () => {
    expect(getCompanyDisplayName(null)).toEqual('-')
  })

  it('should get "-" if x500Name null', () => {
    expect(getCompanyDisplayName({})).toEqual('-')
  })

  it('should get name', () => {
    expect(getCompanyDisplayName({ x500Name: { CN: 'company' } } as any)).toEqual('company')
  })
})
