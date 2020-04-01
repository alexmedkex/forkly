import { injectable } from 'inversify'

import { KeyType } from '../constants/KeyType'
import { Key, IKeyDocument } from '../models/key'

/**
 * KeyDataAgent Class: contains all Key object related methods
 * @export
 * @class KeyDataAgent
 */
@injectable()
export default class KeyDataAgent {
  async getActiveKey(type): Promise<IKeyDocument> {
    return Key.findOne({
      active: true,
      type
    })
  }

  async addNewKey(type: KeyType, keyData: string): Promise<IKeyDocument> {
    const activeKey = await this.getActiveKey(type)

    if (activeKey) {
      await this.invalidateCurrentKey(activeKey)
    }

    // add new one
    return Key.create({
      type,
      data: keyData,
      createdAt: new Date(),
      modifiedAt: new Date(),
      validFrom: new Date(),
      validTo: null,
      active: true
    })
  }

  async getAllKeys(): Promise<IKeyDocument[]> {
    return Key.find({ type: 'ETH' })
  }

  async deleteKey(key: IKeyDocument) {
    return Key.deleteOne({ _id: key._id })
  }

  private async invalidateCurrentKey(activeKey: IKeyDocument) {
    return Key.updateOne(
      { _id: activeKey._id },
      {
        modifiedAt: new Date(),
        validTo: new Date(),
        active: false
      }
    )
  }
}
