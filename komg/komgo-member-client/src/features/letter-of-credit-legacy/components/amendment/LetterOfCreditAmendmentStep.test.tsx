import * as React from 'react'
import * as renderer from 'react-test-renderer'
import LetterOfCreditAmendmentStep, { amendableFields } from './LetterOfCreditAmendmentStep'
import { mount, ReactWrapper } from 'enzyme'
import { FormikProvider } from 'formik'
import { fakeFormikContext } from '../../../../store/common/faker'
import { LetterOfCreditAmendmentContext } from '../../containers/CreateAmendment'
import { fakeLetterOfCredit, fakeLetterOfCreditDiff } from '../../utils/faker'
import { PropertyEditor, keyToPath } from './PropertyEditor'
import { Icon } from 'semantic-ui-react'
import { INVOICE_REQUIREMENT_OPTIONS } from '../../constants'
import { ILCAmendmentBase, Currency } from '@komgo/types'

const lc = fakeLetterOfCredit()

const lcAmendments = [fakeLetterOfCreditDiff()]

const setFieldValue = jest.fn()

const formikContext = fakeFormikContext<ILCAmendmentBase>(
  {
    diffs: lcAmendments,
    lcStaticId: lc._id,
    lcReference: lc.reference,
    version: 1
  },
  { setFieldValue }
)

describe('LetterOfCreditAmendmentStep', () => {
  let wrapper: ReactWrapper
  beforeEach(() => {
    jest.resetAllMocks()
    wrapper = mount(
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider value={formikContext}>
          <LetterOfCreditAmendmentStep />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )
  })
  it('shows a create field link', () => {
    expect(wrapper.find('button').text()).toEqual('+ Add field')
  })
  it('calls setFieldValue with the right arguments when you click create amendment button', () => {
    expect(wrapper.find(PropertyEditor).length).toEqual(1)

    wrapper.find('button').simulate('click')

    expect(setFieldValue).toHaveBeenCalledWith('diffs', [
      { oldValue: 'OTHER', op: 'replace', path: keyToPath('feesPayableBy'), value: 'SPLIT', type: 'ILC' },
      { oldValue: '', op: 'replace', path: '', value: '', type: 'ILC' }
    ])
  })
  it('still shows the add amendment button when you click create amendment button', () => {
    wrapper.find('button').simulate('click')

    expect(wrapper.find('button').length).toEqual(1)
  })
  it('hides the new update box when you click close on the new PropertyEditor', () => {
    wrapper.find('button').simulate('click')

    wrapper
      .find(PropertyEditor)
      .last()
      .find(Icon)
      .find({ name: 'close' })
      .simulate('click')

    expect(wrapper.find(PropertyEditor).length).toEqual(1)
  })
  it('Gives the update box all of the options', () => {
    const props = wrapper.find(PropertyEditor).prop('options')

    expect(props).toEqual(amendableFields)
  })
  it('omits options already in other PropertyEditors', () => {
    const customFormikContext = {
      ...formikContext,
      values: {
        lcStaticId: lc._id,
        lcReference: lc.reference,
        version: 1,
        diffs: [...lcAmendments, fakeLetterOfCreditDiff({ path: keyToPath('availableWith') })]
      }
    }
    wrapper = mount(
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider value={customFormikContext}>
          <LetterOfCreditAmendmentStep />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )

    const PropertyEditors = wrapper.find(PropertyEditor)

    expect(PropertyEditors.length).toEqual(2)

    expect(PropertyEditors.first().prop('options')).toEqual(
      amendableFields.filter(f => keyToPath(f) !== customFormikContext.values.diffs[1].path)
    )

    expect(PropertyEditors.last().prop('options')).toEqual(
      amendableFields.filter(f => keyToPath(f) !== customFormikContext.values.diffs[0].path)
    )
  })
  it('disables the create amendment button if all amendments in list are completed', () => {
    const allAmendments = amendableFields.map(f => fakeLetterOfCreditDiff({ path: keyToPath(f) }))

    wrapper = mount(
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider
          value={fakeFormikContext<ILCAmendmentBase>({
            diffs: allAmendments,
            lcStaticId: lc._id,
            lcReference: lc.reference,
            version: 1
          })}
        >
          <LetterOfCreditAmendmentStep />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )

    expect(wrapper.find('button').prop('disabled')).toEqual(true)
  })
  it('gives each PropertyEditor an index', () => {
    const allAmendments = amendableFields.map(f => fakeLetterOfCreditDiff({ path: keyToPath(f) }))

    wrapper = mount(
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider
          value={fakeFormikContext<ILCAmendmentBase>({
            diffs: allAmendments,
            lcStaticId: lc._id,
            lcReference: lc.reference,
            version: 1
          })}
        >
          <LetterOfCreditAmendmentStep />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )

    expect(wrapper.find(PropertyEditor).length).toEqual(allAmendments.length)

    expect(
      wrapper
        .find(PropertyEditor)
        .at(3)
        .prop('index')
    ).toEqual(3)
  })
  it('hides any differences which are not in the list of accepted differences', () => {
    wrapper = mount(
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider
          value={fakeFormikContext<ILCAmendmentBase>({
            lcStaticId: lc._id,
            lcReference: lc.reference,
            version: 1,
            diffs: [fakeLetterOfCreditDiff({ value: 'hi', oldValue: 'hey', path: keyToPath('expiryPlace') })]
          })}
        >
          <LetterOfCreditAmendmentStep />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )

    expect(wrapper.find(PropertyEditor).length).toEqual(0)
  })
  it('renders a LetterOfCreditAmendmentStep with two amendments', () => {
    expect(
      renderer
        .create(
          <LetterOfCreditAmendmentContext.Provider value={lc}>
            <FormikProvider
              value={fakeFormikContext<ILCAmendmentBase>({
                lcStaticId: lc._id,
                lcReference: lc.reference,
                version: 1,
                diffs: [
                  fakeLetterOfCreditDiff({
                    value: INVOICE_REQUIREMENT_OPTIONS.EXHAUSTIVE,
                    oldValue: INVOICE_REQUIREMENT_OPTIONS.SIMPLE,
                    path: keyToPath('invoiceRequirement')
                  }),
                  fakeLetterOfCreditDiff({
                    value: Currency.EUR,
                    oldValue: Currency.USD,
                    path: keyToPath('currency')
                  })
                ]
              })}
            >
              <LetterOfCreditAmendmentStep />
            </FormikProvider>
          </LetterOfCreditAmendmentContext.Provider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
