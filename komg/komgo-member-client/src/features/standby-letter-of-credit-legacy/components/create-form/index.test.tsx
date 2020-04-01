import * as React from 'react'
import { mount, shallow } from 'enzyme'
import { Field } from 'formik'
import { MemoryRouter as Router } from 'react-router-dom'
import * as renderer from 'react-test-renderer'
import { CreateForm, CreateFormProps } from './index'
import { fakeCounterparty, fakeMember } from '../../../letter-of-credit-legacy/utils/faker'
import {
  IStandbyLetterOfCreditBase,
  TradeSource,
  DuplicateClause,
  CompanyRoles,
  Currency,
  Fee,
  buildFakeStandByLetterOfCreditBase
} from '@komgo/types'
import { Dropdown } from 'semantic-ui-react'
import { scrollTo } from '../../utils/scrollTo'
jest.mock('../../utils/scrollTo')

describe('CreateForm', () => {
  let props: CreateFormProps

  beforeEach(() => {
    props = {
      initialValues: buildFakeStandByLetterOfCreditBase({
        tradeId: { source: TradeSource.Komgo, sourceId: '55918db4-8a94-495c-a9b3-0aafebc74328' },
        issuingBankId: undefined,
        beneficiaryBankId: undefined,
        beneficiaryBankRole: undefined,
        amount: 1000,
        currency: Currency.USD,
        contractReference: undefined,
        contractDate: undefined,
        duplicateClause: DuplicateClause.Yes,
        expiryDate: undefined,
        additionalInformation: undefined,
        overrideStandardTemplate: 'Default legal template clauses',
        availableWith: CompanyRoles.IssuingBank,
        feesPayableBy: Fee.Split
      }),
      onSubmit: jest.fn(),
      onChange: jest.fn(),
      issuingBanks: [
        fakeCounterparty({ staticId: 'abc1111', commonName: 'bank1', isMember: true, isFinancialInstitution: true }),
        fakeCounterparty({ staticId: 'abc2222', commonName: 'bank2', isMember: true, isFinancialInstitution: true }),
        fakeCounterparty({ staticId: 'abc3333', commonName: 'bank3', isMember: true, isFinancialInstitution: true })
      ],
      beneficiaryBanks: [
        fakeMember({ staticId: 'abc1111', commonName: 'bank1', isMember: true, isFinancialInstitution: true }),
        fakeMember({ staticId: 'abc2222', commonName: 'bank2', isMember: true, isFinancialInstitution: true }),
        fakeMember({ staticId: 'abc3333', commonName: 'bank3', isMember: true, isFinancialInstitution: true })
      ]
    }
  })

  describe('render', () => {
    it('shows the default values', () => {
      Date.now = jest.fn(() => 1487076708000)

      expect(
        renderer
          .create(
            <Router>
              <CreateForm {...props} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })
  })

  describe('scrollTo', () => {
    it('scrolls to contractReference label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('input[id="field_contractReference"]').simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_contractReference')
    })

    it('scrolls to contractDate label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('input[id="field_contractDate"]').simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_contractDate')
    })

    it('scrolls to issuingBankId label', done => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('div[name="issuingBankId"]').simulate('focus')
      setTimeout(() => {
        expect(scrollTo).toHaveBeenCalledWith('#preview_issuingBankId')
        done()
      }, 0)
    })

    it('scrolls to amount label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('input[id="field_amount"]').simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_amount')
    })

    it('scrolls to expiryDate label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('input[id="field_expiryDate"]').simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_expiryDate')
    })

    it('scrolls to feesPayableBy label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find(`div[data-test-id="feesPayableBy_${Fee.Applicant}"]`).simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_feesPayableBy')
    })

    it('scrolls to duplicateClause label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find(`div[data-test-id="duplicateClause_${DuplicateClause.Yes}"]`).simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_duplicateClause')
    })

    it('scrolls to overrideStandardTemplate label', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('textarea[id="field_overrideStandardTemplate"]').simulate('focus')
      expect(scrollTo).toHaveBeenCalledWith('#preview_overrideStandardTemplate')
    })
  })

  describe('onSubmit', () => {
    it('sends the value collected', done => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper.find('form').simulate('submit')

      setTimeout(() => {
        expect(props.onSubmit).toHaveBeenCalledWith(props.initialValues)
        done()
      })
    })
  })

  describe('onChange', () => {
    it('types a contractReference', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const value = 'REF-123'
      wrapper
        .find('input[name="contractReference"]')
        .simulate('change', { target: { value, name: 'contractReference' } })

      expect(wrapper.find('input[name="contractReference"]').prop('value')).toEqual(value)

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        contractReference: value
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    it('types a contractDate', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const value = '2019-04-01'
      wrapper.find('input[name="contractReference"]').simulate('change', { target: { value, name: 'contractDate' } })

      expect(wrapper.find('input[name="contractDate"]').prop('value')).toEqual(value)

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        contractDate: value
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    it('selects an issuingBank', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper
        .find(Field)
        .find({ name: 'issuingBankId' })
        .find(Dropdown.Item)
        .first()
        .simulate('click')

      expect(
        wrapper
          .find({ name: 'issuingBankId' })
          .find(Dropdown)
          .prop('value')
      ).toEqual('abc1111')

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        issuingBankId: 'abc1111'
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    // TODO LS removed from the scope
    it.skip('selects a beneficiaryBank', () => {
      const wrapper = mount(<CreateForm {...props} />)
      wrapper
        .find(Field)
        .find({ name: 'beneficiaryBankId' })
        .find(Dropdown.Item)
        .at(2)
        .simulate('click')

      expect(
        wrapper
          .find({ name: 'beneficiaryBankId' })
          .find(Dropdown)
          .prop('value')
      ).toEqual('abc2222')

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        beneficiaryBankId: 'abc2222'
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })
    it('set an expiryDate', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const today = '2019-04-01'
      wrapper.find('input[name="expiryDate"]').simulate('change', { target: { value: today, name: 'expiryDate' } })

      expect(wrapper.find('input[name="expiryDate"]').prop('value')).toEqual(today)

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        expiryDate: today
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    it('selects a fee', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const value = Fee.Applicant

      wrapper.find(`div[data-test-id="feesPayableBy_${value}"]`).simulate('click')

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        feesPayableBy: value
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    it('selects duplicate clause', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const value = DuplicateClause.No

      wrapper.find(`div[data-test-id="duplicateClause_${value}"]`).simulate('click')

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        duplicateClause: value
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    it('types a custom template', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const value = 'custom template'
      wrapper
        .find('textarea[name="overrideStandardTemplate"]')
        .simulate('change', { target: { value, name: 'overrideStandardTemplate' } })

      expect(wrapper.find('textarea[name="overrideStandardTemplate"]').prop('value')).toEqual(value)

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        overrideStandardTemplate: value
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })

    it('types an additional information', () => {
      const wrapper = mount(<CreateForm {...props} />)
      const value = 'additional information'
      wrapper
        .find('textarea[name="additionalInformation"]')
        .simulate('change', { target: { value, name: 'additionalInformation' } })

      expect(wrapper.find('textarea[name="additionalInformation"]').prop('value')).toEqual(value)

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        additionalInformation: value
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })
  })

  describe('onBlur', () => {
    it('updates amount', () => {
      const wrapper = mount(<CreateForm {...props} />)

      wrapper
        .find('input[name="amount"]')
        .simulate('focus')
        .simulate('change', {
          target: { value: '100000' }
        })
        .simulate('blur')

      expect(wrapper.find('input[name="amount"]').prop('value')).toEqual('100,000.00')

      const letter: IStandbyLetterOfCreditBase = {
        ...props.initialValues,
        amount: 100000
      }

      expect(props.onChange).toHaveBeenCalledWith(letter)
    })
    describe('validation error', () => {
      it('is shown if the contractReference is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('input[name="contractReference"]')
          .simulate('change', { target: { value: '', name: 'contractReference' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="contractReference-error"]').text()).not.toEqual('')
          done()
        })
      })
      // TODO RR NOT SURE WHY IT DOESN'T WORK
      it.skip('shows the card at the top if a mandatory field is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('input[name="contractReference"]')
          .simulate('change', { target: { value: '', name: 'contractReference' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="requiredFieldPrompt"]').text()).toEqual(
            'Please complete all required fields'
          )
          done()
        })
      })
      it('is shown if the contractDate is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('input[name="contractDate"]')
          .simulate('change', { target: { value: '', name: 'contractDate' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="contractDate-error"]').text()).not.toEqual('')
          done()
        })
      })
      it('is shown if the issuingBankId is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('div[name="issuingBankId"]')
          .simulate('change', { target: { value: '', name: 'issuingBankId' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="issuingBankId-error"]').text()).not.toEqual('')
          done()
        })
      })
      it('is shown if the amount is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('input[name="amount"]')
          .simulate('change', { target: { value: '', name: 'amount' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="amount-error"]').text()).not.toEqual('')
          done()
        })
      })
      it('is shown if the expiryDate is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('input[name="expiryDate"]')
          .simulate('change', { target: { value: '', name: 'expiryDate' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="expiryDate-error"]').text()).not.toEqual('')
          done()
        })
      })
      it('is shown if the expiryDate is is the past', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('input[name="expiryDate"]')
          .simulate('change', { target: { value: '2017-04-10', name: 'expiryDate' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="expiryDate-error"]').text()).not.toEqual('')
          done()
        })
      })
      it('is shown if the overrideStandardTemplate is left empty', done => {
        const wrapper = mount(<CreateForm {...props} />)
        wrapper
          .find('textarea[name="overrideStandardTemplate"]')
          .simulate('change', { target: { value: '', name: 'overrideStandardTemplate' } })
          .simulate('blur')

        setTimeout(() => {
          expect(wrapper.find('div[data-test-id="overrideStandardTemplate-error"]').text()).not.toEqual('')
          done()
        })
      })
    })
  })
})
