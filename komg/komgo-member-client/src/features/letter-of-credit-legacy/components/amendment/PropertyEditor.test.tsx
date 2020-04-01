import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { mount, ReactWrapper } from 'enzyme'
import PropertyEditor, { keyToPath } from './PropertyEditor'
import { Icon, Dropdown, Input } from 'semantic-ui-react'
import { fakeLetterOfCredit, fakeLetterOfCreditDiff } from '../../utils/faker'
import { LetterOfCreditAmendmentContext } from '../../containers/CreateAmendment'
import { FormikProvider } from 'formik'
import { fakeFormikContext } from '../../../../store/common/faker'
import { AVAILABLE_WITH_OPTIONS, FEES_PAYABLE_BY_OPTIONS } from '../../constants'
import { ILCAmendmentBase } from '@komgo/types'

const lc = fakeLetterOfCredit()
const setFieldValueFunc = jest.fn()

describe('PropertyEditor', () => {
  let wrapper: ReactWrapper
  const index = 0
  const feesPayableBy = 'feesPayableBy'
  const availableWith = 'availableWith'
  const invoiceRequirement = 'invoiceRequirement'
  const expiryDate = 'expiryDate'
  const expiryDateAmendment = fakeLetterOfCreditDiff({
    value: '02-01-1990',
    oldValue: lc.expiryDate as string,
    path: keyToPath(expiryDate)
  })

  describe('empty field', () => {
    const noFieldJSX = (
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider
          value={fakeFormikContext<ILCAmendmentBase>(
            {
              diffs: [],
              lcStaticId: lc._id,
              lcReference: lc.reference,
              version: 1
            },
            { setFieldValue: setFieldValueFunc }
          )}
        >
          <PropertyEditor index={index} options={[feesPayableBy]} field={''} />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )
    describe('Remove button', () => {
      beforeEach(() => {
        jest.resetAllMocks()

        wrapper = mount(noFieldJSX)
      })
      it('exists', () => {
        expect(wrapper.find(Icon).find({ name: 'close' }).length).toEqual(1)
      })
      it('calls setFieldValue when clicked', () => {
        expect(setFieldValueFunc).not.toHaveBeenCalled()

        wrapper
          .find(Icon)
          .find({ name: 'close' })
          .simulate('click')

        expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [])
      })
      it('does not affect diffs which are not type ILC', () => {
        wrapper = mount(
          <LetterOfCreditAmendmentContext.Provider value={lc}>
            <FormikProvider
              value={fakeFormikContext<ILCAmendmentBase>(
                {
                  diffs: [{ path: '/test', type: 'ITrade', value: '1', oldValue: '0', op: 'replace' }],
                  lcStaticId: lc._id,
                  lcReference: lc.reference,
                  version: 1
                },
                { setFieldValue: setFieldValueFunc }
              )}
            >
              <PropertyEditor index={index} options={[feesPayableBy]} field={''} />
            </FormikProvider>
          </LetterOfCreditAmendmentContext.Provider>
        )

        expect(setFieldValueFunc).not.toHaveBeenCalled()

        wrapper
          .find(Icon)
          .find({ name: 'close' })
          .simulate('click')

        expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [
          { oldValue: '0', op: 'replace', path: '/test', type: 'ITrade', value: '1' }
        ])
      })
    })
    it('does not show input boxes', () => {
      expect(wrapper.find(Input).length).toEqual(0)
    })
    it('matches snapshot', () => {
      expect(renderer.create(noFieldJSX).toJSON()).toMatchSnapshot()
    })
  })
  describe('dropdown', () => {
    let dropdownJsx
    beforeEach(() => {
      jest.resetAllMocks()

      dropdownJsx = (
        <LetterOfCreditAmendmentContext.Provider value={lc}>
          <FormikProvider
            value={fakeFormikContext<ILCAmendmentBase>(
              {
                lcStaticId: lc._id,
                lcReference: lc.reference,
                version: 1,
                diffs: [
                  fakeLetterOfCreditDiff({ path: keyToPath(feesPayableBy) }),
                  fakeLetterOfCreditDiff({ type: 'ITrade', path: '/buyerEtrmId' })
                ]
              },
              { setFieldValue: setFieldValueFunc }
            )}
          >
            <PropertyEditor options={[feesPayableBy]} index={index} field={''} />
          </FormikProvider>
        </LetterOfCreditAmendmentContext.Provider>
      )

      wrapper = mount(dropdownJsx)
    })
    it('calls setFieldValue when dropdown value is changed', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()

      wrapper.find(Dropdown.Item).simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [
        {
          oldValue: 'OTHER',
          op: 'replace',
          path: '/buyerEtrmId',
          type: 'ITrade',
          value: 'SPLIT'
        },
        {
          oldValue: FEES_PAYABLE_BY_OPTIONS.APPLICANT,
          op: 'replace',
          path: keyToPath(feesPayableBy),
          value: '',
          type: 'ILC'
        }
      ])
    })
    it('matches snapshot', () => {
      expect(renderer.create(dropdownJsx).toJSON()).toMatchSnapshot()
    })
  })
  describe('field specified', () => {
    const fieldSpecifiedJSX = (
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider
          value={fakeFormikContext<ILCAmendmentBase>(
            {
              lcStaticId: lc._id,
              lcReference: lc.reference,
              version: 1,
              diffs: [expiryDateAmendment]
            },
            { setFieldValue: setFieldValueFunc }
          )}
        >
          <PropertyEditor options={[feesPayableBy, availableWith, expiryDate]} field={expiryDate} index={index} />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )
    beforeEach(() => {
      jest.resetAllMocks()

      wrapper = mount(fieldSpecifiedJSX)
    })
    afterEach(() => {
      wrapper.unmount()
    })
    it('displays 2 input boxes', () => {
      expect(wrapper.find(Input).length).toEqual(2)
    })
    it('displays old value in disabled input box', () => {
      const disabledInput = wrapper.find('input').find({ disabled: true })
      expect(disabledInput.length).toEqual(1)
      expect(disabledInput.prop('value')).toEqual(expiryDateAmendment.oldValue)
    })
    it('displays new value in other not disabled input box', () => {
      const input = wrapper.find('input').find({ value: expiryDateAmendment.value })
      expect(input.length).toEqual(1)
      expect(input.prop('disabled')).toEqual(false)
    })
    it('calls setFieldValue with correct arguments when input box is changed', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()
      const input = wrapper.find('input').find({ value: expiryDateAmendment.value })
      input.simulate('change', { target: { value: '2019-03-02' } })
      expect(setFieldValueFunc).toHaveBeenLastCalledWith('diffs', [
        { oldValue: lc.expiryDate, op: 'replace', path: keyToPath(expiryDate), value: '2019-03-02', type: 'ILC' }
      ])
    })
    it('chooses dropdown value as field value', () => {
      expect(wrapper.find(Dropdown).prop('value')).toEqual(expiryDate)
    })
    it('displays all options in dropdown', () => {
      expect(wrapper.find(Dropdown.Item).length).toEqual(3)
    })
    it('calls setFieldValue with correct arguments when other dropdown option is changed', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()

      const otherDropdown = wrapper.find(Dropdown.Item).find({ value: availableWith })

      otherDropdown.simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [
        { oldValue: lc[availableWith], op: 'replace', path: keyToPath(availableWith), value: '', type: 'ILC' }
      ])
    })
    it('calls setFieldValue with empty list when close icon clicked', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()

      wrapper
        .find(Icon)
        .find({ name: 'close' })
        .simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [])
    })
    it('matches snapshot', () => {
      expect(renderer.create(fieldSpecifiedJSX).toJSON()).toMatchSnapshot()
    })
    it('makes current field red if there is an error', () => {
      const errors = { expiryDate: 'expiryDate error' }
      expect(
        renderer
          .create(
            <LetterOfCreditAmendmentContext.Provider value={lc}>
              <FormikProvider
                value={fakeFormikContext<ILCAmendmentBase>(
                  {
                    lcStaticId: lc._id,
                    lcReference: lc.reference,
                    version: 1,
                    diffs: [expiryDateAmendment]
                  },
                  { setFieldValue: setFieldValueFunc, errors }
                )}
              >
                <PropertyEditor options={[feesPayableBy, availableWith, expiryDate]} field={expiryDate} index={index} />
              </FormikProvider>
            </LetterOfCreditAmendmentContext.Provider>
          )
          .toJSON()
      ).toMatchSnapshot()
    })
  })
  describe('more than one item specified in letterOfCreditAmendments diff', () => {
    const amendments = [
      fakeLetterOfCreditDiff(),
      fakeLetterOfCreditDiff({
        value: AVAILABLE_WITH_OPTIONS.ADVISING_BANK,
        oldValue: AVAILABLE_WITH_OPTIONS.ISSUING_BANK,
        path: keyToPath(availableWith)
      }),
      fakeLetterOfCreditDiff({ value: 'ok', oldValue: 'not ok', path: keyToPath(invoiceRequirement) })
    ]

    const manyFieldsJsx = (
      <LetterOfCreditAmendmentContext.Provider value={lc}>
        <FormikProvider
          value={fakeFormikContext<ILCAmendmentBase>(
            {
              lcStaticId: lc._id,
              lcReference: lc.reference,
              version: 1,
              diffs: amendments
            },
            { setFieldValue: setFieldValueFunc }
          )}
        >
          <PropertyEditor
            options={[feesPayableBy, availableWith, invoiceRequirement]}
            field={availableWith}
            index={1}
          />
        </FormikProvider>
      </LetterOfCreditAmendmentContext.Provider>
    )
    beforeEach(() => {
      jest.resetAllMocks()

      wrapper = mount(manyFieldsJsx)
    })
    it('calls setFieldValue with the right element removed when remove icon clicked', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()

      wrapper
        .find(Icon)
        .find({ name: 'close' })
        .simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [amendments[0], amendments[2]])
    })
    it('calls setFieldValue with the right element when input is changed', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()

      const otherDropdownChoice = wrapper
        .find(Dropdown.Item)
        .find({ value: AVAILABLE_WITH_OPTIONS.ISSUING_BANK })
        .find({ selected: false })

      otherDropdownChoice.simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [
        amendments[0],
        { ...amendments[1], value: AVAILABLE_WITH_OPTIONS.ISSUING_BANK },
        amendments[2]
      ])
    })
    it('calls setFieldValue with the right element changed when dropdown option is changed', () => {
      expect(setFieldValueFunc).not.toHaveBeenCalled()

      wrapper
        .find(Dropdown.Item)
        .find({ value: feesPayableBy })
        .simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [
        amendments[0],
        { ...amendments[0], value: '', oldValue: lc.feesPayableBy },
        amendments[2]
      ])
    })
    it('calls setFieldValue with the right element when field on PropertyEditor is empty and dropdown item chosen', () => {
      wrapper = mount(
        <LetterOfCreditAmendmentContext.Provider value={lc}>
          <FormikProvider
            value={fakeFormikContext<ILCAmendmentBase>(
              {
                lcStaticId: lc._id,
                lcReference: lc.reference,
                version: 1,
                diffs: amendments
              },
              { setFieldValue: setFieldValueFunc }
            )}
          >
            <PropertyEditor options={[feesPayableBy, availableWith, invoiceRequirement]} index={index} field={''} />
          </FormikProvider>
        </LetterOfCreditAmendmentContext.Provider>
      )

      expect(setFieldValueFunc).not.toHaveBeenCalled()

      wrapper
        .find(Dropdown.Item)
        .find({ value: feesPayableBy })
        .simulate('click')

      expect(setFieldValueFunc).toHaveBeenCalledWith('diffs', [
        {
          ...amendments[0],
          value: '',
          oldValue: lc.feesPayableBy
        },
        amendments[1],
        amendments[2]
      ])
    })
    it('matches snapshot', () => {
      expect(renderer.create(manyFieldsJsx).toJSON()).toMatchSnapshot()
    })
  })
})
