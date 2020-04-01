import { ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface ILetterOfCreditDocumentService {
  shareDocument(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, documentType: string, recipients: string[])
  deleteDocument(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>, documentType: string)
}
