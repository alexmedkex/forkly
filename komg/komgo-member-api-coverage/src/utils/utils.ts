/**
 * Get all values for a string enum type.
 * @export
 * @param {object} enumType string enum type to get values from
 * @returns {string[]} values from an enum type
 */
export function enumValues(enumType: object): string[] {
  const keys = Object.keys(enumType)
  return keys.map(key => enumType[key])
}
