import { buildFakeTrade, buildFakeCargo, buildFakeDataLetterOfCredit, Law } from '@komgo/types'
import { formatTemplateData, walker, formatTrade } from './formatTemplateData'
import { sentenceCaseWithAcronyms } from '../../../utils/casings'

describe('formatTemplateData', () => {
  it('matches snapshot', () => {
    const trade = {
      ...buildFakeTrade({ version: 2 }),
      law: Law.NewYorkLaw,
      dealDate: '2017-12-31T00:00:00.000Z',
      contractDate: '2017-12-01T00:00:00.000Z'
    }
    const cargo = buildFakeCargo()
    const amount = 100
    const expiryDate = '2019-08-21T15:47:51.817Z'

    const data = { ...buildFakeDataLetterOfCredit(), expiryDate, trade, cargo, amount }

    expect(formatTemplateData(data)).toMatchSnapshot()
  })
})

describe('walker', () => {
  const replacer = (key, value) => sentenceCaseWithAcronyms(value)

  it('patch all the props', () => {
    const obj = { foo: 'FOO', bar: 'BAR' }
    expect(walker(obj, replacer)).toEqual({ foo: 'Foo', bar: 'Bar' })
  })

  it('patch all the props of an object with leaves', () => {
    const obj = { foo: 'FOO', deep: { bar: 'BAR' } }
    expect(walker(obj, replacer)).toEqual({ foo: 'Foo', deep: { bar: 'Bar' } })
  })

  it('patch all the props of an object with leaves that has an array of object', () => {
    const obj = { foo: 'FOO', deep: [{ bar: 'BAR' }] }
    expect(walker(obj, replacer)).toEqual({ foo: 'Foo', deep: [{ bar: 'Bar' }] })
  })

  it('patch all the props of an object with leaves that has an array of simple types', () => {
    const obj = { foo: 'FOO', deep: ['BAR'] }
    expect(walker(obj, replacer)).toEqual({ foo: 'Foo', deep: ['Bar'] })
  })

  it('patch all the props of an object with leaves that has nested array', () => {
    const obj = { foo: 'FOO', deep: [{ bar: 'BAR', deep: [{ foo: 'FOO' }] }] }
    expect(walker(obj, replacer)).toEqual({ foo: 'Foo', deep: [{ bar: 'Bar', deep: [{ foo: 'Foo' }] }] })
  })

  it('patch all the props of an object with leaves that has nested array', () => {
    const obj = { foo: 'FOO', deep: [{ bar: 'BAR', deep: [{ foo: 'FOO', bar: undefined }] }] }
    expect(walker(obj, replacer)).toEqual({
      foo: 'Foo',
      deep: [{ bar: 'Bar', deep: [{ foo: 'Foo', bar: undefined }] }]
    })
  })

  it('patch all the props of an object with leaves that has null values', () => {
    const obj = { foo: 'FOO', deep: [{ bar: 'BAR', deep: { foo: null, bar: null } }] }
    expect(walker(obj, replacer)).toEqual({
      foo: 'Foo',
      deep: [{ bar: 'Bar', deep: { foo: null, bar: null } }]
    })
  })
})
