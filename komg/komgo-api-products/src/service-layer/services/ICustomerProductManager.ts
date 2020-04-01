import { IProduct } from '@komgo/products'

export default interface ICustomerProductManager {
  startEventListener(): Promise<void>
  stopEventListener(): void
  setProducts(memberStaticId: string, products: IProduct[]): Promise<void>
}
