import Routes from './routes'
import * as React from 'react'

import { MemoryRouter } from 'react-router-dom'
import { shallow, mount } from 'enzyme'
import { Provider } from 'react-redux'
import { makeTestStore } from './utils/test-helpers'

describe('Routes()', () => {
  let store: any
  beforeAll(() => {
    store = makeTestStore()
  })
  it('should render the roles component on the /roles route', () => {
    // Arrange
    const initialEntry = '/roles'

    const provider = shallow(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes />
        </MemoryRouter>
      </Provider>
    )

    expect(provider.prop('initialEntries')).toEqual([initialEntry])
  })

  it('should render the users component on the /users route', () => {
    // Arrange
    const initialEntry = '/users'

    // Act
    const provider = shallow(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes />
        </MemoryRouter>
      </Provider>
    )

    // Assert
    expect(provider.prop('initialEntries')).toEqual([initialEntry])
  })
})
