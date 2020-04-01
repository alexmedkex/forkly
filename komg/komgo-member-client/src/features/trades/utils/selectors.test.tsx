import { selectNewestLetterOfCreditWithSourceId } from './selectors'

describe('selectNewestLetterOfCreditWithSourceId', () => {
  const exampleLetters: any = [
    {
      _id: '123',
      status: 'request rejected',
      tradeAndCargoSnapshot: { sourceId: '123_1' },
      updatedAt: '2018-12-06T11:44:39.704Z'
    },
    {
      _id: '234',
      status: 'request rejected',
      updatedAt: '2014-05-24T11:44:39.123Z',
      tradeAndCargoSnapshot: { sourceId: '234_1' }
    },
    {
      _id: '234',
      status: 'requested',
      updatedAt: '2016-11-04T13:12:33.321Z',
      tradeAndCargoSnapshot: { sourceId: '234_1' }
    },
    {
      _id: '234',
      status: 'nope',
      tradeAndCargoSnapshot: { sourceId: '234_1' }
    }
  ]
  it('returns a letter of credit matching the id given', () => {
    const letter = selectNewestLetterOfCreditWithSourceId(exampleLetters, '123_1')

    expect(letter).not.toBeUndefined()
    expect(letter!._id).toEqual('123')
  })
  it('returns undefined if no letter of credit is matched', () => {
    expect(selectNewestLetterOfCreditWithSourceId(exampleLetters, 'noMatch')).toBeUndefined()
  })
  it('returns the newest letter if two letters of credit match', () => {
    expect(selectNewestLetterOfCreditWithSourceId(exampleLetters, '234_1')!.status).toEqual('requested')
  })
})
