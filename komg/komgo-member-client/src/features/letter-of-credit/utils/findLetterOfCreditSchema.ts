import {
  TRADE_SCHEMA as TRADE_SCHEMA_V2,
  CARGO_SCHEMA as CARGO_SCHEMA_V2,
  COMPANY_BASE_SCHEMA,
  DATA_LETTER_OF_CREDIT_BASE_SCHEMA,
  DATA_LETTER_OF_CREDIT_TEMPLATE_SCHEMA,
  findSchemaById
} from '@komgo/types'

const KNOWN_SCHEMAS = [
  TRADE_SCHEMA_V2,
  CARGO_SCHEMA_V2,
  COMPANY_BASE_SCHEMA,
  DATA_LETTER_OF_CREDIT_BASE_SCHEMA,
  DATA_LETTER_OF_CREDIT_TEMPLATE_SCHEMA
]

export const findLetterOfCreditSchema = (schemaId: string) => {
  const schema = findSchemaById(KNOWN_SCHEMAS, schemaId)
  if (!schema) {
    throw Error(`No schema found for ${schemaId}`)
  }
  return schema
}
