import { shallow } from 'enzyme'
import { Table } from 'semantic-ui-react'
import * as React from 'react'

import { Task } from '../store/types'
import KycReviewDocumentsTask from './KycReviewDocumentsTask'
import { fakeTask } from '../../letter-of-credit-legacy/utils/faker'

const task: Task = fakeTask()

describe('KycReviewDocumentsTask', () => {
  it('renders Table component', () => {
    const component = shallow(<KycReviewDocumentsTask task={task} assignedUser={null} />)
    expect(component.find(Table)).toBeTruthy()
  })
})
