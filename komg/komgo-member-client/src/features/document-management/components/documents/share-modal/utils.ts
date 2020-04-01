import { ICompanyTableItemWithSharedDocs, ICounterpartyWithDocuments } from './SelectedCounterparties'
import { FlagNameValues } from 'semantic-ui-react'
import * as i18nIsoCountries from 'i18n-iso-countries'

export function pluralize(word: string, count: number, singleSuffix: string, pluralSuffix: string) {
  if (count > 1) {
    return `${word}${pluralSuffix}`
  }

  return `${word}${singleSuffix}`
}

export const buildCounterpartyWithDocumentsPickerItems = (
  counterpartiesWithDocs: ICounterpartyWithDocuments[]
): ICompanyTableItemWithSharedDocs[] => {
  i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'))
  return counterpartiesWithDocs.map(item => ({
    name: item.counterparty.x500Name.CN,
    countryName: i18nIsoCountries.getName(item.counterparty.x500Name.C.trim(), 'en'),
    country: item.counterparty.x500Name.C.toLocaleLowerCase().trim() as FlagNameValues,
    location: item.counterparty.x500Name.L,
    id: item.counterparty.staticId,
    sharedDocuments: item.documents
  }))
}
