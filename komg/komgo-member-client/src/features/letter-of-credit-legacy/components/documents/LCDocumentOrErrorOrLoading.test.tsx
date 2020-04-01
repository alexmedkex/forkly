import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { mount, shallow } from 'enzyme'
import { LCDocumentOrErrorOrLoading, LCDocumentOrErrorOrLoadingProps } from './LCDocumentOrErrorOrLoading'
import { Document } from '../../../../components/document/Document'
import { ErrorMessage, LoadingTransition } from '../../../../components'

const testProps: LCDocumentOrErrorOrLoadingProps = {
  document: 'test document'
}

const errorProps: LCDocumentOrErrorOrLoadingProps = {
  error: 'some error'
}

describe('LCDocumentErrorOrLoading', () => {
  it('renders correctly', () => {
    expect(renderer.create(<LCDocumentOrErrorOrLoading {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('returns a Document if document is defined', () => {
    const wrapper = shallow(<LCDocumentOrErrorOrLoading {...testProps} />)

    expect(wrapper.containsMatchingElement(<Document base64Content={'test document'} />)).toBeTruthy()
  })

  it('returns an Error if an error is defined', () => {
    const wrapper = shallow(<LCDocumentOrErrorOrLoading {...errorProps} />)

    expect(
      wrapper.containsMatchingElement(<ErrorMessage error={'some error'} title="Error while generating PDF document" />)
    ).toBeTruthy()
  })

  it('returns loading spinner if neither is defined', () => {
    const wrapper = shallow(<LCDocumentOrErrorOrLoading />)

    expect(wrapper.containsMatchingElement(<LoadingTransition title="Loading document" marginTop="0" />)).toBeTruthy()
  })
})
