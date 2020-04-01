import { injectable } from 'inversify'

import { DeactivatedDocument } from '../models/DeactivatedDocument'

export interface IDeactivatedDocumentDataAgent {
  deactivateDocument(hash: string): Promise<void>
  reactivateDocument(hash: string): Promise<void>
  isDeactivated(hash: string): Promise<boolean>
}

@injectable()
export default class DeactivatedDocumentDataAgent implements IDeactivatedDocumentDataAgent {
  async isDeactivated(hash: string): Promise<boolean> {
    return !!(await DeactivatedDocument.findOne({ hash }))
  }
  async deactivateDocument(hash: string): Promise<void> {
    await DeactivatedDocument.findOneAndUpdate({ hash }, { hash }, { upsert: true })
  }
  async reactivateDocument(hash: string): Promise<void> {
    await DeactivatedDocument.findOneAndDelete({ hash })
  }
}
