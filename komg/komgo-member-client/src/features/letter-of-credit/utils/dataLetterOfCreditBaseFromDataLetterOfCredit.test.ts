import React from 'react'
import { buildDataLetterOfCreditBase } from './dataLetterOfCreditBaseFromDataLetterOfCredit'
import { buildFakeDataLetterOfCredit } from '@komgo/types'

describe('dataLetterOfCreditBaseFromDataLetterOfCredit', () => {
  it('works when cargo is undefined', () => {
    const data = buildFakeDataLetterOfCredit()
    delete data.cargo

    const base = buildDataLetterOfCreditBase(data)

    expect(base).toMatchSnapshot()
  })
})
