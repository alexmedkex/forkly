import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { lightBlue, lightRed } from '../../../styles/colors'
import { IStatus } from '../store/types'
import moment from 'moment-timezone'

import StatusBlock from './StatusBlock'

describe('StatusBlock', () => {
  beforeEach(() => {
    moment.tz.guess = jest.fn(() => 'UTC')
    moment.tz.setDefault('UTC')
  })
  it('should render block with pending status', () => {
    const fileData = {
      status: IStatus.pending,
      hash: '123456',
      key: 0,
      type: 'pdf',
      fileName: '001.pdf'
    }

    expect(renderer.create(<StatusBlock fileData={fileData} />).toJSON()).toMatchSnapshot()
  })

  it('should render block with error status', () => {
    const fileData = {
      status: IStatus.error,
      hash: '123456',
      key: 0,
      type: 'pdf',
      fileName: '001.pdf',
      iconColor: lightRed
    }

    expect(renderer.create(<StatusBlock fileData={fileData} />).toJSON()).toMatchSnapshot()
  })

  it('should render block with success status', () => {
    const fileData = {
      status: IStatus.success,
      hash: '123456',
      key: 0,
      type: 'pdf',
      fileName: '001.pdf',
      iconColor: lightBlue,
      registeredAt: '1565619089528',
      registeredBy: 'Company 001'
    }

    expect(renderer.create(<StatusBlock fileData={fileData} />).toJSON()).toMatchSnapshot()
  })
})
