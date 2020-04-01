import { ILCPresentation } from '../../../../../data-layer/models/ILCPresentation'
import { LCPresentationStatus } from '@komgo/types'

export const mockPresentation: ILCPresentation = {
  // _id: 'presentation-id-1',
  beneficiaryId: 'ben',
  applicantId: 'app',
  staticId: '10ba038e-48da-487b-96e8-8d3b99b6d18a',
  issuingBankId: 'issuing',
  nominatedBankId: 'nominated',
  LCReference: '2019-BP-7',
  reference: '1550655884375',
  documents: [
    {
      documentId: 'docid',
      documentTypeId: 'q88',
      documentHash: 'hash',
      dateProvided: new Date()
    }
  ],
  status: LCPresentationStatus.DocumentsPresented
}
