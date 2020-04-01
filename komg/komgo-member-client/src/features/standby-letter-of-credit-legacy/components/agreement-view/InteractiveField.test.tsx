import * as React from 'react'
import render from 'react-test-renderer'
import { InteractiveField, InteractiveFieldProps } from './InteractiveField'
import { mount } from 'enzyme'
import { scrollTo } from '../../utils/scrollTo'
jest.mock('../../utils/scrollTo')

const DEFAULT_PROPS: InteractiveFieldProps = {
  name: 'myField',
  fields: [],
  children: null
}

describe('InteractiveField', () => {
  describe('active', () => {
    it('renders', () => {
      expect(
        render.create(
          <InteractiveField name="myField" fields={['myField']}>
            <span>foo</span>
          </InteractiveField>
        )
      ).toMatchSnapshot()
    })
  })

  describe('disabled', () => {
    it('renders', () => {
      expect(
        render.create(
          <InteractiveField name="myField" fields={['anotherField']}>
            <span>[[ foo ]]</span>
          </InteractiveField>
        )
      ).toMatchSnapshot()
    })
  })

  describe('normal', () => {
    it('renders', () => {
      expect(
        render.create(
          <InteractiveField name="myField" fields={['anotherField']}>
            <span>foo</span>
          </InteractiveField>
        )
      ).toMatchSnapshot()
    })
  })

  describe('scrollTo', () => {
    it('scrolls to an element', () => {
      const wrapper = mount(
        <InteractiveField name="myField" fields={['myField']}>
          <span>foo</span>
        </InteractiveField>
      )
      wrapper.find('label').simulate('click')
      expect(scrollTo).toHaveBeenCalledWith('#field_myField')
    })
  })
})
