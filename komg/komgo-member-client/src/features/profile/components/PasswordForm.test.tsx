import * as React from 'react'
import { mount } from 'enzyme'
import { MemoryRouter as Router } from 'react-router-dom'
import * as renderer from 'react-test-renderer'
import PasswordForm, { IProps } from './PasswordForm'

const defaultProps: IProps = {
  errors: [
    {
      message: '',
      errorCode: '1',
      requestId: '',
      origin: '',
      fields: {
        data: {
          currentPassword: ['']
        } as any
      }
    }
  ],
  resetPassword: jest.fn()
}

describe('PasswordForm', () => {
  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <Router>
          <PasswordForm {...defaultProps} />
        </Router>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should call resetPassword onSubmit', done => {
    const wrapper = mount(
      <Router>
        <PasswordForm {...defaultProps} />
      </Router>
    )
    const values = {
      currentPassword: 'Qazwsx123!!!',
      newPassword: 'QazWsx123!!!',
      confirmNewPassword: 'QazWsx123!!!'
    }

    wrapper
      .find('input[name="currentPassword"]')
      .simulate('change', { target: { value: 'Qazwsx123!!!', name: 'currentPassword' } })
    wrapper
      .find('input[name="newPassword"]')
      .simulate('change', { target: { value: 'QazWsx123!!!', name: 'newPassword' } })
    wrapper
      .find('input[name="confirmNewPassword"]')
      .simulate('change', { target: { value: 'QazWsx123!!!', name: 'confirmNewPassword' } })
    wrapper.find('form').simulate('submit')

    setTimeout(() => {
      expect(defaultProps.resetPassword).toHaveBeenCalledWith(values)
      done()
    })
  })

  describe('validation', () => {
    it('should show error if field is empty', done => {
      const wrapper = mount(
        <Router>
          <PasswordForm {...defaultProps} />
        </Router>
      )

      wrapper
        .find('input[name="currentPassword"]')
        .simulate('change', { target: { value: '', name: 'currentPassword' } })
        .simulate('blur')

      setTimeout(() => {
        expect(
          wrapper
            .find('Formik')
            .update()
            .find('MultiErrorMessage')
            .prop('messages')
        ).toEqual(["'Current password' should not be empty"])
        done()
      })
    })

    it('should show error if field not match validation rules', done => {
      const wrapper = mount(
        <Router>
          <PasswordForm {...defaultProps} />
        </Router>
      )

      wrapper
        .find('input[name="newPassword"]')
        .simulate('change', { target: { value: 'newPassword!', name: 'newPassword' } })
        .simulate('blur')

      setTimeout(() => {
        expect(
          wrapper
            .find('Formik')
            .update()
            .find('MultiErrorMessage')
            .prop('messages')
        ).toEqual(['Password must contain at least 1 numerical digits'])
        done()
      })
    })

    it('should show error if passwords not match', done => {
      const wrapper = mount(
        <Router>
          <PasswordForm {...defaultProps} />
        </Router>
      )

      wrapper
        .find('input[name="newPassword"]')
        .simulate('change', { target: { value: 'QazWsx123!!!', name: 'newPassword' } })
        .simulate('blur')
      wrapper
        .find('input[name="confirmNewPassword"]')
        .simulate('change', { target: { value: 'QazWsx123!!!!', name: 'confirmNewPassword' } })
        .simulate('blur')

      setTimeout(() => {
        expect(
          wrapper
            .find('Formik')
            .update()
            .find('MultiErrorMessage')
            .prop('messages')
        ).toEqual(['Passwords must match'])
        done()
      })
    })
  })
})
