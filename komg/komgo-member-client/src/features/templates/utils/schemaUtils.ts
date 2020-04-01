import { findLetterOfCreditSchema } from '../../letter-of-credit/utils/findLetterOfCreditSchema'

export const resolveBindings = (
  bindings: { [key: string]: string },
  schemaResolver: (key: string) => any = findLetterOfCreditSchema
): { [key: string]: any } =>
  Object.entries(bindings).reduce(
    (memo, [key, value]) => ({
      ...memo,
      [key]: schemaResolver(value)
    }),
    {}
  )

export const findTemplateBindingType = (schemaId: string) => {
  // FIXME LS until we don't add a templateBiding name
  return schemaId.match(/http:\/\/komgo.io\/schema\/(.*)\/template-bindings/)[1].toUpperCase()
}
