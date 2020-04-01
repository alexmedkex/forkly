import 'reflect-metadata'

import { parseJSONParam, flattenFieldQuery } from './queryStringUtils'

describe('queryStringUtils', () => {
  it('should parse json string to object', () => {
    const jsonString = '{"type":"counterpartyCoverageRequest"}'
    expect(parseJSONParam(jsonString, 'jsonString')).toEqual({
      type: 'counterpartyCoverageRequest'
    })
  })

  it('should throw exception', () => {
    try {
      parseJSONParam("{'jsonString'}", 'jsonString')
    } catch (error) {
      expect(error).toMatchObject({
        status: 422,
        errorObject: {
          errorCode: 'EVAL01',
          message: 'jsonString is not in correct format',
          fields: undefined
        },
        name: '',
        message: 'jsonString is not in correct format'
      })
    }
  })

  it('should skip parse', () => {
    expect(parseJSONParam(null, 'jsonString'))
  })
})

describe('query-utils', () => {
  it('append prefix query', () => {
    const query = { a: 1, b: 2 }
    expect(flattenFieldQuery(query, 'context')).toEqual({ 'context.a': 1, 'context.b': 2 })
  })
  it('empty object query', () => {
    const query = {}
    expect(flattenFieldQuery(query, 'x')).toEqual({})
  })

  it('empty fieldname', () => {
    const query = { a: 1, b: 2 }
    expect(flattenFieldQuery(query, '')).toEqual(query)
  })

  it('empty fieldname', () => {
    const query = { a: 1, b: 2 }
    expect(flattenFieldQuery(query, '')).toEqual(query)
  })

  it('has prefix in query', () => {
    const query = { 'context.a': 1, b: 2 }
    expect(flattenFieldQuery(query, 'context')).toEqual({ 'context.a': 1, 'context.b': 2 })
  })

  it('has query with value null', () => {
    const query = null
    expect(flattenFieldQuery(query, 'context')).toEqual({})
  })
})
