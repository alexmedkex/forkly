import { productRD, productKYC, productLC, IProduct } from '@komgo/products'

export interface IProductExtended extends IProduct {
  productFullName: string
  productDescription: string
}

export const products: IProductExtended[] = [
  {
    ...productKYC,
    productFullName: 'Know Your Customer',
    productDescription:
      'It is a long established fact that a readereadable content of a page...It is a long established fact that a reader will be distracted by the readable content of a page...It is a long established fact that a reader will be distracted by the readable content of a page...'
  },
  {
    ...productLC,
    productFullName: 'Letters of Credit',
    productDescription:
      'It is a long content of a page...It is a long content of a page...It is a long content of a page...'
  },
  {
    ...productRD,
    productFullName: 'Receivables Discounting',
    productDescription:
      "It is a long established fact that a reader will be distracted by the readable content of a page...Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.It is a long established fact that a reader will be distracted by the readable content of a page...Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.It is a long established fact that a reader will be distracted by the readable content of a page...Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."
  }
]
