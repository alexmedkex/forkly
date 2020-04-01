import * as renderer from 'react-test-renderer'
import * as React from 'react'
import { mount, ReactWrapper } from 'enzyme'

import { IDiff } from '@komgo/types'
import { DiffList, DiffView } from './DiffList'
import { Checkbox, Icon, Label } from 'semantic-ui-react'

describe('DiffList', () => {
  describe('renders', () => {
    it('a few props', () => {
      const operations: IDiff[] = [
        { op: 'replace', path: '/maxTolerance', value: 3, oldValue: 1, type: 'ITrade' },
        { op: 'replace', path: '/minTolerance', value: 1.5, oldValue: 1, type: 'ITrade' }
      ]
      const tree = renderer.create(<DiffList name="list" options={operations} />).toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('a default value', () => {
      const operations: IDiff[] = [
        { op: 'replace', path: '/maxTolerance', value: 3, oldValue: 1, type: 'ITrade' },
        { op: 'replace', path: '/minTolerance', value: 1.5, oldValue: 1, type: 'ITrade' }
      ]
      const tree = renderer.create(<DiffList name="list" options={operations} values={operations.splice(1)} />).toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('a nested prop', () => {
      const operations: IDiff[] = [
        {
          op: 'replace',
          path: '/deliveryPeriod/endDate',
          value: new Date('2021-1-31').toISOString(),
          oldValue: new Date('2020-12-31').toISOString(),
          type: 'ITrade'
        }
      ]
      const tree = renderer.create(<DiffList name="list" options={operations} />).toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('an object prop', () => {
      const options: IDiff[] = [
        {
          op: 'add',
          path: '/parcels/0',
          value: {
            id: '1234',
            laycanPeriod: { startDate: '2019-01-03T13:14:28.025Z', endDate: '2019-01-03T13:14:28.025Z' },
            modeOfTransport: 'VESSEL',
            vesselIMO: 1,
            vesselName: 'Test',
            loadingPort: 'Test',
            dischargeArea: 'Test',
            inspector: 'Test',
            deemedBLDate: '2019-01-03T13:14:28.025Z',
            quantity: 1
          },
          oldValue: undefined,
          type: 'ITrade'
        }
      ]
      const tree = renderer.create(<DiffList name="list" options={options} />).toJSON()
      expect(tree).toMatchSnapshot()
    })

    it('an object with two entities overlapping', () => {
      const options: IDiff[] = [
        { op: 'replace', path: '/sourceId', value: 3, oldValue: 1, type: 'ITrade' },
        { op: 'replace', path: '/sourceId', value: 1.5, oldValue: 1, type: 'ICargo' }
      ]
      const tree = renderer.create(<DiffList name="list" options={options} />).toJSON()
      expect(tree).toMatchSnapshot()
    })
  })

  describe('interaction', () => {
    let wrapper: ReactWrapper
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('select a single value', () => {
      const options: IDiff[] = [
        { op: 'replace', path: '/sourceId', value: 3, oldValue: 1, type: 'ITrade' },
        { op: 'replace', path: '/sourceId', value: 1.5, oldValue: 1, type: 'ICargo' }
      ]

      const onChange = jest.fn()

      wrapper = mount(<DiffList name="list" options={options} onChange={onChange} />)

      wrapper
        .find(Checkbox)
        .first()
        .simulate('click')

      expect(onChange).toHaveBeenCalledWith('list', [options[0]])
    })
  })
})
