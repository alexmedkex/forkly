import { FeatureType } from '../../../business-layer/enums/feature'

import { IMessage } from './Message'

export interface ICreditLineRequestMessage extends IMessage {
  featureType: FeatureType
  companyStaticId: string
  counterpartyStaticId: string
  recepientStaticId: string
  comment?: string
  requestStaticId?: string
}
