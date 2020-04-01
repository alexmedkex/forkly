import { pluralize, buildCounterpartyWithDocumentsPickerItems } from './utils'
import { fakeDocument } from '../../../utils/faker'
import { fakeCounterparty } from '../../../../letter-of-credit-legacy/utils/faker'
import { ICounterpartyWithDocuments } from './SelectedCounterparties'

describe('pluralize', () => {
  const mockInput = 'boon'
  const singleSuffix = ''
  const pluralSuffix = 's'

  it('pluralizes a word when count parameter is greater than one', () => {
    const expected = 'boons'
    const actual = pluralize(mockInput, 2, singleSuffix, pluralSuffix)

    expect(actual).toEqual(expected)
  })

  it(" doesn't pluralize a word when count parameter is less than one", () => {
    const expected = 'boon'
    const actual = pluralize(mockInput, 0, singleSuffix, pluralSuffix)

    expect(actual).toEqual(expected)
  })
})

describe('buildCounterpartyWithDocumentsPickerItems', () => {
  const document1 = fakeDocument()
  const counterparty1 = fakeCounterparty({ commonName: 'Company1', country: 'RS', staticId: '123' })

  const defaultCounterapartyWithDocs: ICounterpartyWithDocuments[] = [
    { counterparty: counterparty1, documents: [document1], isSelected: false }
  ]

  it('should return appropriate ICompanyTableItemWithSharedDocs response', () => {
    expect(buildCounterpartyWithDocumentsPickerItems(defaultCounterapartyWithDocs)).toEqual([
      {
        name: 'Company1',
        countryName: 'Serbia',
        country: 'rs',
        location: 'city',
        id: '123',
        sharedDocuments: [document1]
      }
    ])
  })
})
