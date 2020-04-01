import * as camelcase from 'camelcase'

/**
 * Generates a camelcase id from any string
 */
const generateIdFromName = (name: string): string => {
  const stripped = name.replace(/[^A-Za-z0-9 ]+/gm, '')
  if (stripped.trim() === '') {
    return ''
  }
  return camelcase(stripped)
}

export default generateIdFromName
