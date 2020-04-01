import { ITrade, IDataLetterOfCredit, ICompany } from '@komgo/types'
import { displayDate, dateFormats } from '../../../utils/date'
import Numeral from 'numeral'
import { capitalize, sentenceCaseWithAcronyms } from '../../../utils/casings'
import { type } from 'os'

const displayAmount = (input: number) => Numeral(input).format('0,0.00')

export const formatTemplateData = (data: Partial<IDataLetterOfCredit>): Partial<IDataLetterOfCredit> => ({
  ...data,
  trade: formatTrade(data.trade),
  amount: displayAmount(data.amount) as any,
  expiryDate: displayDate(data.expiryDate, dateFormats.inputs),
  beneficiaryBank: data.beneficiaryBank ? data.beneficiaryBank : ({ x500Name: { CN: 'No advising bank' } } as ICompany)
})

export const walker = (obj: any, replacer, parent?) => {
  if (!obj) {
    return null
  }
  return Array.isArray(obj)
    ? obj.map(item => {
        return typeof item === 'object' ? walker(item, replacer, parent) : item && replacer(parent, item)
      })
    : Object.entries(obj).reduce((memo, [key, value]) => {
        return {
          ...memo,
          [key]: typeof value === 'object' ? walker(value, replacer, key) : value && replacer(key, value)
        }
      }, {})
}

export const formatTrade = (trade: ITrade): ITrade => ({
  ...walker(trade, (key, value) => {
    switch (key) {
      case 'dealDate':
      case 'contractDate':
      case 'startDate':
      case 'endDate':
        return displayDate(value, dateFormats.inputs)
      case 'law':
        const [place] = value.split('LAW')
        return `${capitalize(place)}law` // e.g. New York Law
      case 'price':
        return displayAmount(trade.price)
      default:
        // check for enums and uppercase e.g. DAYS or TO_BE_FINANCED
        return typeof value === 'string' && value.match(/^([A-Z]|_)*$/) ? sentenceCaseWithAcronyms(value) : value
    }
  })
})
