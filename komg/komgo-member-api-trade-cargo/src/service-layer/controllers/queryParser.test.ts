import { queryParser } from './queryParser'

describe('queryParser', () => {
  // FILTER FOR A VALUE
  // e.g. filter%5Bsource%5D=VAKT

  // FILTER FOR A NESTED VALUE
  // filter%5Bdata.etrmId%5D=99999

  // FILTER A NUMBER
  // filter%5Bdata.price%5D=100.02

  // FILTER GREATER THAN
  // filter%5Bdata.price%5D%5B%24gt%5D=100

  // FILTER A STRING WITH LIKE OPERATOR

  // SORT one field
  // ?sort%5Bdata.etrmId%5D=-1

  // SORT multiple fields
  // ?sort%5Bsource%5D=1&sort%5Bdata.etrmId%5D=-1

  it("'s defined", () => {
    expect(queryParser).toBeDefined()
  })

  it('returns defaults values', () => {
    const query = queryParser({})
    expect(query.query).toBeDefined()
    expect(query.options.sort).toBeDefined()
  })

  describe('booleans', () => {
    it('parses true', () => {
      const query = queryParser({
        query: { prop: 'true' }
      })
      expect(query.query.prop).toEqual(true)
    })

    it('parses false', () => {
      const query = queryParser({
        query: { prop: 'false' }
      })
      expect(query.query.prop).toEqual(false)
    })
  })

  describe('parses numbers', () => {
    it('integer (10)', () => {
      const query = queryParser({
        query: { prop: '10' }
      })
      expect(query.query.prop).toEqual(10)
    })

    it('integer (0)', () => {
      const query = queryParser({
        query: { prop: '0' }
      })
      expect(query.query.prop).toEqual(0)
    })

    it('float (1.1)', () => {
      const query = queryParser({
        query: { prop: '1.1' }
      })
      expect(query.query.prop).toEqual(1.1)
    })
  })

  describe('parses object', () => {
    it('flat', () => {
      const { query } = queryParser({
        query: { foo: 'bar' }
      })
      expect(query.foo).toEqual('bar')
    })

    it('nested', () => {
      const query = queryParser({
        query: { foo: 'bar' }
      })
      expect(query.query.foo).toEqual('bar')
    })
  })

  describe('parses ', () => {
    it('flat', () => {
      const { query } = queryParser({ query: { foo: ['1', '2', '3'] } })
      expect(query.foo).toEqual([1, 2, 3])
    })

    it('nested', () => {
      const { query } = queryParser({ query: { foo: [{ prop: '1' }, { prop: '2' }, { prop: '3' }] } })
      expect(query.foo).toEqual([{ prop: 1 }, { prop: 2 }, { prop: 3 }])
    })
  })

  describe('query', () => {
    it('parses regex', () => {
      const { query } = queryParser({ query: { prop: { $regex: '.*Law.*' } } })
      expect(query.prop.$regex).toBeInstanceOf(RegExp)
    })

    it('parses etrmId', () => {
      const etrmId = '123'
      const { query } = queryParser({ query: { prop: { etrmId } } })
      expect(query.prop.etrmId).toStrictEqual(etrmId)
    })
  })
})