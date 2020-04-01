import * as React from 'react'
import { shallow } from 'enzyme'
import TradeMovementParcels, { TradeMovementParcelsProps } from '../../trades/components/TradeMovementParcels'

const testProps: TradeMovementParcelsProps = {
  parcels: [
    {
      _id: '12311',
      laycanPeriod: {
        startDate: new Date('2018-09-01T00:00:00.000Z'),
        endDate: new Date('2018-10-01T00:00:00.000Z')
      },
      id: 'jjjj',
      vesselIMO: 1,
      vesselName: 'Andrej',
      loadingPort: 'Banja luka',
      inspector: 'Kenan',
      deemedBLDate: new Date('2018-10-01T00:00:00.000Z'),
      quantity: 3
    }
  ]
}

describe('TradeMovementParcels', () => {
  it('renders trade movement parcels', () => {
    const item = shallow(<TradeMovementParcels {...testProps} />)

    expect(item.findWhere(node => node.key() === '12311 0').props().children[0].props.index).toEqual('12311')
  })
})
