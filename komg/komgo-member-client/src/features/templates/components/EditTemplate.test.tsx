import * as React from 'react'
import { render, cleanup, fireEvent, act, wait } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditTemplate, EditTemplateProps } from './EditTemplate'
import { MemoryRouter as Router } from 'react-router'
import { buildFakeTemplate, buildFakeTemplateBinding } from '@komgo/types'
import { fromJS } from 'immutable'
import { buildSelection } from '../utils/selectionUtil'

const globalAsAny = global as any

const originalGetSelection = globalAsAny.window.getSelection

describe('EditTemplate', () => {
  let props: EditTemplateProps

  beforeEach(() => {
    globalAsAny.window.getSelection = jest.fn(() => {
      return {}
    })

    props = {
      template: fromJS(buildFakeTemplate()),
      updateTemplate: jest.fn(),
      getTemplateWithTemplateBindings: jest.fn(),
      isUpdating: false,
      updatingErrors: [],
      templateBinding: fromJS(buildFakeTemplateBinding()),
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
  })

  afterEach(() => {
    globalAsAny.window.getSelection = originalGetSelection
    afterEach(cleanup)
  })

  describe('view', () => {
    it('renders', () => {
      act(() => {
        const { asFragment } = render(
          <Router>
            <EditTemplate {...props} />
          </Router>
        )
        expect(asFragment()).toMatchSnapshot()
      })
    })

    describe('save', () => {
      it('saves the template changes', async () => {
        const newName = 'A new name'
        let component

        act(() => {
          component = render(
            <Router>
              <EditTemplate {...props} />
            </Router>
          )
        })

        act(() => {
          userEvent.type(component.getByLabelText('SBLC:'), newName)
          fireEvent.click(component.getByText('Save'))
        })

        await wait(() => {
          act(() => {
            expect(props.updateTemplate).toHaveBeenCalledWith({
              ...props.template.toJS(),
              name: newName
            })
          })
        })
      })
    })
  })

  describe('selection', () => {
    it('renders', () => {
      const selection = buildSelection(
        '?select=true&redirectTo=%2Fletters-of-credit%2Fnew%3Fsource%3DKOMGO%26sourceId%3Dbf6e713b-53be-4510-9be5-bf47f2171d6b&type=SBLC'
      )
      const { asFragment } = render(
        <Router>
          <EditTemplate {...props} selection={selection} />
        </Router>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    describe('select', () => {
      it('redirect to the sblc', async () => {
        const selection = buildSelection(
          '?select=true&redirectTo=%2Fletters-of-credit%2Fnew%3Fsource%3DKOMGO%26sourceId%3Dbf6e713b-53be-4510-9be5-bf47f2171d6b&type=SBLC'
        )

        let component

        act(() => {
          component = render(
            <Router>
              <EditTemplate {...props} selection={selection} />
            </Router>
          )
        })

        act(() => {
          fireEvent.click(component.getByText('Select'))
        })

        expect(props.history.push).toHaveBeenCalledWith(
          `${selection.redirectTo}&templateId=${props.template.get('staticId')}`
        )
      })
    })
  })
})
