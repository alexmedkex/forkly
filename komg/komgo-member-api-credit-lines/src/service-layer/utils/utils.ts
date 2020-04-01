import { IProductContext } from '@komgo/types'

export const resolveContext = (productId: string, subProductId: string, context?: IProductContext) => {
  return {
    ...context,
    productId,
    subProductId
  }
}
