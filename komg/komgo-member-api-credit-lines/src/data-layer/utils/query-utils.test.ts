import 'reflect-metadata'

import { flattenFieldQuery } from './query-utils'

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
})
