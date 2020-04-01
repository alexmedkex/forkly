import { ILetterOfCredit, IDataLetterOfCredit, ILetterOfCreditBase, IDataLetterOfCreditBase } from '@komgo/types'
import { ImmutableObject } from '../../../utils/types'

export const buildLetterOfCreditBaseFromImmutable = (
  letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>>,
  data: IDataLetterOfCreditBase,
  templateModel: any
): ILetterOfCreditBase<IDataLetterOfCreditBase> => {
  return {
    type: letterOfCredit.get('type'),
    version: letterOfCredit.get('version'),
    templateInstance: {
      version: letterOfCredit.get('templateInstance').get('version'),
      templateStaticId: letterOfCredit.get('templateInstance').get('templateStaticId'),
      template: templateModel,
      templateSchemaId: letterOfCredit.get('templateInstance').get('templateSchemaId'),
      data,
      dataSchemaId: letterOfCredit.get('templateInstance').get('dataSchemaId'),
      bindings: letterOfCredit
        .get('templateInstance')
        .get('bindings')
        .toJS()
    }
  }
}
