import { sentenceCaseWithLC } from './casings'

describe('sentenceCase LC', () => {
  it('returns a sentence cased string', () => {
    const str = 'A_VALUE_TO_SENTENCE_CASE_lc'
    expect(sentenceCaseWithLC(str)).toEqual('A value to sentence case LC')
  })
})
