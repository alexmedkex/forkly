import React from 'react'
import { buildFakeLetterOfCredit } from '@komgo/types'
import { render, cleanup } from '@testing-library/react'
import { buildLetterOfCreditEnriched } from '../utils/buildLetterOfCreditEnriched'
import RoleInfo from './RoleInfo'

jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('RoleInfo', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(cleanup)

  it('renders', () => {
    const tasks = []
    const companyStaticId = 'cf63c1f8-1165-4c94-a8f8-9252eb4f0016' // copied from buildLetterOfCreditEnriched
    const letter = buildLetterOfCreditEnriched(buildFakeLetterOfCredit(), tasks, companyStaticId)
    const { asFragment } = render(<RoleInfo letter={letter} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
