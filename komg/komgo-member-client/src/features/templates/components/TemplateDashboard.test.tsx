import * as React from 'react'
import { cleanup, fireEvent, render, RenderResult, wait } from '@testing-library/react'
import { TemplateDashboard, TemplateDashboardProps } from './TemplateDashboard'
import { MemoryRouter as Router } from 'react-router'
import { buildFakeTemplate, buildFakeTemplateBinding, ITemplateBase, TradeSource } from '@komgo/types'
import { fromJS } from 'immutable'
import { createMemoryHistory } from 'history'
import { TEMPLATE_INSTANCE_VERSIONS } from '@komgo/types/dist/template-library/template/TemplateInstanceSchema'
import { EMPTY_TEMPLATE } from '../utils/constants'
import { fakeMember } from '../../letter-of-credit-legacy/utils/faker'
import { EditorTemplatesActionType } from '../store/templates/types'

const globalAsAny = global as any

const originalGetSelection = globalAsAny.window.getSelection

describe('TemplateDashboard', () => {
  const templateBindingStaticId = '52c9ebc4-b4bd-4a1f-b90e-0995df87a40e'
  const templateStaticId = '12fee144-bebf-4042-afcb-414223032d13'
  const memberStaticId = '837aa9d9-e62b-4000-a937-959dd411301c'
  const templateBindingMock = buildFakeTemplateBinding({ staticId: templateBindingStaticId })
  const ownerCompanyStaticId = memberStaticId
  const defaultProps: TemplateDashboardProps = {
    isDeleting: false,
    deletingErrors: [],
    onConfirm: jest.fn(),
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
    createTemplate: jest.fn(),
    isCreating: false,
    creatingErrors: [],
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
          <TemplateDashboard {...defaultProps} />
        </Router>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('crates a new template', async () => {
      const component = render(
        <Router>
          <TemplateDashboard {...defaultProps} />
        </Router>
      )

      fireEvent.mouseOver(component.getByText('Create'))
      await wait(() => {
        fireEvent.click(component.getByText('SBLC'))
      })

      const template: ITemplateBase = {
        version: TEMPLATE_INSTANCE_VERSIONS.V1,
        name: 'Untitled Template',
        commodity: '',
        ownerCompanyStaticId,
        templateBindingStaticId: templateBindingMock.staticId,
        productId: templateBindingMock.productId,
        subProductId: templateBindingMock.subProductId,
        revision: 1,
        template: EMPTY_TEMPLATE
      }
      expect(defaultProps.createTemplate).toHaveBeenCalledWith(template)
    })
    it('opens a template', async () => {
      const component = render(
        <Router>
          <TemplateDashboard {...defaultProps} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`${templateStaticId}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText('Open'))
      })

      expect(defaultProps.history.push).toHaveBeenCalledWith('/templates/12fee144-bebf-4042-afcb-414223032d13')
    })

    it('delete a template', async () => {
      const component = render(
        <Router>
          <TemplateDashboard {...defaultProps} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`${templateStaticId}-dropdown`))
      })
      await wait(() => {
        fireEvent.click(component.getByText('Delete'))
      })

      expect(defaultProps.onConfirm).toHaveBeenCalled()
      const [call] = (defaultProps.onConfirm as any).mock.calls[0]

      expect(call.title).toEqual('Delete Template')
      expect(call.type).toEqual(EditorTemplatesActionType.DELETE_TEMPLATE_REQUEST)
      expect(call.params).toEqual({ staticId: templateStaticId })
      expect(call.message).toBeDefined()
    })
  })

  describe('select view', () => {
    let props
    beforeEach(() => {
      props = {
        ...defaultProps,
        selection: {
          select: true,
          type: 'SBLC',
          redirectTo: `/letters-of-credit/new?source=${TradeSource.Komgo}&sourceId=2a0bd986-be73-4b3f-be91-ebc7ae9b7c7a`
        }
      }
    })

    it('renders', () => {
      const { asFragment } = render(
        <Router>
          <TemplateDashboard {...props} />
        </Router>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('redirects to the sblc', async () => {
      const component = render(
        <Router>
          <TemplateDashboard {...props} />
        </Router>
      )

      await wait(() => {
        fireEvent.click(component.getByTestId(`select-${templateStaticId}`))
      })

      expect(props.history.push).toHaveBeenCalledWith(
        '/letters-of-credit/new?source=KOMGO&sourceId=2a0bd986-be73-4b3f-be91-ebc7ae9b7c7a&templateId=12fee144-bebf-4042-afcb-414223032d13'
      )
    })
  })
})
