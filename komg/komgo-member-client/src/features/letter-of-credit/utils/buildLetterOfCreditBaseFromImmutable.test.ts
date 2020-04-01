import React from 'react'
import { buildFakeDataLetterOfCreditBase, buildFakeLetterOfCredit } from '@komgo/types'
import { fromJS } from 'immutable'
import { buildLetterOfCreditBaseFromImmutable } from './buildLetterOfCreditBaseFromImmutable'

describe('buildLetterOfCreditBaseFromImmutable', () => {
  it('returns a valid update', () => {
    const templateModel = {}
    const data = buildFakeDataLetterOfCreditBase()
    const initial = fromJS(buildFakeLetterOfCredit())

    expect(buildLetterOfCreditBaseFromImmutable(initial, data, templateModel)).toMatchSnapshot()
  })
})
