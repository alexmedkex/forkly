import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { productLC, productKYC, productRD } from '@komgo/products'

const mockIsLicenseEnabled = jest.fn(() => true)

class ProductProxy {
  isLicenseEnabled = mockIsLicenseEnabled
}

describe('checkLicenses', () => {
  let checkLicenses
  let memoizedIsLicenseEnabled
  beforeAll(async () => {
    jest.mock('@komgo/products', () => ({
      ProductProxy,
      productLC,
      productKYC,
      productRD
    }))
    const checkLicensesModule = await require('./checkLicenses')
    checkLicenses = checkLicensesModule.default
    memoizedIsLicenseEnabled = checkLicensesModule.memoizedIsLicenseEnabled
  })

  beforeEach(() => {
    memoizedIsLicenseEnabled.clear()
  })

  it('should get products from path', async () => {
    await checkLicenses('tenantStaticId', ['tradeFinance:reviewLCApplication:read'], '/products/rd/documents')
    expect(mockIsLicenseEnabled).toHaveBeenCalledWith('tenantStaticId', 'RD')
  })

  it('should get products from permission annotations', async () => {
    await checkLicenses('tenantStaticId', ['tradeFinance:reviewLCApplication:read'], '/test')
    expect(mockIsLicenseEnabled).toHaveBeenCalledWith('tenantStaticId', 'LC')
  })

  it('should not check license', async () => {
    await checkLicenses('tenantStaticId', ['kyc:manageDocReqTemp'], '/test')
    expect(mockIsLicenseEnabled).not.toHaveBeenCalled()
  })

  it('should not check license if product is not defined in system', async () => {
    await checkLicenses('tenantStaticId', [], '/products/documents/')
    expect(mockIsLicenseEnabled).not.toHaveBeenCalled()
  })

  it('should return error if permissions with and without licenseId are present for route', async () => {
    await expect(
      checkLicenses('tenantStaticId', ['tradeFinance:reviewLCApplication:read', 'kyc:manageDocReqTemp'], '/test')
    ).rejects.toThrow(new Error('permissions with licenseId should not be combined with permissions without it'))
  })

  it('should return error if permissions have different licenseId', async () => {
    await expect(
      checkLicenses('tenantStaticId', ['tradeFinance:reviewLCApplication:read', 'tradeFinance:manageRD:read'], '/test')
    ).rejects.toThrow(new Error('all permissions should have the same licenseId'))
  })

  it('should return error if license not enabled', async () => {
    mockIsLicenseEnabled.mockImplementationOnce(async () => false)
    await expect(checkLicenses('tenantStaticId', [], '/products/tradeFinance/documents')).rejects.toEqual(
      ErrorUtils.forbiddenException(ErrorCode.Authorization, `Your company does not have a license for LC product`)
    )
  })
})
