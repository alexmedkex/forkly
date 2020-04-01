import * as React from 'react'
import { mount } from 'enzyme'
import { fakeFormikContext } from '../../../../store/common/faker'
import { ILCAmendmentBase } from '@komgo/types'
import { fakeLetterOfCreditDiff, fakeLetterOfCredit } from '../../utils/faker'
import { FormikProvider } from 'formik'
import TradeStep from './TradeStep'
import { Checkbox } from 'semantic-ui-react'

describe('TradeStep', () => {
  it('does not display diffs related to ILC', () => {
    const lc = fakeLetterOfCredit()
    const setFieldValue = jest.fn()
    const formikContext = fakeFormikContext<ILCAmendmentBase>(
      {
        diffs: [fakeLetterOfCreditDiff()],
        lcStaticId: lc._id,
        lcReference: lc.reference,
        version: 1
      },
      { setFieldValue }
    )

    const wrapper = mount(
      <FormikProvider value={formikContext}>
        <TradeStep />
      </FormikProvider>
    )

    expect(wrapper.find(Checkbox).length).toEqual(0)
  })
  it('keeps any diffs related to ILC', () => {
    const lc = fakeLetterOfCredit()
    const setFieldValue = jest.fn()
    const formikContext = fakeFormikContext<ILCAmendmentBase>(
      {
        diffs: [fakeLetterOfCreditDiff(), { type: 'ITrade', value: 1, oldValue: 2, path: '/quantity', op: 'replace' }],
        lcStaticId: lc._id,
        lcReference: lc.reference,
        version: 1
      },
      { setFieldValue }
    )

    const wrapper = mount(
      <FormikProvider value={formikContext}>
        <TradeStep />
      </FormikProvider>
    )

    wrapper.find(Checkbox).simulate('click')

    expect(setFieldValue).toHaveBeenCalledWith('diffs', [
      { oldValue: 'OTHER', op: 'replace', path: '/feesPayableBy', type: 'ILC', value: 'SPLIT' }
    ])
  })
})
