/**
 * Convert a mongo query with an embedded object to dot notation query.
 * Recurse on deeply embedded objects.
 *
 * {context: { a: 1, b: '2', C: { x: [1,2,3]} }}
 *
 * -> toDotNotation('context', {a: 1...})
 *
 * -> { context.a: 1, context.b: 2, context.C.x: [1,2,3] }
 *
 * @param fieldName name of the field containing an object
 * @param embeddedObject object which is the value of the document[fieldName]
 */
export const toDotNotation = <T>(fieldName: string, embeddedObject: T) => {
  return Object.keys(embeddedObject).reduce((acc, key) => {
    const dotNotationKey = `${fieldName}.${key}`
    const value = embeddedObject[key]
    value !== null && !Array.isArray(value) && typeof value === 'object'
      ? (acc = { ...acc, ...toDotNotation(dotNotationKey, value) })
      : (acc[dotNotationKey] = value)
    return acc
  }, {})
}
