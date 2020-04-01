import * as React from 'react'
import * as renderer from 'react-test-renderer'
import CounterpartyBox from './CounterpartyBox'

describe('CounterpartyBox', () => {
  it('should match snapshot', () => {
    expect(
      renderer
        .create(
          <CounterpartyBox>
            <div>Ok</div>
          </CounterpartyBox>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
