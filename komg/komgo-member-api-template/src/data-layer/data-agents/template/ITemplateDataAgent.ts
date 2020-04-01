import { ITemplateBase, ITemplate } from '@komgo/types'

import { ITokenUser } from '../../../service-layer/utils/ITokenUser'

export interface ITemplateDataAgent {
  create(template: ITemplate)
  update(staticId: string, template: ITemplateBase, user: ITokenUser): Promise<ITemplate>
  softDelete(staticId: string): Promise<ITemplate>
  get(staticId: string): Promise<ITemplate>
  getAll(projection?: any, options?: any): Promise<ITemplate[]>
  count(): Promise<number>
}
