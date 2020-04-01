import * as React from 'react'
import { mount, shallow } from 'enzyme'
import { ReviewStep, ReviewStepProps } from './ReviewStep'
import { fakeLetterOfCredit } from '../utils/faker'
import * as renderer from 'react-test-renderer'
import { LCDocumentOrErrorOrLoading } from './documents/LCDocumentOrErrorOrLoading'

const getDocumentMock = jest.fn()
const letterOfCreditMock = fakeLetterOfCredit()
const testProps: ReviewStepProps = {
  letterOfCredit: letterOfCreditMock,
  getDocument: getDocumentMock
}

describe('ReviewStep', () => {
  it('renders correctly', () => {
    expect(renderer.create(<ReviewStep {...testProps} />).toJSON()).toMatchSnapshot()
  })

  it('calls componentDidMount', () => {
    const spy = jest.spyOn(ReviewStep.prototype, 'componentDidMount')
    mount(<ReviewStep {...testProps} />)
    expect(spy).toHaveBeenCalled()
    spy.mockReset()
    spy.mockRestore()
  })

  it('passes undefined props to LCDocumentOrErrorOrLoading by default', () => {
    const reviewStep = shallow(<ReviewStep {...testProps} />)
    expect(
      reviewStep.containsMatchingElement(<LCDocumentOrErrorOrLoading document={undefined} error={undefined} />)
    ).toBeTruthy()
  })

  it('passes document to LCDocumentOrErrorOrLoading when document is present', () => {
    const reviewStep = mount(<ReviewStep {...testProps} />)
    const spy = jest.spyOn(ReviewStep.prototype, 'componentDidMount')
    spy.mockImplementationOnce(() => null)

    reviewStep.setState({ document: 'some document' })

    expect(
      reviewStep.containsMatchingElement(<LCDocumentOrErrorOrLoading document={'some document'} error={undefined} />)
    ).toBeTruthy()
  })

  it('passes error to LCDocumentOrErrorOrLoading when error is present', () => {
    const reviewStep = mount(<ReviewStep {...testProps} />)
    const spy = jest.spyOn(ReviewStep.prototype, 'componentDidMount')
    spy.mockImplementationOnce(() => null)

    reviewStep.setState({ error: 'some error' })

    expect(
      reviewStep.containsMatchingElement(<LCDocumentOrErrorOrLoading document={undefined} error={'some error'} />)
    ).toBeTruthy()
  })

  it('sets the error state if there is no reference on the letter of credit', async () => {
    const { reference, ...letterOfCreditWithoutRefefence } = testProps.letterOfCredit
    const testPropsWithoutReference = { ...testProps, letterOfCredit: letterOfCreditWithoutRefefence }
    const reviewStep = await mount(<ReviewStep {...testPropsWithoutReference} />)

    await reviewStep.instance().componentDidMount!()

    expect(reviewStep.state('error')).toBeDefined()
  })

  it('passes id to getDocument', async () => {
    const reviewStep = await mount(<ReviewStep {...testProps} />)

    await reviewStep.instance().componentDidMount!(),
      expect(getDocumentMock).toHaveBeenCalledWith({
        id: letterOfCreditMock._id
      })
  })

  it('sets the error state if getDocument fails', async () => {
    const reviewStep = await mount(<ReviewStep {...testProps} />)
    getDocumentMock.mockRejectedValueOnce({ message: 'some error' })

    await reviewStep.instance().componentDidMount!()

    expect(reviewStep.state()).toEqual({ error: 'some error' })
  })
})
