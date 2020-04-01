import * as React from 'react'
import { fakeFormikContext } from '../../../../store/common/faker'
import { ILCAmendmentBase } from '@komgo/types'
import { fakeLetterOfCreditDiff, fakeLetterOfCredit } from '../../utils/faker'
import { FormikProvider } from 'formik'
import * as renderer from 'react-test-renderer'
import { SummaryStep } from './SummaryStep'

describe('SummaryStep', () => {
  describe('render', () => {
    it('shows an amendment', () => {
      const setFieldValue = jest.fn()
      const formikContext = fakeFormikContext<ILCAmendmentBase>(
        {
          diffs: [
            fakeLetterOfCreditDiff(),
            {
              op: 'replace',
              path: '/deliveryPeriod/endDate',
              value: new Date('2021-1-31').toISOString(),
              oldValue: new Date('2020-12-31').toISOString(),
              type: 'ITrade'
            }
          ],
          lcStaticId: 'e7ad9040-bed4-418c-ae43-a43abfec2d89',
          lcReference: 'LC-REF-1',
          version: 1
        },
        { setFieldValue }
      )

      const tree = renderer
        .create(
          <FormikProvider value={formikContext}>
            <SummaryStep formik={formikContext} />
          </FormikProvider>
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
