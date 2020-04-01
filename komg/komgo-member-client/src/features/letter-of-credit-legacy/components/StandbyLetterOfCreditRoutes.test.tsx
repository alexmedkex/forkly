import Routes from './StandbyLetterOfCreditRoutes'
import * as React from 'react'

import { MemoryRouter } from 'react-router-dom'
import { mount } from 'enzyme'
import CreateStandByLetterOfCredit from '../../standby-letter-of-credit-legacy/containers/CreateStandByLetterOfCredit'

jest.mock('../../standby-letter-of-credit-legacy/containers/CreateStandByLetterOfCredit', () => () => <p>mock</p>)

describe('StandbyLetterOfCredit routes', () => {
  describe('StandbyLetterOfCredit', () => {
    it('renders /financial-instruments/standby-letters-of-credit', () => {
      const component = mount(
        <MemoryRouter initialEntries={['/financial-instruments/standby-letters-of-credit/new']}>
          <Routes />
        </MemoryRouter>
      )
      expect(component.find(CreateStandByLetterOfCredit)).toHaveLength(1)
    })
  })
})
