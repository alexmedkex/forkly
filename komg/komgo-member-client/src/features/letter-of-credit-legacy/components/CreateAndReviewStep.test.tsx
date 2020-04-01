import * as React from 'react'
import { mount, shallow } from 'enzyme'
import { DEFAULT_TEMPLATE, CreateAndReviewStep, CreateAndReviewStepProps } from './CreateAndReviewStep'
import { formikTestProps } from './ParticipantStep.test'
import * as renderer from 'react-test-renderer'
import { LCDocumentOrErrorOrLoading } from './documents/LCDocumentOrErrorOrLoading'

const buildLetterOfCreditFieldsMock = jest.fn()
const createAndGetDocumentMock = jest.fn()
const testProps: CreateAndReviewStepProps = {
  formik: formikTestProps,
  createAndGetDocument: createAndGetDocumentMock,
  buildLetterOfCreditFields: buildLetterOfCreditFieldsMock
}

describe('CreateAndReviewStep', () => {
  it('renders correctly', () => {
    expect(renderer.create(<CreateAndReviewStep {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('calls componentDidMount', () => {
    const spy = jest.spyOn(CreateAndReviewStep.prototype, 'componentDidMount')
    mount(<CreateAndReviewStep {...testProps} />)
    expect(spy).toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })

  it('passes undefined props to LCDocumentOrErrorOrLoading by default', () => {
    const reviewStep = shallow(<CreateAndReviewStep {...testProps} />)
    expect(
      reviewStep.containsMatchingElement(<LCDocumentOrErrorOrLoading document={undefined} error={undefined} />)
    ).toBeTruthy()
  })

  it('passes document to LCDocumentOrErrorOrLoading when document is present', () => {
    const reviewStep = mount(<CreateAndReviewStep {...testProps} />)
    const spy = jest.spyOn(CreateAndReviewStep.prototype, 'componentDidMount')
    spy.mockImplementationOnce(() => null)

    reviewStep.setState({ document: 'some document' })

    expect(
      reviewStep.containsMatchingElement(<LCDocumentOrErrorOrLoading document={'some document'} error={undefined} />)
    ).toBeTruthy()
  })

  it('passes error to LCDocumentOrErrorOrLoading when error is present', () => {
    const reviewStep = mount(<CreateAndReviewStep {...testProps} />)
    const spy = jest.spyOn(CreateAndReviewStep.prototype, 'componentDidMount')
    spy.mockImplementationOnce(() => null)

    reviewStep.setState({ error: 'some error' })

    expect(
      reviewStep.containsMatchingElement(<LCDocumentOrErrorOrLoading document={undefined} error={'some error'} />)
    ).toBeTruthy()
  })

  it('creates Letter of credit fields with buildLetterOfCreditFields', async () => {
    const reviewStep = await mount(<CreateAndReviewStep {...testProps} />)

    await reviewStep.instance().componentDidMount!()

    expect(buildLetterOfCreditFieldsMock).toHaveBeenCalledWith(testProps.formik.values)
  })

  it('passes default template ID and template fields to createAndGetDocument', async () => {
    const reviewStep = await mount(<CreateAndReviewStep {...testProps} />)
    buildLetterOfCreditFieldsMock.mockReturnValueOnce({ test: 'test' })

    await reviewStep.instance().componentDidMount!()

    expect(createAndGetDocumentMock).toHaveBeenCalledWith({
      templateId: DEFAULT_TEMPLATE,
      fields: { test: 'test' }
    })
  })

  it('sets error message if createAndGetDocument fails', async () => {
    const reviewStep = await mount(<CreateAndReviewStep {...testProps} />)
    createAndGetDocumentMock.mockRejectedValueOnce({ message: 'error!' })

    await reviewStep.instance().componentDidMount!()

    expect(reviewStep.state('error')).toEqual('error!')
  })

  it('calls setState if successful', async () => {
    const reviewStep = await mount(<CreateAndReviewStep {...testProps} />)
    createAndGetDocumentMock.mockResolvedValueOnce(new ArrayBuffer(0))
    const spy = jest.spyOn(CreateAndReviewStep.prototype, 'setState')

    await reviewStep.instance().componentDidMount!()

    expect(spy).toHaveBeenCalled()
  })

  it('calls formik.setFieldValue if successful', async () => {
    const reviewStep = await mount(<CreateAndReviewStep {...testProps} />)
    const spy = jest.spyOn(formikTestProps, 'setFieldValue')
    createAndGetDocumentMock.mockResolvedValueOnce(new ArrayBuffer(0))

    await reviewStep.instance().componentDidMount!()

    expect(spy).toHaveBeenCalled()
  })
})
