import { detailedDiff } from 'deep-object-diff'

/**
 * Create a diff of the two specified objects.
 *
 * The diff treats field=undefined and not having the field as the same
 * @param object1
 * @param object2
 */
export function diffObjects(object1: object, object2: object): IDiff {
  const obj1ForDiff = removeUndefinedFields(object1)
  const obj2ForDiff = removeUndefinedFields(object2)
  return detailedDiff(obj1ForDiff, obj2ForDiff) as IDiff
}

function removeUndefinedFields(object: object) {
  return Object.keys(object)
    .filter(key => object[key] !== undefined)
    .reduce((memo, key) => {
      return {
        ...memo,
        [key]: object[key]
      }
    }, {})
}

interface IDiff {
  updated: any
  added: any
  deleted: any
}
