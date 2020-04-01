import { ITrade } from '@komgo/types'

export const isApplicantOnTrade = (t: ITrade, company: string): boolean => t.buyer === company
