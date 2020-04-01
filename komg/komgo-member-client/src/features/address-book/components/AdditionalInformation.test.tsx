import { MemberType, ICompanyRequest } from '@komgo/types'
import * as React from 'react'
import { mount } from 'enzyme'
import * as renderer from 'react-test-renderer'
import { AdditionalInformation, IProps } from './AdditionalInformation'
import { fakeFormikContext } from '../../../store/common/faker'
import { FormikContext, FormikProvider } from 'formik'

const values = {
  x500Name: {
    CN: 'CN',
    PC: 'PC',
    C: 'C',
    STREET: 'STREET',
    L: 'L',
    O: 'O'
  },
  isFinancialInstitution: true,
  hasSWIFTKey: false,
  isMember: true,
  memberType: MemberType.FMS
}

describe('AdditionalInformation', () => {
  let defaultProps: IProps
  let formikContext: FormikContext<ICompanyRequest>

  beforeEach(() => {
    formikContext = fakeFormikContext<ICompanyRequest>(values)

    defaultProps = {
      isModification: true,
      toggleCheckbox: jest.fn(),
      ...fakeFormikContext(values)
    }
  })

  it('should render AdditionalInformation component sucessfully', () => {
    const component = mount(
      <FormikProvider value={formikContext}>
        <AdditionalInformation {...defaultProps} />
      </FormikProvider>
    )
    expect(component.exists()).toBe(true)
  })

  it('should match snapshot', () => {
    const tree = renderer
      .create(
        <FormikProvider value={formikContext}>
          <AdditionalInformation {...defaultProps} />
        </FormikProvider>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('should call toggleCheckbox', () => {
    const component = mount(
      <FormikProvider value={formikContext}>
        <AdditionalInformation {...defaultProps} />
      </FormikProvider>
    )
    component
      .find('[name="isMember"]')
      .first()
      .simulate('change', {}, { checked: true })
    expect(defaultProps.toggleCheckbox).toHaveBeenCalled()
  })
})
