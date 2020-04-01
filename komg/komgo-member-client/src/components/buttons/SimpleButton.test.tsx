import * as React from 'react'
import { shallow } from 'enzyme'
import SimpleButton from './SimpleButton'
import * as renderer from 'react-test-renderer'

describe('Simple Button', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<SimpleButton />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
