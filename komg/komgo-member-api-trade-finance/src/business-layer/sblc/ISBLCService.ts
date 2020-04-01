import { IStandbyLetterOfCreditBase, IStandbyLetterOfCredit } from '@komgo/types'
import IUser from '../IUser'
import { IFile } from '../types/IFile'
import { IDocumentRegisterResponse } from '../documents/IDocumentRegisterResponse'

export interface ISBLCService {
  create(sblc: IStandbyLetterOfCreditBase, user: IUser): Promise<string[]>
  get(id: string): Promise<IStandbyLetterOfCredit>
  issue(sblcStaticId: string, issuingBankReference: string, issuingBankPostalAddress: string, user: IUser, file: IFile)
  rejectRequest(sblcStaticId: string, issuingBankReference: string)
  find(query: object, projection?: object, options?: object): Promise<IStandbyLetterOfCredit[]>
  count(query: object): Promise<number>
  getDocuments(sblc: IStandbyLetterOfCredit, parcelId?: string): Promise<IDocumentRegisterResponse[]>
  getDocumentById(documentId: string): Promise<any>
  getDocumentContent(documentId: string): Promise<any>
}
