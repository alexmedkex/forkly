export const removeNullsAndUndefined = obj => {
  Object.keys(obj).forEach(
    k =>
      (obj[k] && typeof obj[k] === 'object' && removeNullsAndUndefined(obj[k])) ||
      ((obj[k] === null || obj[k] === undefined) && delete obj[k])
  )
  return obj
}
