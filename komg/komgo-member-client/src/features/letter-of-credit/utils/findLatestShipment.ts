import { IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'

export const findLatestShipment = (letter: ILetterOfCredit<IDataLetterOfCredit>) => {
  const { trade } = letter.templateInstance.data
  return (trade && trade.deliveryPeriod && trade.deliveryPeriod.endDate) || ''
}
