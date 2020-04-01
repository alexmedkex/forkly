import * as React from 'react'
import * as renderer from 'react-test-renderer'
import FieldDisplay, { IProps } from './FieldDisplay'

describe('FieldDisplay', () => {
  const props: IProps = {
    label: 'some label',
    isOptional: false,
    value: 'some value',
    tooltip: 'some tooltip'
  }

  it('should match snapshot with tooltip', () => {
    expect(renderer.create(<FieldDisplay {...props} />).toJSON()).toMatchSnapshot()
  })

  it('should match snapshot without tooltip', () => {
    const displayProps = { ...props }
    delete displayProps.tooltip
    expect(renderer.create(<FieldDisplay {...props} />).toJSON()).toMatchSnapshot()
  })
})
