import { mount } from 'enzyme'
import * as React from 'react'

import Header from './Header'

describe('Header Component', () => {
  it('should render Consensys', () => {
    // Arrange
    const expectedTitle = 'Consensys'
    const header = mount(<Header title="Consensys" />)

    // Act
    const title = header.find('h1').text()

    // Assert
    expect(title).toEqual(expectedTitle)
  })

  it('should render red', () => {
    // Arrange
    const header = mount(<Header title="world" colour="red" />)

    // Act
    const colour = header.props().colour

    // Assert
    expect(colour).toEqual('red')
  })
})
