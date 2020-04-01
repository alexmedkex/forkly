import { IDocumentGenerator } from '@komgo/document-generator'
import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import * as fs from 'fs'
import { inject, injectable } from 'inversify'
import * as path from 'path'

import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'

const OUT_DIR = 'out'

@injectable()
export class DocumentTemplateCompiler {
  private readonly logger = getLogger('DocumentTemplateCompiler')

  constructor(@inject(TYPES.DocumentGenerator) private readonly docGen: IDocumentGenerator) {}

  async compile(template: Buffer, fields: object): Promise<Buffer> {
    const outDir = path.resolve(__dirname, OUT_DIR)
    let filePath: string
    try {
      this.logger.info('DocumentTemplateCompiler', { fields })
      filePath = await this.docGen.generate(template, fields, outDir)
    } catch (e) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.TemplateCompilerError, 'DocumentTemplateCompiler failed', {
        errorMessage: e.message
      })
      if (e.properties && e.properties.rootError) {
        throw new Error(`Failed to generate PDF - ${e.properties.rootError}`)
      }
      throw new Error('Failed to generate PDF - unexpected error')
    }
    return new Promise<Buffer>((resolve, reject) => {
      return fs.readFile(filePath, { encoding: null }, (err, data: Buffer) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}
