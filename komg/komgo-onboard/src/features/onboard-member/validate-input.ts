import { KomgoEntity } from '../../entities'
import { logger } from '../../utils'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import fs from 'fs'
import { VaktOnlyKomgoEntity } from '../../entities/vakt-only-komgo-entity'

export const validateAll = async (jsonFileName: string, vaktOnly: boolean = false): Promise<any> => {
  const json: string = fs.readFileSync(jsonFileName, 'utf8')

  logger.debug('JSON content: ' + json)

  const jsonInput = JSON.parse(json)
  let validationsResults
  const validations = jsonInput.map(async element => {
    const komgoEntity: KomgoEntity | VaktOnlyKomgoEntity = vaktOnly
      ? plainToClass(VaktOnlyKomgoEntity, element as VaktOnlyKomgoEntity)
      : plainToClass(KomgoEntity, element as KomgoEntity)

    const result = await validation(komgoEntity)

    if (!validationsResults && !result) {
      validationsResults = result
    }
  })
  await Promise.all(validations)

  if (validationsResults === undefined) {
    return jsonInput
  }
  if (validationsResults === false) {
    process.exit(1)
  }
}

export const validation = async (entity: object): Promise<boolean> => {
  const validationResults = await validate(entity)

  if (validationResults && validationResults.length > 0) {
    logger.error(`There are some errors in the JSON file`)
    validationResults.forEach(field => {
      if (field.constraints) {
        Object.keys(field.constraints).forEach(key => logger.error(`${field.constraints[key]} for entity `, entity))
      }
      if (!field.children) return
      field.children.forEach(children => {
        if (!children.children) return
        children.children.forEach(grandchildren => {
          Object.keys(grandchildren.constraints).forEach(key =>
            logger.error(
              `${field.property} => ${children.property} => ${grandchildren.constraints[key]} for entity `,
              entity
            )
          )
        })
        if (children.constraints) {
          Object.keys(children.constraints).forEach(key =>
            logger.error(`${field.property} => ${children.constraints[key]} for entity `, entity)
          )
        }
      })
    })
    return false
  }

  return true
}
