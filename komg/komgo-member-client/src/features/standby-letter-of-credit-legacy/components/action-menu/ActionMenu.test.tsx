import * as React from 'react'
import { buildFakeStandByLetterOfCredit } from '@komgo/types'
import ActionMenu from './ActionMenu'
import { TaskStatus } from '../../../tasks/store/types'
import { findRole, findParticipantCommonNames } from '../../../financial-instruments/utils/selectors'
import renderer from 'react-test-renderer'
import { MemoryRouter as Router } from 'react-router-dom'

describe('ActionMenu', () => {
  let defaultProps

  beforeEach(() => {
    const letter = buildFakeStandByLetterOfCredit({ staticId: '123' })
    defaultProps = {
      letter: {
        ...letter,
        tasks: [],
        actionStatus: TaskStatus.ToDo,
        role: findRole(letter, '123'),
        ...findParticipantCommonNames(letter, [])
      }
    }
  })

  it('should match default snapshot', () => {
    const tree = renderer
      .create(
        <Router>
          <ActionMenu {...defaultProps} />
        </Router>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
