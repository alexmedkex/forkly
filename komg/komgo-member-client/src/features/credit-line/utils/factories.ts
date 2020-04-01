import { Currency } from '@komgo/types'
import { Products } from '../../document-management/constants/Products'
import { SubProducts } from '../../document-management/constants/SubProducts'
import { ICreateOrEditCreditLineForm, IRequestCreditLineForm } from '../store/types'
import { defaultShared } from '../constants'

export const createInitialRequestInforamtion = (
  product: Products,
  subProduct: SubProducts,
  counterpartyId?: string
): IRequestCreditLineForm => {
  return {
    context: {
      productId: product,
      subProductId: subProduct
    },
    mailTo: false,
    comment: '',
    requestForId: counterpartyId || '',
    companyIds: []
  }
}

export const createInitialCreditLine = (
  product: Products,
  subProduct: SubProducts,
  counterpartyId: string = ''
): ICreateOrEditCreditLineForm => {
  return {
    counterpartyStaticId: counterpartyId,
    context: {
      productId: product,
      subProductId: subProduct
    },
    appetite: true,
    availability: true,
    creditLimit: null,
    availabilityAmount: null,
    creditExpiryDate: '',
    data: {
      fee: null,
      maximumTenor: null,
      availabilityReserved: null
    },
    currency: Currency.USD,
    sharedCreditLines: [defaultShared]
  }
}
