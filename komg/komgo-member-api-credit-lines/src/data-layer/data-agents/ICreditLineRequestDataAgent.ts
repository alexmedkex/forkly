import { IProductContext } from '@komgo/types'

import { ICreditLineRequestDocument } from '../models/ICreditLineRequestDocument'

export interface ICreditLineRequestDataAgent {
  create(creditLineRequest: ICreditLineRequestDocument): Promise<string>
  get(staticId: string): Promise<ICreditLineRequestDocument>
  findOne(query: object, projection?: object, options?: object): Promise<ICreditLineRequestDocument>
  find(query: object, projection?: object, options?: object): Promise<ICreditLineRequestDocument[]>
  findForCompaniesAndContext(
    context: IProductContext,
    companyStaticId: string,
    counterpartyStaticId: string,
    filter?: object
  ): Promise<ICreditLineRequestDocument[]>
  count(query?: object): Promise<number>
  delete(id: string): Promise<void>
  update(creditLineRequest: ICreditLineRequestDocument): Promise<ICreditLineRequestDocument>
}
