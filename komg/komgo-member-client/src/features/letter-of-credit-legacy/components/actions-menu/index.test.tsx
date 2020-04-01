import * as renderer from 'react-test-renderer'
import * as React from 'react'
import { mount } from 'enzyme'
import { Dropdown } from 'semantic-ui-react'
import { MemoryRouter as Router } from 'react-router-dom'
import { ActionsMenu } from './index'
import { fakeLetterOfCreditEnriched, fakeTask } from '../../utils/faker'
import { ILetterOfCreditEnriched } from '../../containers/LetterOfCreditDashboard'
import { TaskStatus } from '../../../tasks/store/types'
import { LetterOfCreditTaskType } from '../../constants/taskType'
import { ILetterOfCreditStatus } from '../../types/ILetterOfCredit'
import { Roles } from '../../constants/roles'

// the magic https://github.com/Semantic-Org/Semantic-UI-React/issues/2454#issuecomment-373246622
jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children)

describe('ActionsMenu', () => {
  it('renders everything', () => {
    const lcid = '1234'
    const task = fakeTask({
      summary: 'fake task',
      status: TaskStatus.ToDo,
      type: LetterOfCreditTaskType.REVIEW_APPLICATION,
      actions: [],
      context: {
        type: 'LC',
        id: '123',
        lcid
      },
      assignee: ''
    })
    const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({
      _id: lcid,
      tasks: [task],
      status: ILetterOfCreditStatus.ISSUED
    })
    const openTaskModal = jest.fn()
    expect(
      renderer
        .create(
          <Router>
            <ActionsMenu featureRequestLCAmendment={true} letter={letter} openTaskModal={openTaskModal} />
          </Router>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  describe('LC Amendment', () => {
    it('shows link', () => {
      const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({ status: ILetterOfCreditStatus.ISSUED })
      const openTaskModal = jest.fn()
      expect(
        renderer
          .create(
            <Router>
              <ActionsMenu featureRequestLCAmendment={true} letter={letter} openTaskModal={openTaskModal} />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    it('shows link with role APPLICANT', () => {
      const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({
        status: ILetterOfCreditStatus.ISSUED
      })
      const openTaskModal = jest.fn()
      expect(
        renderer
          .create(
            <Router>
              <ActionsMenu
                featureRequestLCAmendment={true}
                letter={{ ...letter, role: Roles.APPLICANT }}
                openTaskModal={openTaskModal}
              />
            </Router>
          )
          .toJSON()
      ).toMatchSnapshot()
    })

    describe('hides "Request LC Amendment" link ', () => {
      it('with LC status: ILetterOfCreditStatus.REQUEST_REJECTED', () => {
        const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({
          status: ILetterOfCreditStatus.REQUEST_REJECTED
        })
        const openTaskModal = jest.fn()
        expect(
          renderer
            .create(
              <Router>
                <ActionsMenu featureRequestLCAmendment={true} letter={letter} openTaskModal={openTaskModal} />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })
      it('with LC status: ILetterOfCreditStatus.ISSUED_LC_REJECTED', () => {
        const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({
          status: ILetterOfCreditStatus.ISSUED_LC_REJECTED
        })
        const openTaskModal = jest.fn()
        expect(
          renderer
            .create(
              <Router>
                <ActionsMenu featureRequestLCAmendment={true} letter={letter} openTaskModal={openTaskModal} />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })

      it('with LC status: ILetterOfCreditStatus.INITIALISING', () => {
        const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({
          status: ILetterOfCreditStatus.INITIALISING
        })
        const openTaskModal = jest.fn()
        expect(
          renderer
            .create(
              <Router>
                <ActionsMenu featureRequestLCAmendment={true} letter={letter} openTaskModal={openTaskModal} />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })

      it('without role APPLICANT', () => {
        const letter: ILetterOfCreditEnriched = fakeLetterOfCreditEnriched({
          status: ILetterOfCreditStatus.INITIALISING
        })
        const openTaskModal = jest.fn()
        expect(
          renderer
            .create(
              <Router>
                <ActionsMenu
                  featureRequestLCAmendment={true}
                  letter={{ ...letter, role: Roles.ISSUING_BANK }}
                  openTaskModal={openTaskModal}
                />
              </Router>
            )
            .toJSON()
        ).toMatchSnapshot()
      })
    })
  })

  describe('tasks that should be handled in modal', () => {
    const tasks = [
      fakeTask({ type: LetterOfCreditTaskType.REVIEW_PRESENTATION_DISCREPANCIES, context: { type: 'LCPresentation' } })
    ]
    const letter: ILetterOfCreditEnriched = { ...fakeLetterOfCreditEnriched(), tasks }
    const openTaskModal = jest.fn()

    it('should find menu item and call openTaskModal on click', () => {
      const wrapper = mount(
        <Router>
          <ActionsMenu letter={letter} openTaskModal={openTaskModal} />
        </Router>
      )
      wrapper.setState({ open: true })

      const menuItem = wrapper
        .find(Dropdown)
        .find(Dropdown.Item)
        .find({ 'data-test-id': 'open-modal-123' })
        .first()
      menuItem.simulate('click')

      expect(openTaskModal).toHaveBeenCalledWith(tasks[0])
    })
  })
})
