import { shallow } from 'enzyme'
import * as React from 'react'
import DocumentActionsButtonGroup from './DocumentActionsButtonGroup'

describe('DocumentActionsButtonGroup component', () => {
  const mockFunc = jest.fn(() => void 0)

  it('should render a DocumentActionsButtonGroup item with visible=false', () => {
    const wrapper = shallow(
      <DocumentActionsButtonGroup
        toggleShareDocumentModalVisible={mockFunc}
        downloadSelectedDocuments={mockFunc}
        visible={false}
      />
    )
    expect(wrapper.find('DocumentActionsButtonGroup').exists).toBeTruthy()
  })

  it('should render a DocumentActionsButtonGroup item with props with visible=true', () => {
    const wrapper = shallow(
      <DocumentActionsButtonGroup
        toggleShareDocumentModalVisible={mockFunc}
        downloadSelectedDocuments={mockFunc}
        visible={true}
      />
    )
    expect(wrapper.find('DocumentActionsButtonGroup').exists).toBeTruthy()
  })
})
