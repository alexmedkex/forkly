import { IKeyValue } from '../IKeyValue'

import { IDocumentTemplateContent } from './IDocumentTemplateContent'

export interface IDocumentTemplate {
  id: string
  metadata: IKeyValue[]
  content?: IDocumentTemplateContent
}
