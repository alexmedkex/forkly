import { FeatureType } from '../../enums/feature'

import { IMessage } from './Message'

export interface ICreditLineBaseMessage extends IMessage {
  staticId: string
  ownerStaticId: string
  recepientStaticId: string
  featureType: FeatureType
}

export interface ICreditLineMessage<TData> extends ICreditLineBaseMessage {
  payload?: TData
}
