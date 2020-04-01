import { DOCUMENT_PRODUCT, DOCUMENT_SUB_PRODUCT, DOCUMENT_CATEGORY, DOCUMENT_TYPE } from './documentTypes'
import { ILC } from '../../data-layer/models/ILC'
import { IRegisterDocument } from './IRegisterDocument'
import { IFile } from '../types/IFile'
import { injectable } from 'inversify'
import { IShareDocument } from './IShareDocument'
import { IDocumentEventData } from './IDocumentEventData'
import { IDocumentType } from './IDocumentType'
import IUser from '../IUser'
import * as path from 'path'
import ILCDocument from '../types/ILCDocument'
import { ILCPresentation } from '../../data-layer/models/ILCPresentation'
import { ILCAmendment, IStandbyLetterOfCredit, ILetterOfCredit, IDataLetterOfCredit } from '@komgo/types'

export interface IDocumentRequestBuilder {
  getLCDocumentRequest(lc: ILC, lcDocument: ILCDocument, file: IFile, user: IUser): IRegisterDocument
  getLCPresentationDocumentRequest(
    presentation: ILCPresentation,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser,
    additionalContext?: object
  ): IRegisterDocument
  getLCAmendmentDocumentRequest(
    lc: ILC,
    amendment: ILCAmendment,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser
  ): IRegisterDocument
  getSBLCDocumentRequest(
    sblc: IStandbyLetterOfCredit,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser
  ): IRegisterDocument
  getLetterOfCreditDocumentRequest(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser
  ): IRegisterDocument
  getLCDocumentToShareRequest(lc: ILC, documentId: string, otherParties: string[]): IShareDocument
  getSBLCDocumentToShareRequest(
    sblc: IStandbyLetterOfCredit,
    documentId: string,
    otherParties: string[]
  ): IShareDocument
  buildShareableDocumentRequest(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    documentId: string,
    companies: string[]
  ): IShareDocument
  getTradeDocumentRequest(
    documentData: IDocumentEventData,
    documentType: IDocumentType,
    companyId: string,
    file: IFile,
    user?: IUser
  ): IRegisterDocument
  getLCDocumentContext(lc: ILC, parcelId?: string)
  getSBLCDocumentContext(sblc: IStandbyLetterOfCredit, parcelId?: string)
  getLetterOfCreditDocumentContext(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>)
  getLCDocumentSearchContext(lc: ILC)
  getTradeDocumentContext(vaktId: string)
  getTradeDocumentSearchContext(vaktId: string)
  getPresentationDocumentSearchContext(presentation: ILCPresentation, parcelId?: string)
}

@injectable()
export class DocumentRequestBuilder implements IDocumentRequestBuilder {
  getLCDocumentRequest(lc: ILC, lcDocument: ILCDocument, file: IFile, user?: IUser): IRegisterDocument {
    const docName = lcDocument.name
    const metadata = []
    const commonRequestObject = this.getCommonRequestData(lcDocument, file, user, lc.beneficiaryId, docName, metadata)
    return {
      ...commonRequestObject,
      context: this.getLCDocumentContext(lc, lcDocument.parcelId),
      comment: lcDocument.comment || ''
    }
  }

  getSBLCDocumentRequest(
    sblc: IStandbyLetterOfCredit,
    sblcDocument: ILCDocument,
    file: IFile,
    user?: IUser
  ): IRegisterDocument {
    const docName = sblcDocument.name
    const metadata = []
    const commonRequestObject = this.getCommonRequestData(
      sblcDocument,
      file,
      user,
      sblc.issuingBankId,
      docName,
      metadata
    )
    return {
      ...commonRequestObject,
      context: this.getSBLCDocumentContext(sblc),
      comment: sblcDocument.comment || ''
    }
  }

  getLetterOfCreditDocumentRequest(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser
  ): IRegisterDocument {
    const docName = lcDocument.name
    const metadata = []
    const commonRequestObject = this.getCommonRequestData(
      lcDocument,
      file,
      user,
      letterOfCredit.templateInstance.data.issuingBank.staticId,
      docName,
      metadata
    )
    return {
      ...commonRequestObject,
      context: this.getLetterOfCreditDocumentContext(letterOfCredit)
    }
  }

