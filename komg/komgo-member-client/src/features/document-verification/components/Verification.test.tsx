import * as React from 'react'
import { Verification, renderProcesses } from './Verification'
import { shallow } from 'enzyme'
import { createMemoryHistory } from 'history'

import * as renderer from 'react-test-renderer'

import { IVerifiedFile, IStatus } from '../store/types'

const file: IVerifiedFile = {
  status: IStatus.pending,
  hash: 'hash',
  key: 0,
  type: 'pdf',
  fileName: '001.pdf'
}

const testProps = {
  updatingErrors: [],
  errors: [],
  files: [],
  isFetching: false,
  location: {
    search: '',
    pathname: 'test',
    state: '',
    hash: ''
  },
  history: createMemoryHistory(),
  match: {
    isExact: true,
    path: '',
    url: '',
    params: null
  },
  staticContext: undefined,
  getSession: () => jest.fn(),
  verifyDocument: () => jest.fn()
}

describe('Document Verification', () => {
  it('should render process for files', () => {
    const files = [file]
    const tree = renderer.create(renderProcesses(files)).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
