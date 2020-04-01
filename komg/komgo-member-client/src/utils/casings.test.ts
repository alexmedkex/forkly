import {
  capitalize,
  sentenceCase,
  sentenceCaseWithAcronyms,
  replaceUnderscores,
  dotNotationToTitleize,
  camelCaseToSentenceCase,
  toMegabytes,
  toYesNoDash
} from './casings'
import { ReviewDecision } from '../features/standby-letter-of-credit-legacy/components/issue-form'

describe('capitalize', () => {
  it('returns a properly formated string', () => {
    const str = 'A_VALUE_TO_capitalize'
    expect(capitalize(str)).toEqual('A Value To Capitalize')
  })

  it('handles null properly', () => {
    expect(capitalize(null)).toEqual(null)
  })
})

describe('camelCaseToSentenceCase', () => {
  expect(camelCaseToSentenceCase(ReviewDecision.ApproveApplication)).toEqual('Approve application')
})

describe('sentenceCase', () => {
  it('returns a sentence cased string', () => {
    const str = 'A_VALUE_TO_SENTENCE_CASE'
    expect(sentenceCase(str)).toEqual('A value to sentence case')
  })
  it('handles null properly', () => {
    expect(sentenceCase(null)).toEqual(null)
  })
})

describe('sentenceCaseWithAcronyms', () => {
  it('capitalises any acronyms passed in but does the rest in sentence case', () => {
    const str = 'A_SENTENCE_WITH_A_TLA_TO_SENTENCE_CASE'
    expect(sentenceCaseWithAcronyms(str, ['TLA'])).toEqual('A sentence with a TLA to sentence case')
  })
  it('does not capitalise acronyms found within other words', () => {
    const str = 'DO_NOT_WRITE_AN_SLA_ON_A_SLALOM'
    expect(sentenceCaseWithAcronyms(str, ['SLA'])).toEqual('Do not write an SLA on a slalom')
  })
  it('capitalises acronyms found at start of sentence', () => {
    const str = 'LOL_DO_NOT_JOKE'
    expect(sentenceCaseWithAcronyms(str, ['LOL'])).toEqual('LOL do not joke')
  })
  it('replaces multiple acroynms', () => {
    const str = 'LOL_DO_NOT_WRITE_AN_SLA_ON_A_SLALOM'
    expect(sentenceCaseWithAcronyms(str, ['LOL', 'SLA'])).toEqual('LOL do not write an SLA on a slalom')
  })
  it('doesnt capitalise this weird case', () => {
    expect(sentenceCaseWithAcronyms('quote submitted (0)')).toEqual('Quote submitted (0)')
  })
  it('handles null properly', () => {
    expect(sentenceCaseWithAcronyms(null)).toEqual(null)
  })
})

describe('replaceUnderscores', () => {
  it('should replace all underscores in text', () => {
    const str = 'A_sentence_with_many_underscores_in_between_the_words'
    expect(replaceUnderscores(str)).toEqual('A sentence with many underscores in between the words')
  })
  it('handles null properly', () => {
    expect(replaceUnderscores(null)).toEqual(null)
  })
})

describe('toMegabytes', () => {
  it('divides a number by 1.024E6, fixes to 2dp and appends the letters Mb.', () => {
    expect(toMegabytes(1.024e6)).toBe('1.00 Mb')
  })
})

describe('toYesNoDash', () => {
  it('returns a dash', () => {
    const value = undefined
    expect(toYesNoDash(value)).toEqual('-')
  })
  it('returns a No', () => {
    const value = false
    expect(toYesNoDash(value)).toEqual('No')
  })
  it('returns a Yes', () => {
    const value = true
    expect(toYesNoDash(value)).toEqual('Yes')
  })
})
