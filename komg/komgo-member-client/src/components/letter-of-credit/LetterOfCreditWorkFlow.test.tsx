import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { LetterOfCreditWorkflow } from '../letter-of-credit/LetterOfCreditWorkFlow'
import { LOC_STATUS } from '../../features/trades/constants'

describe('LetterOfCreditWorflow', () => {
  describe('renders', () => {
    Object.keys(LOC_STATUS).forEach(status => {
      it(`${status} status`, () => {
        expect(renderer.create(<LetterOfCreditWorkflow status={status} />).toJSON()).toMatchSnapshot()
      })
    })
  })
})
