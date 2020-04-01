import * as React from 'react'
import { shallow } from 'enzyme'
import TradeMovements, { TradeMovementsProps } from '../../trades/components/TradeMovements'
import { TradeSource } from '@komgo/types'

const testProps: TradeMovementsProps = {
  cargos: [
    {
      _id: '5bc6ef51029a130236b47d95',
      source: TradeSource.Vakt,
      sourceId: '55555e55556',
      status: 'TO_BE_FINANCED',
      cargoId: '5555aaa5aax',
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
      ],
      grade: 'ok',
      createdAt: '',
      updatedAt: ''
    }
  ]
}

describe('TradeMovements', () => {
  it('renders trade movements', () => {
    const item = shallow(<TradeMovements {...testProps} />)
    const children = item.find('div').props().children as any
    expect(children[0].key).toEqual('5bc6ef51029a130236b47d95')
  })
})
