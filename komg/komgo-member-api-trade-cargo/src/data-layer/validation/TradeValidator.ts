import * as ajv from 'ajv'
import { inject, injectable } from 'inversify'
import { getLogger } from '@komgo/logging'
import { IDocumentServiceClient } from '../../business-layer/documents/DocumentServiceClient'
import { DOCUMENT_CATEGORY, DOCUMENT_PRODUCT } from '../../business-layer/documents/documentTypes'
import { TYPES } from '../../inversify/types'
import { ITrade, ITradeBase, TRADE_SCHEMA, TRADE_SCHEMA_VERSION, TradeSchema, TradingRole } from '@komgo/types'
import keywords = require('ajv-keywords')
import { getTradingRole } from '../../business-layer/validation/utils/index'
import { VALUES } from '../../inversify/values'

export interface ITradeValidator {
  validate(data: ITradeBase & { sourceId: string })
}

@injectable()
export class TradeValidator implements ITradeValidator {
  private readonly logger = getLogger('TradeValidator')
  private readonly validator: ajv.Ajv
  constructor(
    @inject(TYPES.DocumentServiceClient) private readonly documentServiceClient: IDocumentServiceClient,
    @inject(VALUES.CompanyStaticId) private readonly companyStaticId: string
  ) {
    this.validator = new ajv({ allErrors: true, $data: true }).addSchema(TradeSchema).addSchema(TRADE_SCHEMA)
    keywords(this.validator)
  }

  async validate(trade: ITrade) {
    const { minTolerance, maxTolerance } = trade

    const schemaErrors = this.validateSchema(trade)

    let requiredDocTypesErrors
    if (getTradingRole(trade.buyer, trade.seller, this.companyStaticId) === TradingRole.Sale) {
      requiredDocTypesErrors = await this.validateDocumentTypes(trade)
    }

    let errors
    if (schemaErrors) {
      errors = schemaErrors
    }

    if (minTolerance > maxTolerance) {
      const error: ajv.ErrorObject = {
        dataPath: '.minTolerance',
        keyword: 'required',
        message: 'should be less than maxTolerance',
        params: {},
        schemaPath: '#/properties/minTolerance'
      }
      errors = [error]
    }

    if (requiredDocTypesErrors) {
      errors = errors || {}
      Object.assign(requiredDocTypesErrors)
    }

    return errors
  }

  private validateSchema(data: ITrade) {
    const version = data.version
    const schemaId = version === TRADE_SCHEMA_VERSION.V1 ? TradeSchema.$id : (TRADE_SCHEMA as any).$id
    this.logger.info(`trade version: ${version} checking with schema: ${schemaId}`)
    const valid = this.validator.validate(schemaId, { ...data, paymentTermsOptionProvided: !!data.paymentTermsOption })

    if (!valid) {
      return this.validator.errors
    }

    return null
  }

  private async validateDocumentTypes(data: ITrade) {
    if (!data.requiredDocuments) {
      return null
    }

    const result: Array<{ id: string }> = await this.documentServiceClient.getDocumentTypes(
      DOCUMENT_PRODUCT.TradeFinance,
      DOCUMENT_CATEGORY.TradeDocuments
    )

    const invalidDocTypes = data.requiredDocuments.filter(doc => !result.find(r => r.id === doc))

    return invalidDocTypes.length > 0
      ? { requiredDocuments: `Invalid documentTypes: ${invalidDocTypes.join(',')}` }
      : null
  }
}
