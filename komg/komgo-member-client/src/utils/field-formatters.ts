import Numeral from 'numeral'

export function toDecimalPlaces(value: string | number, decimalPlaces: number = 2) {
  return Numeral(
    Numeral(value ? `0${value}` : 0)
      .value()
      .toFixed(decimalPlaces)
  ).value()
}
