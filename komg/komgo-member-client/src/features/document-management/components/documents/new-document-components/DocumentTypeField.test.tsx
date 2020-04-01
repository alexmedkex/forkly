import { shallow } from 'enzyme'
import * as React from 'react'
import { DocumentTypeField, IProps } from './DocumentTypeField'
import { FormDropdown } from 'semantic-ui-react'

describe('DocumentTypeField component', () => {
  const props: any = {
    formik: {
      values: {
        typeId: 'type'
      },
      setFieldValue: jest.fn(),
      errors: { typeId: 'err' },
      touched: { typeId: 'touched' }
    } as any,
    categoryId: 'TradeFinance',
    documentTypes: [],
    preselectedDocumentType: '',
    disabled: true
  }

  describe('dropdown is disabled', () => {
    beforeEach(() => {
      props.formik.setFieldValue.mockClear()
    })

    it('disabled is set to true in props', () => {
      const wrapper = shallow(<DocumentTypeField {...props} />)

      const propsResult = wrapper
        .find(FormDropdown)
        .dive()
        .props()
      expect(propsResult).toHaveProperty('disabled', true)
    })

    it('disabled undefined in props and categoryId is empty', () => {
      const testProps = { ...props, categoryId: null }
      delete testProps.disabled

      const wrapper = shallow(<DocumentTypeField {...testProps} />)

      const propsResult = wrapper
        .find(FormDropdown)
        .dive()
        .props()
      expect(propsResult).toHaveProperty('disabled', true)
    })
  })

  describe('dropdown is enabled', () => {
    beforeEach(() => {
      props.formik.setFieldValue.mockClear()
    })

    it('disabled undefined in props, categoryId is populated and preseletedDocumentType is an empty string', () => {
      const testProps = { ...props, disabled: undefined, categoryId: 'test' }

      const wrapper = shallow(<DocumentTypeField {...testProps} />)

      const propsResult = wrapper
        .find(FormDropdown)
        .dive()
        .props()
      expect(propsResult).toHaveProperty('disabled', false)
    })

    it('disabled is set to false in props', () => {
      const testProps = { ...props, disabled: false, categoryId: 'test' }

      const wrapper = shallow(<DocumentTypeField {...testProps} />)

      const propsResult = wrapper
        .find(FormDropdown)
        .dive()
        .props()
      expect(propsResult).toHaveProperty('disabled', false)
    })
  })
})
