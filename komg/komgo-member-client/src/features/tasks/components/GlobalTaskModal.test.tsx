import * as React from 'react'
import { shallow } from 'enzyme'
import { task } from '../store/reducer.test'
import { Modal } from 'semantic-ui-react'

import { GlobalTaskModal } from './GlobalTaskModal'
import { LetterOfCreditTaskType } from '../../letter-of-credit-legacy/constants/taskType'

describe('GlobalTaskModal', () => {
  const defaultProps = {
    task: { ...task, taskType: LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES },
    setTask: jest.fn()
  }

  it('render component successfully', () => {
    const wrapper = shallow(<GlobalTaskModal {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('render modal component when task exists', () => {
    const wrapper = shallow(<GlobalTaskModal {...defaultProps} />)

    const modal = wrapper.find(Modal)

    expect(modal.length).toBe(1)
  })

  it('do not render modal component', () => {
    const wrapper = shallow(<GlobalTaskModal {...defaultProps} task={null} />)

    const modal = wrapper.find(Modal)

    expect(modal.length).toBe(0)
  })

  it('call setTask with null', () => {
    const wrapper = shallow(<GlobalTaskModal {...defaultProps} task={null} />)

    const instance = wrapper.instance() as GlobalTaskModal

    instance.close()

    expect(defaultProps.setTask).toHaveBeenCalledWith(null)
  })
})
