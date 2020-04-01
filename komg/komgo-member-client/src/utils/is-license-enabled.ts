import { MemberState } from '../features/members/store/types'
import { User } from '../store/common/types'
import { IProduct } from '@komgo/products'

export const isLicenseEnabled = (product: IProduct, members: MemberState, user: User) => {
  return isLicenseEnabledForCompany(product, members, user.company)
}

export const isLicenseEnabledForCompany = (product: IProduct, members: MemberState, companyStaticId: string) => {
  const company = members.get('byStaticId').get(companyStaticId)
  if (!company) {
    return false
  }

  const komgoProducts = company.get('komgoProducts')

  if (!komgoProducts) {
    return false
  }

  return komgoProducts.some((p): boolean => p.get('productId') === product.productId)
}
