import * as React from 'react'
import { cleanup, fireEvent, render, RenderResult, wait } from '@testing-library/react'

import { MemoryRouter as Router } from 'react-router'
import { buildFakeTemplate, buildFakeTemplateBinding, ITemplateBase, TradeSource } from '@komgo/types'
import { fromJS } from 'immutable'

import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { TemplateDashboardContainer, IProps } from './TemplateDashboardContainer'
import { PermissionFullId } from '../../role-management/store/types'
import { toast } from 'react-toastify'

const globalAsAny = global as any

const originalGetSelection = globalAsAny.window.getSelection

jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('TemplateDashboardContainer', () => {
  const templateBindingStaticId = '52c9ebc4-b4bd-4a1f-b90e-0995df87a40e'
  const templateStaticId = '12fee144-bebf-4042-afcb-414223032d13'
  const memberStaticId = '837aa9d9-e62b-4000-a937-959dd411301c'
  const templateBindingMock = buildFakeTemplateBinding({ staticId: templateBindingStaticId })
  const ownerCompanyStaticId = memberStaticId
  const defaultProps: IProps = {
    isAuthorized: (requiredPerm: PermissionFullId) => true,
    errors: [],
    isFetching: false,
    isDeleting: false,
    isSaving: false,
    clearError: jest.fn(),
    requests: fromJS({}),
    savingErrors: [],
    fetchTemplateBindings: jest.fn(),
    fetchTemplates: jest.fn(),
    createTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    allErrors: fromJS({}),
    deletingErrors: [],
    templateBindings: fromJS({
      [templateBindingStaticId]: templateBindingMock
    }),
    templates: fromJS({
      [templateStaticId]: buildFakeTemplate({ staticId: templateStaticId, ownerCompanyStaticId })
    }),
    members: fromJS({
      [memberStaticId]: fakeMember({ staticId: memberStaticId })
    }),
    ownerCompanyStaticId,
    history: { push: jest.fn() } as any,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: ''
    },
    match: {
      isExact: true,
      path: '',
      url: '',
      params: null
    },
    staticContext: undefined
  }

  afterEach(() => {
    afterEach(cleanup)
  })

  describe('default view', () => {
    it('renders', () => {
      const { asFragment } = render(
        <Router>
          <TemplateDashboardContainer {...defaultProps} />
        </Router>
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('confirm', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      toast.success = jest.fn()
    })

    it('delete a template', async () => {
      const component = render(
        <Router>
          <TemplateDashboardContainer {...defaultProps} />
        </Router>
      )

      const initial = component.asFragment()

      await wait(() => {
        fireEvent.click(component.getByTestId(`${templateStaticId}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText('Delete'))
      })

      expect(initial).toMatchDiffSnapshot(component.asFragment())

      await wait(() => {
        fireEvent.click(component.getByText('Confirm'))
      })

      expect(defaultProps.deleteTemplate).toHaveBeenCalledWith({ staticId: '12fee144-bebf-4042-afcb-414223032d13' })
    })
  })
})
