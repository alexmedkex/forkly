import Attribute from '../models/Attribute'
import { TransactionData } from '../models/TransactionData'

export interface IAttributeDataAgent {
  getAddAttributeData(node: string, attribute: Attribute): Promise<TransactionData>
}
