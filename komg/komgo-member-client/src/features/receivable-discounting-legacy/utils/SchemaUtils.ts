import { RequestType, DiscountingType } from '@komgo/types'

export class SchemaUtils {
  public static findDefaultValue = (
    schema: any,
    fieldName: string,
    requestType: RequestType,
    discountingType?: DiscountingType
  ) => {
    // First we check if a contraint exists
    const property = SchemaUtils.findPropertyFromConstraint(schema, fieldName, requestType, discountingType)

    if (property) {
      return property.default
    } else if (schema.properties && schema.properties[fieldName]) {
      // If not found, search in the default properties
      return schema.properties[fieldName].default
    }
  }

  public static getAuthorizedValuesByFieldName = (
    schema: any,
    fieldName: any,
    requestType: RequestType,
    discountingType?: DiscountingType
  ) => {
    // First we check if a contraint exists
    const property = SchemaUtils.findPropertyFromConstraint(schema, fieldName, requestType, discountingType)

    if (property) {
      return property.enum
    } else if (schema.properties && schema.properties[fieldName]) {
      // If not found, search in the default properties
      return schema.properties[fieldName].enum
    }
  }

  private static findPropertyFromConstraint = (
    schema: any,
    fieldName: any,
    requestType: RequestType,
    discountingType?: DiscountingType
  ) => {
    if (schema.allOf) {
      let constraint: any
      if (discountingType) {
        constraint = schema.allOf.find(
          (c: any) =>
            SchemaUtils.hasProperty(c.if.properties, 'requestType', requestType) &&
            SchemaUtils.hasProperty(c.if.properties, 'discountingType', discountingType)
        )
      } else {
        constraint = schema.allOf.find((c: any) => SchemaUtils.hasProperty(c.if.properties, 'requestType', requestType))
      }

      if (constraint && constraint.then.properties[fieldName]) {
        return constraint.then.properties[fieldName]
      }
    }
  }

  private static hasProperty = (properties: any, fieldName: string, fieldValue: any) => {
    return properties && properties[fieldName] && properties[fieldName].const === fieldValue
  }

  private constructor() {}
}
