import { injectable } from 'inversify'

import { AddrIndex, IAddrIndexDocument } from '../models/addr-index'

/**
 * AddrIndexDataAgent Class: contains all AddrIndex object related methods
 * @export
 * @class AddrIndexDataAgent
 */
@injectable()
export default class AddrIndexDataAgent {
  async findAndUpdateIndex(mnemonicHash: string): Promise<IAddrIndexDocument> {
    return AddrIndex.findOneAndUpdate({ mnemonicHash }, { $inc: { addrIndex: 1 } }, { new: true, upsert: true })
  }
}
