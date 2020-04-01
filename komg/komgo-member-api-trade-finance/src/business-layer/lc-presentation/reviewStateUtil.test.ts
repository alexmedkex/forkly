import {
  resolveCompliantStatus,
  resolveDisrepantStatus,
  resolveAdviseStatus,
  resolveDiscrepanciesAcceptStatus,
  resolveDiscrepanciesRejectStatus
} from './reviewStateUtil'
import { LCPresentationStatus } from '@komgo/types'
const companyId = 'company'

const lcPresentation: any = {
  issuingBankId: companyId,
  status: LCPresentationStatus.DocumentsPresented
}

const lcPresentationWithNominated: any = {
  issuingBankId: 'bank1',
  nominatedBankId: companyId,
  status: LCPresentationStatus.DocumentsPresented
}

describe('reviewStateUtil', () => {
  describe('resolveCompliantStatus', () => {
    describe('for Issuing bank', () => {
      it('should resolve proper status if no nominated bank', () => {
        expect(resolveCompliantStatus(lcPresentation, companyId)).toBe(
          LCPresentationStatus.DocumentsCompliantByIssuingBank
        )
      })

      it('should resolve proper status if has nominated bank', () => {
        const pres = {
          ...lcPresentation,
          nominatedBankId: 'bank2',
          issuingBankId: companyId,
          status: LCPresentationStatus.DocumentsCompliantByNominatedBank
        }
        expect(resolveCompliantStatus(pres, companyId)).toBe(LCPresentationStatus.DocumentsCompliantByIssuingBank)
      })

      it('should fails if invalid LC presentation status and no nominated bank', () => {
        const pres = {
          ...lcPresentation,
          status: LCPresentationStatus.DocumentsCompliantByNominatedBank
        }

        expect(resolveCompliantStatus(pres, companyId)).toEqual({
          error: 'Presentation should be in the "DocumentPresented" state for issuing bank'
        })
      })

      it('should fails if invalid LC presentation status and has nominated bank', () => {
        const pres = {
          ...lcPresentation,
          nominatedBankId: 'bank2',
          status: LCPresentationStatus.DocumentsPresented
        }

        expect(resolveCompliantStatus(pres, companyId)).toEqual({
          error: 'Presentation should be in the "DocumentsCompliantByNominatedBank" state'
        })
      })
    })

    describe('for Nominated bank', () => {
      it('should resolve proper status if nominated bank', () => {
        expect(resolveCompliantStatus(lcPresentationWithNominated, companyId)).toBe(
          LCPresentationStatus.DocumentsCompliantByNominatedBank
        )
      })

      it('should fails if invalid status', () => {
        const pres = {
          ...lcPresentationWithNominated,
          status: LCPresentationStatus.DocumentsAcceptedByApplicant
        }

        expect(resolveCompliantStatus(pres, companyId)).toEqual({
          error: 'Presentation should be in the "DocumentPresented" state for nominated bank'
        })
      })
    })

    it('should fail if not an issuing or nominated bank', () => {
      const pres: any = {
        issuingBankId: 'some',
        nominatedBankId: 'some'
      }
      expect(resolveCompliantStatus(pres, companyId)).toEqual({ error: `Must be issuing or nominated bank` })
    })
  })

  describe('resolveDiscrepantStatus', () => {
    describe('for Issuing bank', () => {
      it('should resolve proper status if no nominated bank', () => {
        expect(resolveDisrepantStatus(lcPresentation, companyId)).toBe(
          LCPresentationStatus.DocumentsDiscrepantByIssuingBank
        )
      })

      it('should resolve proper status if has nominated bank', () => {
        const pres = {
          ...lcPresentation,
          nominatedBankId: 'bank2',
          status: LCPresentationStatus.DocumentsCompliantByNominatedBank
        }
        expect(resolveDisrepantStatus(pres, companyId)).toBe(LCPresentationStatus.DocumentsDiscrepantByIssuingBank)
      })

      it('should fails if invalid LC presentation status and no nominated bank', () => {
        const pres = {
          ...lcPresentation,
          status: LCPresentationStatus.DocumentsCompliantByNominatedBank
        }

        expect(resolveDisrepantStatus(pres, companyId)).toEqual({
          error: 'Presentation should be in the "DocumentPresented" state for issuing bank'
        })
      })

      it('should fails if invalid LC presentation status and has nominated bank', () => {
        const pres = {
          ...lcPresentation,
          nominatedBankId: 'bank2',
          status: LCPresentationStatus.DocumentsPresented
        }

        expect(resolveDisrepantStatus(pres, companyId)).toEqual({
          error: 'Presentation should be in the "DocumentsCompliantByNominatedBank" state'
        })
      })
    })

    describe('for Nominated bank', () => {
      it('should resolve proper status if nominated bank', () => {
        expect(resolveDisrepantStatus(lcPresentationWithNominated, companyId)).toBe(
          LCPresentationStatus.DocumentsDiscrepantByNominatedBank
        )
      })

      it('should fails if invalid status', () => {
        const pres = {
          ...lcPresentationWithNominated,
          status: LCPresentationStatus.DocumentsAcceptedByApplicant
        }

        expect(resolveDisrepantStatus(pres, companyId)).toEqual({
          error: 'Presentation should be in the "DocumentPresented" state for nominated bank'
        })
      })
    })

    it('should fail if not an issuing or nominated bank', () => {
      const pres: any = {
        issuingBankId: 'some',
        nominatedBankId: 'some'
      }
      expect(resolveDisrepantStatus(pres, companyId)).toEqual({ error: `Must be issuing or nominated bank` })
    })
  })

  describe('resolveAdviseStatus', () => {
    it('should resolve proper status if nominated bank', () => {
      expect(resolveAdviseStatus(lcPresentationWithNominated, companyId)).toBe(
        LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
      )
    })

    it('should resolve proper status if issuing bank', () => {
      expect(resolveAdviseStatus(lcPresentation, companyId)).toBe(
        LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank
      )
    })

    it('should fails if invalid status', () => {
      const pres = {
        ...lcPresentationWithNominated,
        status: LCPresentationStatus.DocumentsAcceptedByApplicant
      }

      expect(resolveDisrepantStatus(pres, companyId)).toEqual({
        error: 'Presentation should be in the "DocumentPresented" state for nominated bank'
      })
    })

    it('should fail if not an issuing or nominated bank', () => {
      const pres: any = {
        issuingBankId: 'some',
        nominatedBankId: 'some'
      }
      expect(resolveDisrepantStatus(pres, companyId)).toEqual({ error: `Must be issuing or nominated bank` })
    })
  })

  describe('resolveDiscrepanciesAcceptStatus', () => {
    it('should resolve proper status if advised by nominated bank', () => {
      const presentation: any = {
        issuingBankId: companyId,
        status: LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
      }
      expect(resolveDiscrepanciesAcceptStatus(presentation, companyId)).toBe(
        LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
      )
    })

    it('should resolve proper status if advised by issuing bank', () => {
      const presentation: any = {
        applicantId: companyId,
        status: LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank
      }
      expect(resolveDiscrepanciesAcceptStatus(presentation, companyId)).toBe(
        LCPresentationStatus.DocumentsAcceptedByApplicant
      )
    })

    it('should resolve proper status if accepted by issuing bank', () => {
      const presentation: any = {
        applicantId: companyId,
        nominatedBankId: 'nominatedId',
        status: LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
      }
      expect(resolveDiscrepanciesAcceptStatus(presentation, companyId)).toBe(
        LCPresentationStatus.DocumentsAcceptedByApplicant
      )
    })

    it('should fail if unknow party', () => {
      const presentation: any = {
        applicantId: companyId,
        nominatedBankId: 'nominatedId',
        status: LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
      }

      expect(resolveDiscrepanciesAcceptStatus(presentation, 'unknown')).toEqual({ error: 'Must be applicant' })
    })

    it('should fail if invalid status party', () => {
      const presentation: any = {
        applicantId: companyId,
        nominatedBankId: 'nominatedId',
        status: LCPresentationStatus.DocumentsPresented
      }

      expect(resolveDiscrepanciesAcceptStatus(presentation, companyId)).toEqual({
        error: `Invalid presentation status or party`
      })
    })
  })

  describe('resolveDiscrepanciesRejectStatus', () => {
    it('should resolve proper status if advised by nominated bank', () => {
      const presentation: any = {
        issuingBankId: companyId,
        status: LCPresentationStatus.DiscrepanciesAdvisedByNominatedBank
      }
      expect(resolveDiscrepanciesRejectStatus(presentation, companyId)).toBe(
        LCPresentationStatus.DiscrepanciesRejectedByIssuingBank
      )
    })

    it('should resolve proper status if advised by issuing bank', () => {
      const presentation: any = {
        applicantId: companyId,
        status: LCPresentationStatus.DiscrepanciesAdvisedByIssuingBank
      }
      expect(resolveDiscrepanciesRejectStatus(presentation, companyId)).toBe(
        LCPresentationStatus.DiscrepanciesRejectedByApplicant
      )
    })

    it('should resolve proper status if accepted by issuing bank', () => {
      const presentation: any = {
        applicantId: companyId,
        nominatedBankId: 'nominatedId',
        status: LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
      }
      expect(resolveDiscrepanciesRejectStatus(presentation, companyId)).toBe(
        LCPresentationStatus.DiscrepanciesRejectedByApplicant
      )
    })

    it('should fail if unknow party', () => {
      const presentation: any = {
        applicant: companyId,
        nominatedBankId: 'nominatedId',
        status: LCPresentationStatus.DiscrepanciesAcceptedByIssuingBank
      }

      expect(resolveDiscrepanciesRejectStatus(presentation, 'unknown')).toEqual({ error: 'Must be applicant' })
    })

    it('should fail if invalid status party', () => {
      const presentation: any = {
        applicant: companyId,
        nominatedBankId: 'nominatedId',
        status: LCPresentationStatus.DocumentsPresented
      }

      expect(resolveDiscrepanciesRejectStatus(presentation, companyId)).toEqual({
        error: `Invalid presentation status or party`
      })
    })
  })
})
