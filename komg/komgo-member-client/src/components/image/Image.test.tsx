import { mount } from 'enzyme'

import * as React from 'react'

import Image from './Image'

describe('Image Component', () => {
  it('should render an image with attributes', () => {
    // Arrange
    const expectedSrc = 'image:src'
    const expectedAlt = 'image:alt'
    const expectedWidth = 200
    const image = mount(<Image src={expectedSrc} alt={expectedAlt} width={expectedWidth} />)

    // Act
    const imageProps = image.find('img').props()

    // Assert
    expect(imageProps.alt).toEqual(expectedAlt)
    expect(imageProps.src).toEqual(expectedSrc)
    expect(imageProps.width).toEqual(expectedWidth)
  })
})
