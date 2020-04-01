import { toDecimalPlaces } from './field-formatters'

describe('toDecimalPlaces', () => {
  const exampleValue = '231123.2342343242'

  it('formats into expected value format if default decimal places set to 2', () => {
    expect(toDecimalPlaces(exampleValue)).toBe(231123.23)
  })
  it('converts correct format if zero passed', () => {
    expect(toDecimalPlaces('0')).toEqual(0)
  })

  it('formats to additional decimal places if provided', () => {
    expect(toDecimalPlaces(exampleValue, 4)).toEqual(231123.2342)
  })
})
