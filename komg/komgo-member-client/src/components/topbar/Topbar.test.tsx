import React, { ReactElement } from 'react'
import * as renderer from 'react-test-renderer'
import Topbar, { TopbarProps } from './Topbar'
import { BasicTopbarInfoItem } from '../../features/receivable-discounting-legacy/components/generics/BasicTopbarInfoItem'

const defaultProps: TopbarProps = {
  title: 'The Title of the page'
}

const infoSection: ReactElement[] = [
  <BasicTopbarInfoItem key="item1" title={'item1'} value="value1" />,
  <BasicTopbarInfoItem key="item2" title={'item2'} value="value2" />
]

describe('Topbar', () => {
  let props

  beforeEach(() => {
    props = {
      ...defaultProps
    }
  })

  it('matches snapshot without InfoSection', () => {
    expect(renderer.create(<Topbar {...props} />).toJSON()).toMatchSnapshot()
  })

  it('matches snapshot WITH InfoSection', () => {
    expect(renderer.create(<Topbar {...props} infoSection={infoSection} />).toJSON()).toMatchSnapshot()
  })
})
