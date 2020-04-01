import { ISharedCreditLine, IInformationShared, IProductContext } from '@komgo/types'

export interface ISharedCreditLineDataAgent {
  create(sharedCreditLine: ISharedCreditLine<IInformationShared>): Promise<string>
  update(sharedCreditLine: ISharedCreditLine<IInformationShared>): Promise<ISharedCreditLine<IInformationShared>>
  get(staticId: string): Promise<ISharedCreditLine<IInformationShared>>
  find(query: object, projection?: object, options?: object): Promise<Array<ISharedCreditLine<IInformationShared>>>
  findOneByCreditLineAndCompanies(
    sharedWithStaticId: string,
    counterpartyStaticId: string,
    query?: object,
    projection?: object,
    options?: object
  ): Promise<ISharedCreditLine<IInformationShared>>
  delete(id: string): Promise<void>
  count(query?: object): Promise<number>
}
