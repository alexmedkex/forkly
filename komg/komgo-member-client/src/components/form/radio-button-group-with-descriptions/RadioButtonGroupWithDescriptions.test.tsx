import React from 'react'
import { render, fireEvent, wait } from '@testing-library/react'
import { fakeFormik } from '../../../features/receivable-discounting-legacy/utils/faker'
import {
  RadioButtonGroupWithDescriptions,
  IRadioButtonGroupWithDescriptionsProps,
  StyledRadio,
  IRadioButtonWithDescription,
  StyledTitleContainer,
  StyledHeaderTitle
} from './RadioButtonGroupWithDescriptions'
import { RequestType } from '@komgo/types'
import { shallow } from 'enzyme'
import { displayRequestType } from '../../../features/receivable-discounting-legacy/utils/displaySelectors'
import { Strings } from '../../../features/receivable-discounting-legacy/resources/strings'

describe('RadioButtonGroupWithDescriptions', () => {
  let testProps: IRadioButtonGroupWithDescriptionsProps

  const radioButtonTestOptions: IRadioButtonWithDescription[] = [
    {
      value: RequestType.RiskCover,
      label: displayRequestType(RequestType.RiskCover),
      description: Strings.RiskCoverDescription,
      disabled: true
    },
    {
      value: RequestType.RiskCoverDiscounting,
      label: displayRequestType(RequestType.RiskCoverDiscounting),
      description: Strings.RiskCoverReceivableDiscountingDescription
    },
    {
      value: RequestType.Discount,
      label: displayRequestType(RequestType.Discount),
      description: Strings.ReceivableDiscountingDescription
    }
  ]

  beforeEach(() => {
    testProps = {
      groupTitle: 'Select an option',
      formik: fakeFormik,
      options: radioButtonTestOptions,
      name: 'requestType'
    }
  })

  it('matches snapshot ', () => {
    expect(render(<RadioButtonGroupWithDescriptions {...testProps} />).asFragment()).toMatchSnapshot()
  })

  it('leaves out the disabled option - leaving 2 Form Fields', () => {
    const wrapper = shallow(<RadioButtonGroupWithDescriptions {...testProps} />)

    expect(wrapper.find(StyledRadio).length).toBe(2)
  })

  it('shows a groupTitle if provided', () => {
    const wrapper = shallow(<RadioButtonGroupWithDescriptions {...testProps} />)

    expect(wrapper.find(StyledHeaderTitle).exists()).toBeTruthy()
  })

  it('does not show a groupTitle is not provided', () => {
    delete testProps.groupTitle

    const wrapper = shallow(<RadioButtonGroupWithDescriptions {...testProps} />)

    expect(wrapper.find(StyledHeaderTitle).exists()).toBeFalsy()
  })

  it('calls setFieldValue when option changed', async done => {
    const { getByTestId } = render(<RadioButtonGroupWithDescriptions {...testProps} />)

    const option1Radio = getByTestId('radioButtongroup-RISK_COVER_DISCOUNTING').querySelector('input')

    fireEvent.change(option1Radio, { target: { value: option1Radio.value } })
    fireEvent.blur(option1Radio)

    wait(() => {
      expect(testProps.formik.setFieldValue).toHaveBeenCalledWith('requestType', RequestType.RiskCoverDiscounting)
      done()
    })
  })
})
