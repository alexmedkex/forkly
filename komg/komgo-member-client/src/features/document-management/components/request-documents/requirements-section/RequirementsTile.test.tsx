import * as React from 'react'
import { RequirementsTile, Props } from './RequirementsTile'
import * as renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { fakeDocument } from '../../../utils/faker'
import { BottomSheetStatus } from '../../../../bottom-sheet/store/types'

describe('RequirementsTile component', () => {
  const mockProps: Props = {
    documentType: [fakeDocument({ id: '1' }).type],
    typeDocuments: [fakeDocument({ id: '1' }), fakeDocument({ id: '2' })],
    attachedDocument: fakeDocument({ id: '1', state: BottomSheetStatus.REGISTERED }),
    toggleAutomatchModalVisible: jest.fn(),
    removeAttachedDocument: jest.fn(),
    toggleSelectionDocumentType: jest.fn(documentTypeId => null),
    toggleAddDocumentModalVisible: jest.fn(),
    openViewDocument: jest.fn()
  }

  it('renders', () => {
    expect(renderer.create(<RequirementsTile {...mockProps} />).toJSON()).toMatchSnapshot()
  })

  it('should call openViewDocument once view button is clicked', () => {
    const wrapper = shallow(<RequirementsTile {...mockProps} />)

    const viewButton = wrapper.shallow().find('[data-test-id="view-document-anon document"]')

    viewButton.simulate('click')

    expect(mockProps.openViewDocument).toHaveBeenCalledWith('1')
  })

  it('should call removeAttachedDocument once remove button is clicked', () => {
    const wrapper = shallow(<RequirementsTile {...mockProps} />)

    const viewButton = wrapper.shallow().find('[data-test-id="remove-document-anon document"]')

    viewButton.simulate('click')

    expect(mockProps.removeAttachedDocument).toHaveBeenCalledWith('passports-of-ubos', '1')
  })
})
