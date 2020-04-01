import * as React from 'react'
import { shallow } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { Accordion } from 'semantic-ui-react'
import SimpleButton from '../../../../components/buttons/SimpleButton'
import Documents from './Documents'
import DocumentsList from './DocumentsList'
import { TRADING_ROLE_OPTIONS, initialTradeData, initialCargoData } from '../../constants'
import { mockDocumentTypes } from '../../../document-management/store/document-types/mock-data'
import { ICreateOrUpdateTrade } from '../../store/types'
import { FormikProps } from 'formik'

const testValues: ICreateOrUpdateTrade = {
  documents: [],
  lawOther: '',
  trade: initialTradeData as any,
  cargo: initialCargoData as any
}

const fakeFormik: FormikProps<ICreateOrUpdateTrade> = {
  values: testValues,
  errors: {},
  touched: {},
  isValidating: false,
  isSubmitting: false,
  submitCount: 0,
  setStatus: () => null,
  setError: () => null,
  setErrors: () => null,
  setSubmitting: () => null,
  setTouched: () => null,
  setValues: () => null,
  setFieldValue: jest.fn(),
  setFieldTouched: () => null,
  setFieldError: () => null,
  validateForm: async () => ({}),
  validateField: async () => ({}),
  resetForm: () => null,
  submitForm: () => null,
  setFormikState: () => null,
  handleSubmit: () => null,
  handleReset: () => null,
  handleBlur: () => () => null,
  handleChange: () => () => null,
  dirty: false,
  isValid: true,
  initialValues: testValues,
  registerField: jest.fn(),
  unregisterField: jest.fn()
}

export const mockDocument = {
  _id: 'document0',
  file: {
    size: 5000
  },
  fileName: 'documentFileName',
  typeId: 'typeId',
  fileType: 'application/pdf'
}

describe('Documents component', () => {
  let defaultProps: any

  beforeEach(() => {
    defaultProps = {
      formik: fakeFormik,
      documentTypes: mockDocumentTypes,
      tradingRole: TRADING_ROLE_OPTIONS.BUYER
    }
  })

  it('should render Documents component sucessfully', () => {
    const wrapper = shallow(<Documents {...defaultProps} />)

    expect(wrapper.exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const tree = renderer.create(<Documents {...defaultProps} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should find attach document button', () => {
    const wrapper = shallow(<Documents {...defaultProps} />)

    const button = wrapper
      .find(Accordion.Content)
      .shallow()
      .find(SimpleButton)
      .first()
      .shallow()

    expect(button.text()).toBe('+ Attach new document')
  })

  it('should find only one simple button', () => {
    const wrapper = shallow(<Documents {...defaultProps} />)

    const buttons = wrapper
      .find(Accordion.Content)
      .shallow()
      .find(SimpleButton)

    expect(buttons.length).toBe(1)
  })

  it('should display documents list if documents array is not empty', () => {
    const documentsValues = { ...defaultProps.formik.values, documents: [mockDocument] }
    const wrapper = shallow(
      <Documents {...defaultProps} formik={{ ...defaultProps.formik, values: { ...documentsValues } }} />
    )

    const documentsList = wrapper
      .find(Accordion.Content)
      .shallow()
      .find(DocumentsList)

    expect(documentsList.length).toBe(1)
  })

  it('should open modal for adding document at right index', () => {
    const wrapper = shallow(<Documents {...defaultProps} />)
    const instance = wrapper.instance() as Documents

    const button = wrapper
      .find(Accordion.Content)
      .shallow()
      .find(SimpleButton)
      .at(0)
    button.simulate('click')

    expect(instance.state.documentModalOpen).toBe(true)
    expect(instance.state.documentIndex).toBe(0)
  })
})
