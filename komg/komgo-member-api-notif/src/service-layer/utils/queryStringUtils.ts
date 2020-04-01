import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'

export function parseJSONParam(value: string, paramName: string): object {
  if (value) {
    try {
      return JSON.parse(value)
    } catch (error) {
      throw ErrorUtils.unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        `${paramName} is not in correct format`
      )
    }
  }
}

/**
 * Creates flaten mongodb query, used when queryng embedded/nested documents in mongodb
 * example:
 * document in mongodb {a:{ b:1, c:2, d:3 }}
 * flattenFieldQuery({b:1,d:3}, 'a') creates mongodb query {'a.b':1, 'a.d':3}
 * @param query mongodb query object
 * @param field embedded/nested document field name
 */
export function flattenFieldQuery(query: object, field: string): object {
  if (!query) {
    return {}
  }

  if (!field || !field.trim()) {
    return query
  }

  field = field.trim()
  return Object.keys(query).reduce((memo, p) => {
    const name = p.startsWith(field) ? p : `${field}.${p}`
    return {
      [`${name}`]: query[`${p}`],
      ...memo
    }
  }, {})
}
