import { ITemplateBinding } from '@komgo/types'

export interface ITemplateBindingDataAgent {
  create(template: ITemplateBinding): Promise<string>
  get(staticId: string): Promise<ITemplateBinding>
  getAll(projection?: any, options?: any): Promise<ITemplateBinding[]>
  count(): Promise<number>
}