  getLCAmendmentDocumentRequest(
    lc: ILC,
    amendment: ILCAmendment,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser
  ): IRegisterDocument {
    const docName = file.originalname

    const metadata = [
      {
        name: 'amendmentStaticId',
        value: amendment.staticId
      }
    ]
    const commonRequestObject = this.getCommonRequestData(
      {
        name: docName,
        categoryId: DOCUMENT_CATEGORY.TradeFinanceDocuments,
        typeId: DOCUMENT_TYPE.LC_Amendment
      },
      file,
      user,
      lc.issuingBankId,
      docName,
      metadata
    )
    return {
      ...commonRequestObject,
      context: this.getLCDocumentContext(lc, lcDocument.parcelId),
      comment: lcDocument.comment || ''
    }
  }

  getLCPresentationDocumentRequest(
    presentation: ILCPresentation,
    lcDocument: ILCDocument,
    file: IFile,
    user?: IUser,
    additionalContext?: object
  ): IRegisterDocument {
    const docName = file.originalname || lcDocument.name

    // If vaktId is set deep clone must be done so metadata need to be see to unique field. In case document is uploaded empty metadata will be unique
    const metadata = [
      {
        name: 'presentationId',
        value: presentation.reference
      }
    ]
    const commonRequestObject = this.getCommonRequestData(
      lcDocument,
      file,
      user,
      presentation.beneficiaryId,
      docName,
      metadata
    )
    return {
      ...commonRequestObject,
      context: {
        ...(additionalContext || {}),
        ...this.getPresentationDocumentSearchContext(presentation, lcDocument.parcelId)
      },
      comment: lcDocument.comment || ''
    }
  }

  getTradeDocumentRequest(
    documentData: IDocumentEventData,
    documentType: IDocumentType,
    companyId: string,
    file: IFile,
    user?: IUser
  ): IRegisterDocument {
    const docName = documentData.filename
    const metadata = documentData.metadata
      ? Object.entries(documentData.metadata).map(([k, v]) => ({ name: k, value: v }))
      : []
    const commonRequestObject = this.getCommonRequestData(documentType, file, user, companyId, docName, metadata)
    return {
      ...commonRequestObject,
      context: this.getTradeDocumentContext(documentData.vaktId)
    }
  }

  getLCDocumentToShareRequest(lc: ILC, documentId: string, companies: string[]): IShareDocument {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      documents: [documentId],
      companies
    }
  }

  getSBLCDocumentToShareRequest(sblc: IStandbyLetterOfCredit, documentId: string, companies: string[]): IShareDocument {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      documents: [documentId],
      companies
    }
  }

  buildShareableDocumentRequest(
    letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>,
    documentId: string,
    companies: string[]
  ): IShareDocument {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      documents: [documentId],
      companies
    }
  }

  getLCDocumentContext(lc: ILC, parcelId?: string) {
    const context = {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: DOCUMENT_SUB_PRODUCT.LC,
      lcId: lc.reference
    }

    if (parcelId) {
      return {
        ...context,
        parcelId
      }
    }

    return context
  }

  getSBLCDocumentContext(sblc: IStandbyLetterOfCredit) {
    const context = {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: DOCUMENT_SUB_PRODUCT.LC,
      sblcStaticId: sblc.staticId
    }
    return context
  }

  getLetterOfCreditDocumentContext(letterOfCredit: ILetterOfCredit<IDataLetterOfCredit>) {
    const context = {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: DOCUMENT_SUB_PRODUCT.LC,
      staticId: letterOfCredit.staticId
    }
    return context
  }

  getLCDocumentSearchContext(lc: ILC) {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      lcId: lc.reference.toString()
    }
  }
  getTradeDocumentContext(vaktId: string) {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: DOCUMENT_SUB_PRODUCT.TRADE,
      vaktId
    }
  }
  getTradeDocumentSearchContext(vaktId: string) {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      vaktId
    }
  }
  getPresentationDocumentSearchContext(presentation: ILCPresentation, parcelId?: string) {
    const context = {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      subProductId: DOCUMENT_SUB_PRODUCT.LC,
      lcPresentationStaticId: presentation.staticId
    }

    if (parcelId) {
      return {
        ...context,
        parcelId
      }
    }

    return context
  }

  private getCommonRequestData(
    document: IDocumentType | ILCDocument,
    file: IFile,
    user: IUser,
    companyId: string,
    docName: string,
    metadata: any
  ) {
    return {
      productId: DOCUMENT_PRODUCT.TradeFinance,
      categoryId: document.categoryId,
      typeId: document.typeId,
      owner: {
        firstName: user ? user.firstName : '-',
        lastName: user ? user.lastName : '-',
        companyId
      },
      name: path.basename(docName, path.extname(docName)),
      documentData: file,
      metadata
    }
  }
}
