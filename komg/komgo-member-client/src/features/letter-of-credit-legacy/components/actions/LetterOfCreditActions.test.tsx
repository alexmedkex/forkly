import * as React from 'react'
import { shallow } from 'enzyme'
import LetterOfCreditActions, { Actions } from './LetterOfCreditActions'
import { fakeLetterOfCreditEnriched, fakeTask } from '../../utils/faker'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import { Button } from 'semantic-ui-react'

describe('LetterOfCreditActions component', () => {
  let defaultProps: any

  const task = fakeTask({
    summary: 'Review application',
    context: {
      type: 'LC',
      id: '08e9f8',
      lcid: '08e9f8',
      name: LetterOfCreditTaskType.REVIEW_APPLICATION
    },
    assignee: 'fb15a3f4-e10e-4bd5-9e8b-55c2200f74cf'
  })

  beforeEach(() => {
    defaultProps = {
      letterOfCredit: fakeLetterOfCreditEnriched({ _id: '08e9f8' }),
      actions: { status: null, name: null },
      members: [],
      create: jest.fn(),
      restartActions: jest.fn(),
      tasks: [task],
      isAuthorized: () => true
    }
  })

  it('should render LetterOfCreditActions component successfully', () => {
    const wrapper = shallow(<LetterOfCreditActions {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should find two buttons', () => {
    const wrapper = shallow(<LetterOfCreditActions {...defaultProps} />)

    const buttons = wrapper.find(Button)

    expect(buttons.length).toBe(2)
  })

  it('should change state - isOpenUploadModal when button for upload is clicked', () => {
    const wrapper = shallow(<LetterOfCreditActions {...defaultProps} />)

    const uploadButton = wrapper.find(Button).first()

    uploadButton.simulate('click')

    expect(wrapper.state().isOpenUploadModal).toBe(true)
  })

  it('should change state - isOpenRejectModal when button for reject is clicked', () => {
    const wrapper = shallow(<LetterOfCreditActions {...defaultProps} />)

    const uploadButton = wrapper.find(Button).at(1)

    uploadButton.simulate('click')

    expect(wrapper.state().isOpenRejectModal).toBe(true)
  })

  it('should call restartActions when actions is updated and finished', () => {
    const wrapper = shallow(<LetterOfCreditActions {...defaultProps} />)

    wrapper.setProps({ ...defaultProps, actions: { name: 'test', status: 'FINISHED' } })

    expect(defaultProps.restartActions).toHaveBeenCalled()
  })

  it('should restart state when actions is updated and finished', () => {
    const wrapper = shallow(<LetterOfCreditActions {...defaultProps} />)

    const uploadButton = wrapper.find(Button).first()

    uploadButton.simulate('click')

    wrapper.setProps({ ...defaultProps, actions: { name: 'test', status: 'FINISHED' } })

    expect(wrapper.state().isOpenUploadModal).toBe(false)
  })
})
