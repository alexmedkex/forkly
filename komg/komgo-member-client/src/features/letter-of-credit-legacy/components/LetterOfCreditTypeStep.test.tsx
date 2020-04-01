import * as React from 'react'
import { formikTestProps } from './ParticipantStep.test'
import { shallow } from 'enzyme'
import { LetterOfCreditTypeStep, LetterOfCreditTypeStepProps, Heading } from './LetterOfCreditTypeStep'
import { TEMPLATE_TYPE_OPTIONS } from '../constants'
import { Grade } from '@komgo/types'

const testProps: LetterOfCreditTypeStepProps = {
  formik: formikTestProps
}

const bfoetTradeProps = {
  ...testProps,
  formik: {
    ...testProps.formik,
    values: {
      ...testProps.formik.values,
      templateType: TEMPLATE_TYPE_OPTIONS.KOMGO_BFOET
    }
  }
}

describe('LetterOfCreditTypeStep', () => {
  it('shows the required documents list if BFOET', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} />)
    expect(wrapper.find({ content: 'Required documents' }).length).toEqual(1)
  })

  it('shows the free text input if free text option is selected', () => {
    expect(
      shallow(
        <LetterOfCreditTypeStep
          formik={{
            ...testProps.formik,
            values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT }
          }}
        />
      ).find({ content: 'Required documents' }).length
    ).toEqual(0)
  })

  it('shows the invoice requirement choice for BFOET', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} />)
    expect(wrapper.find({ name: 'invoiceRequirement' }).length).toEqual(1)
  })
  it('shows FIP documents documentation if grade is equal to forties', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} grade={Grade.Forties} />)
    expect(wrapper.find(Heading).contains('Documents for FIP delivery:')).toEqual(true)
  })
  it('shows FIP documents documentation if grade is equal to ekofisk', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} grade={Grade.Ekofisk} />)
    expect(wrapper.find(Heading).contains('Documents for FIP delivery:')).toEqual(true)
  })
  it('shows FIP documents documentation if grade is unset', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} />)
    expect(wrapper.find(Heading).contains('Documents for FIP delivery:')).toEqual(true)
  })
  it('hides FIP documents documentation if grade is set to troll', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} grade={Grade.Troll} />)
    expect(wrapper.find(Heading).contains('Documents for FIP delivery:')).toEqual(false)
  })
  it('hides FIP documents documentation if grade is set to brent', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} grade={Grade.Brent} />)
    expect(wrapper.find(Heading).contains('Documents for FIP delivery:')).toEqual(false)
  })
  it('hides FIP documents documentation if grade is set to oseberg', () => {
    const wrapper = shallow(<LetterOfCreditTypeStep {...bfoetTradeProps} grade={Grade.Oseberg} />)
    expect(wrapper.find(Heading).contains('Documents for FIP delivery:')).toEqual(false)
  })

  describe('templateType field', () => {
    describe('customOnChange', () => {
      describe('we are transitioning from templateType KOMGO_BFOET to FREE_TEXT', () => {
        const setFieldValue = jest.fn()
        beforeAll(() => {
          const wrapper = shallow(
            <LetterOfCreditTypeStep {...bfoetTradeProps} formik={{ ...bfoetTradeProps.formik, setFieldValue }} />
          )
          const customOnChange = wrapper.find({ name: 'templateType' }).prop('customOnChange')
          customOnChange()
        })
        it('calls setFieldValue to clear freeTextLc', () => {
          expect(setFieldValue).toHaveBeenCalledWith('freeTextLc', undefined)
        })
        it('calls setFieldValue to clear LOI', () => {
          expect(setFieldValue).toHaveBeenCalledWith('LOI', undefined)
        })
        it('calls setFieldValue to clear LOIType', () => {
          expect(setFieldValue).toHaveBeenCalledWith('LOIType', undefined)
        })
        it('calls setFieldValue to clear LOIAllowed', () => {
          expect(setFieldValue).toHaveBeenCalledWith('LOIAllowed', undefined)
        })
      })
      describe('we are transitioning from templateType FREE_TEXT to KOMGO_BFOET', () => {
        const setFieldValue = jest.fn()
        beforeAll(() => {
          const wrapper = shallow(
            <LetterOfCreditTypeStep
              {...testProps}
              formik={{
                ...testProps.formik,
                setFieldValue,
                values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT }
              }}
            />
          )
          const customOnChange = wrapper.find({ name: 'templateType' }).prop('customOnChange')
          customOnChange()
        })

        it('calls setFieldValue to clear freeTextLc', () => {
          expect(setFieldValue).toHaveBeenCalledWith('freeTextLc', undefined)
        })
        it('calls setFieldValue to set LOI to the initial form value', () => {
          expect(setFieldValue).toHaveBeenCalledWith('LOI', testProps.formik.initialValues.LOI)
        })
        it('calls setFieldValue to set LOIType to the initial form value', () => {
          expect(setFieldValue).toHaveBeenCalledWith('LOIType', testProps.formik.initialValues.LOIType)
        })
        it('calls setFieldValue to set LOIAllowed to the initial form value', () => {
          expect(setFieldValue).toHaveBeenCalledWith('LOIAllowed', testProps.formik.initialValues.LOIAllowed)
        })
      })
    })
    it('shows the free text form by default', () => {
      const wrapper = shallow(
        <LetterOfCreditTypeStep
          formik={{
            ...testProps.formik,
            values: { ...testProps.formik.values, templateType: TEMPLATE_TYPE_OPTIONS.FREE_TEXT }
          }}
        />
      )
      expect(wrapper.find({ name: 'freeTextLc' }).length).toEqual(1)
    })
  })
})
