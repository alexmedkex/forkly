export function mongoObjectDeserialization<T>(mongoObject): T {
  return typeof mongoObject.toObject === 'function' ? mongoObject.toObject() : mongoObject
}
