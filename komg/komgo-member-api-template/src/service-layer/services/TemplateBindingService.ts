import { ITemplateBinding, ITemplateBindingBase } from '@komgo/types'
import { inject, injectable } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { ITemplateBindingDataAgent } from '../../data-layer/data-agents'
import { TYPES } from '../../inversify/types'

@injectable()
export class TemplateBindingService {
  constructor(@inject(TYPES.TemplateBindingDataAgent) private templateBindingDataAgent: ITemplateBindingDataAgent) {}

  async create(bindingBase: ITemplateBindingBase): Promise<ITemplateBinding> {
    const staticId = uuid4()
    const templateBinding: ITemplateBinding = {
      ...bindingBase,
      staticId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await this.templateBindingDataAgent.create(templateBinding)
    return templateBinding
  }

  async get(staticId: string): Promise<ITemplateBinding> {
    const templateBinding = await this.templateBindingDataAgent.get(staticId)
    return templateBinding
  }

  async getAll(projection: object = {}, options = { skip: undefined, limit: undefined }): Promise<ITemplateBinding[]> {
    const bindings: ITemplateBinding[] = await this.templateBindingDataAgent.getAll(projection, options)
    return bindings
  }

  async count(): Promise<number> {
    const bindingsCount = await this.templateBindingDataAgent.count()
    return bindingsCount
  }
}
