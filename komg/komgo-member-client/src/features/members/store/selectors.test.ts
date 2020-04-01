import { IMember } from './types'
import { isMemberKomgo } from './selectors'

describe('isMemberKomgo', () => {
  const member: IMember = {
    staticId: '0000',
    isMember: true,
    isFinancialInstitution: false,
    hasSWIFTKey: false,
    vaktStaticId: 'V234',
    x500Name: {
      CN: 'Some Comp',
      O: 'Some Comp',
      C: 'country',
      L: 'city',
      STREET: 'street',
      PC: 'postal code'
    }
  }

  it('should return true for Komgo', () => {
    const komgo = {
      ...member,
      x500Name: {
        ...member.x500Name,
        CN: 'Komgo SA',
        O: 'Komgo SA'
      }
    }

    expect(isMemberKomgo(komgo)).toBeTruthy()
  })

  it('should return false if not Komgo', () => {
    expect(isMemberKomgo(member)).toBeFalsy()
  })

  it('should return false if no x500Name', () => {
    const data = {
      ...member
    }

    delete data.x500Name

    expect(isMemberKomgo(member)).toBeFalsy()
  })

  it('should return false if no x500Name.O', () => {
    const data = {
      ...member
    }

    delete data.x500Name.O

    expect(isMemberKomgo(member)).toBeFalsy()
  })
})
