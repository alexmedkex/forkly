import { UpdateType } from '../../types'
import { UPDATE_TYPE_ROUTING_KEY_PREFIX, ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX } from '../constants'
import { AddDiscountingRequestType } from '../types/AddDiscountingRequestType'

export const buildUpdateMessageType = (updateType: UpdateType): string => {
  return UPDATE_TYPE_ROUTING_KEY_PREFIX + updateType.toString()
}

export const buildAddDiscountingMessageType = (addDiscountingType: AddDiscountingRequestType): string => {
  return ADD_DISCOUNTING_TYPE_ROUTING_KEY_PREFIX + addDiscountingType.toString()
}
