import { ILC } from '../../data-layer/models/ILC'
import { ILCAmendment, IStandbyLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'
import IUser from '../IUser'
import { IFile } from '../types/IFile'
import ILCDocument from '../types/ILCDocument'
import { IDocumentRegisterResponse } from './IDocumentRegisterResponse'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'

export default interface IDocumentService {
  registerLcDocument(
    lc: ILC,
    lcDocument: ILCDocument,
    swiftLCDocument: IFile,
    user: IUser
  ): Promise<IDocumentRegisterResponse>
  registerLcPresentationDocument(
    lc: ILC,
    presentation: ILCPresentation,
    lcDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: object
  ): Promise<IDocumentRegisterResponse>
  registerLCAmendmentDocument(
    lc: ILC,
    amendment: ILCAmendment,
    lcDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: object
  ): Promise<IDocumentRegisterResponse>
  registerSBLCIssuingDocument(
    sblc: IStandbyLetterOfCredit,
    sblcDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: object
  )
  registerLetterOfCreditIssuingDocument(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    issuingDocument: ILCDocument,
    file: IFile,
    user: IUser,
    additionalContext?: object
  )
}
