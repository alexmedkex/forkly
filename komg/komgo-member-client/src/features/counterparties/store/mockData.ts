import { Counterparty, NotConnectedCounterparty } from './types'
import { fakeCounterparty } from '../../letter-of-credit-legacy/utils/faker'

const counterparties: Counterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company' }),
  fakeCounterparty({ staticId: '2', commonName: 'C Company' }),
  fakeCounterparty({ staticId: '3', commonName: 'N Company' })
]

const requestCounterparties: NotConnectedCounterparty[] = [
  fakeCounterparty({ staticId: '1', commonName: 'A Company' }) as NotConnectedCounterparty,
  fakeCounterparty({ staticId: '2', commonName: 'B Company' }) as NotConnectedCounterparty,
  fakeCounterparty({ staticId: '3', commonName: 'N Company' }) as NotConnectedCounterparty,
  fakeCounterparty({ staticId: '4', commonName: 'O Company' }) as NotConnectedCounterparty
]

export default {
  counterparties,
  requestCounterparties
}
