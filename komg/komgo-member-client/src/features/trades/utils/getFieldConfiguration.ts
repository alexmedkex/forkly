import { stringOrUndefined } from '../../../utils/types'

export const getFieldConfiguration = (textDescription: stringOrUndefined, maxLengthOfValue: number = 1000) => {
  if (textDescription) {
    return { tooltipValue: textDescription, maxLengthOfValue }
  }
  return null
}
