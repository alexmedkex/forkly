import React from 'react'
import { IModalPromptProps, ModalPrompt } from './ModalPrompt'
import { ShallowWrapper, shallow } from 'enzyme'
import { LoadingTransition, ErrorMessage } from '..'

describe('ModalPrompt', () => {
  let wrapper: ShallowWrapper<React.FC<IModalPromptProps>>
  let testProps: IModalPromptProps
  beforeEach(() => {
    testProps = {
      header: 'header',
      open: true,
      loading: false,
      actions: <></>
    }
  })
  it('shows content if there is no error message and it is not loading', () => {
    wrapper = shallow(
      <ModalPrompt {...testProps} error={undefined} loading={false}>
        <div data-test-id="content">Test prompt</div>
      </ModalPrompt>
    )

    expect(wrapper.find('[data-test-id="content"]').exists()).toBeTruthy()
  })
  it('shows loading transition while loading', () => {
    wrapper = shallow(
      <ModalPrompt {...testProps} loading={true}>
        <div data-test-id="content">Test prompt</div>
      </ModalPrompt>
    )

    expect(wrapper.find(LoadingTransition).exists()).toBeTruthy()
    expect(wrapper.find('[data-test-id="content"]').exists()).toBeFalsy()
  })
  it('does not show loading transition while loading', () => {
    wrapper = shallow(
      <ModalPrompt {...testProps} loading={false}>
        <div data-test-id="content">Test prompt</div>
      </ModalPrompt>
    )

    expect(wrapper.find(LoadingTransition).exists()).toBeFalsy()
  })
  it('shows error message if there is an error', () => {
    wrapper = shallow(
      <ModalPrompt {...testProps} error={'failed'}>
        <div data-test-id="content">Test prompt</div>
      </ModalPrompt>
    )

    expect(wrapper.find(ErrorMessage).exists()).toBeTruthy()
    expect(wrapper.find('[data-test-id="content"]').exists()).toBeFalsy()
  })
  it('does not show error message if there is none', () => {
    wrapper = shallow(
      <ModalPrompt {...testProps} error={undefined}>
        <div data-test-id="content">Test prompt</div>
      </ModalPrompt>
    )

    expect(wrapper.find(ErrorMessage).exists()).toBeFalsy()
  })
})
