import * as React from 'react'
import { shallow } from 'enzyme'
import FileUpload, { UploadFileText, UploadedFileText, StyledXButton } from './FileUpload'

describe('FileUpload Component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      file: null,
      uploadFileText: 'File',
      name: 'file',
      accept: 'application/pdf',
      label: 'File',
      onChange: jest.fn()
    }
  })

  it('Should render successfully FileUpload component', () => {
    const wrapper = shallow(<FileUpload {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('Should render UploadFileText when file is not set', () => {
    const wrapper = shallow(<FileUpload {...defaultProps} />)

    const uploadFileTextComponent = wrapper.find(UploadFileText)

    expect(uploadFileTextComponent.length).toBe(1)
  })

  it('Should render UploadedFileText when file is set', () => {
    const file = new File([''], 'filename', { type: 'text/html' })
    const wrapper = shallow(<FileUpload {...defaultProps} file={file} />)

    const uploadFileTextComponent = wrapper.find(UploadedFileText)

    expect(uploadFileTextComponent.length).toBe(1)
  })

  it('Should call onChange function when icon close is clicked', () => {
    const file = new File([''], 'filename', { type: 'text/html' })
    const wrapper = shallow(<FileUpload {...defaultProps} file={file} />)

    const icon = wrapper
      .find(UploadedFileText)
      .find(StyledXButton)
      .first()

    icon.simulate('click')

    expect(defaultProps.onChange).toHaveBeenCalledWith(defaultProps.name, null)
  })
})
