import { buildSelection, ISelection } from './selectionUtil'
import { stringify } from 'qs'
import { TradeSource } from '@komgo/types'

describe('buildSelection', () => {
  it('is defined', () => {
    expect(buildSelection).toBeDefined()
  })

  it('parses a querystring with a selection', () => {
    const selection: ISelection = {
      select: true,
      redirectTo: `/letters-of-credit/new?source=${TradeSource}&sourceId=848aaccf-c7bb-4462-9343-6c41aaa98e02`,
      type: 'SBLC'
    }
    const qs = stringify(selection)

    expect(buildSelection(qs)).toEqual(selection)
  })

  it('parses a querystring without a selection', () => {
    const selection: ISelection = {} as ISelection
    const qs = stringify(selection)

    expect(buildSelection(qs)).toEqual({
      redirectTo: undefined,
      select: false,
      type: undefined
    })
  })

  it("throws an exception if the redirectURL isn't in the white list", () => {
    const selection: ISelection = {
      select: true,
      redirectTo: `http://www.google.com`,
      type: 'SBLC'
    }
    const qs = stringify(selection)

    expect(() => buildSelection(qs)).toThrow(`Redirect to ${selection.redirectTo} not supported`)
  })
})
