import React from 'react'
import { IProps, ViewLetterOfCreditTradeContainer } from './ViewLetterOfCreditTradeContainer'
import { createMemoryHistory } from 'history'
import { buildFakeLetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import { v4 } from 'uuid'
import { fromJS } from 'immutable'
import { render } from '@testing-library/react'

const staticId = v4()
const letterOfCredit = buildFakeLetterOfCredit<IDataLetterOfCredit>({ staticId })

describe('ViewLetterOfCreditTradeContainer', () => {
  let testProps: IProps
  beforeEach(() => {
    testProps = {
      isFetching: false,
      isAuthorized: () => true,
      history: createMemoryHistory(),
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
        params: {
          staticId
        }
      },
      staticContext: undefined,
      letterOfCreditStaticId: staticId,
      letterOfCredit: fromJS(letterOfCredit),
      getLetterOfCredit: jest.fn(),
      companyStaticId: 'abc',
      errors: []
    }
  })
  it('matches snapshot', () => {
    const { asFragment } = render(<ViewLetterOfCreditTradeContainer {...testProps} />)

    expect(asFragment()).toMatchSnapshot()
  })
  it('calls getLetterOfCredit when mounted', () => {
    render(<ViewLetterOfCreditTradeContainer {...testProps} />)
    expect(testProps.getLetterOfCredit).toHaveBeenCalledWith(staticId)
  })
})
