import { ILC } from '../../data-layer/models/ILC'

import ILCMetadata from '../ILCMetadata'

export default function getLCMetaData(lc: ILC): ILCMetadata {
  return {
    LC: lc && lc._id ? lc._id.toString() : null,
    LCAddress: lc ? lc.contractAddress : null
  }
}
