import { IMember } from './types'

export const isMemberKomgo = (member: IMember) =>
  // temporary solution, until ENS extended with new attribute
  member.x500Name && member.x500Name.O && member.x500Name.O.toLowerCase().includes('komgo')
